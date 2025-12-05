import datetime
from io import BytesIO
import io
import shutil
import time
from flask import request, Blueprint, current_app, send_file
import os, json
import requests, zipfile
from Utilities import get_app_key, get_error_message


EntityBP = Blueprint('EntityBP', __name__)


@EntityBP.route('/<entity_type>/<entity_name>', methods=['GET'])
def exporter(server_name, entity_type, entity_name):
    server_name = server_name
    entity_name = entity_type
    entity_type = entity_type

    app_key = get_app_key(server_name, True)

    url = f"{app_key['BaseURL']}/Thingworx/Exporter/{entity_type}/{entity_name}?forSourceControl=true"
    headers = {
        'appKey': app_key["AppKey"],
        'Accept': 'text/xml',
        'Content-Type': 'application/json',
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return send_file(
            BytesIO(response.content), 
            mimetype='application/xml', 
            as_attachment=True, 
            download_name=response.headers["Content-Disposition"].split(";")[1].split("filename=")[1].replace('"', "")
        )

    else:
        return get_error_message(response.status_code)



@EntityBP.route('/Entities', methods=['GET'])
def get_entity_list(server_name):
    project_name = request.args.get('ProjectName', '')
    start_date = request.args.get('StartDate', '')
    
    limit = int(request.args.get('limit', 100))
    offset = int(request.args.get('offset', 0))
    max_items = offset + limit
    print(f"Limit: {limit} | Offset: {offset} | max_items: {max_items}")

    app_key = get_app_key(server_name, True)
    

    headers = {
        'appKey': app_key["AppKey"],
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

    url = f"{app_key['BaseURL']}/Thingworx/Resources/SearchFunctions/Services/SpotlightSearch"
    payload = {
        "startDate": start_date.strip() if start_date else '',
        "aspects": {
            "isSystemObject": 'false'
        },
        "isAscending": 'false',
        "projectName": app_key["ProjectName"],
        "maxItems": max_items,
        "searchExpression": "**",
        "searchText": "",
        "showSystemObjects": 'false',
        "sortBy": "lastModifiedDate",
        "tags": [],
        "thingShapes": {},
        "thingTemplates": {},
        "types": {
            "items": [
                "Thing",
                "ThingShape",
                "ThingTemplate",
                "ThingGroup",
                "DataShape",
                "Network",
                "ModelTagVocabulary",
                "Mashup",
                "Menu",
                "MediaEntity",
                "StyleDefinition",
                "StyleTheme",
                "StateDefinition",
                "DataTagVocabulary",
                "Group",
                "User",
                "ApplicationKey",
                "Resource",
                "Organization",
                "Dashboard",
                "PersistenceProvider",
                "LocalizationTable",
                "Project",
                "NotificationDefinition",
                "DirectoryService"
            ]
        }
    }

    if current_app.config["use_mock_provider"]:
        with open('MockData/MockResponse.json', 'r') as file:
            data = json.load(file)
        rows: object = data["rows"]
        response_objct = {
            '$top': offset + len(rows),
            '$limit': limit,
            '$count': len(rows),
            'data': rows
        }
        
        return response_objct, 200, { 'Content-Type': 'application/json;charset=UTF-8' }
    else:
        try:
            print(f"Headers: {headers} | URL:  {url}")
            response = requests.post(url, json=payload, headers=headers, timeout=current_app.config["requests_timeout"])

            if response.status_code == 200:
                response_data = json.loads(response.text)
                paginated = response_data['rows'][offset:max_items]
                response_objct = {
                    '$top': offset + len(paginated),
                    '$limit': limit,
                    '$count': len(paginated),
                    'data': paginated
                }
                
                return response_objct, 200, { 'Content-Type': 'application/json;charset=UTF-8' }

        except requests.exceptions.Timeout:
            print('ERROR: Request timed out!')
            return get_error_message(500)
        
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return get_error_message(999)
            
        else:
            return get_error_message(response.status_code)

@EntityBP.route('/DownloadEntities', methods=['GET'])
def download_entities(server_name):
    project_name = request.args.get('ProjectName', '')
    start_date = request.args.get('StartDate', '')
    
    app_key = get_app_key(server_name, True)
    print(f"App Key: {app_key}")

    file_repo = request.args.get('FileRepository', 'SystemRepository')
    file_path = request.args.get('SourcePath', '/SourceControl')
    file_name = request.args.get('FileName', f'SourceControl_{datetime.datetime.now().strftime("%Y-%m-%d")}')
    
    move_to_repo = request.args.get('MoveToSourceControl', True)
    cleanup_tempfiles = request.args.get('CleanupTempFolders', True)
    
    headers = {
        'appKey': app_key["AppKey"],
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }

    url = f"{app_key['BaseURL']}/Thingworx/Resources/SourceControlFunctions/Services/ExportSourceControlledEntitiesToZipFile"
    payload = {
        "name": file_name,
        "projectName": project_name,
        "repositoryName": file_repo, # repository_name if repository_name != "" else "SystemRepository",
        "startDate": start_date,
        "path": file_path
    }

    try:
        requests.post(url, json=payload, headers=headers, timeout=2)
        time.sleep(1)
        response = requests.get(f"{app_key['BaseURL']}/Thingworx/FileRepositoryDownloader?download-repository={file_repo}&directRender=true&download-path={file_path}/{file_name}.zip", headers=headers)

    except requests.exceptions.Timeout:
        print('ERROR: Request timed out!')
        return get_error_message(500)
    
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return get_error_message(999)

    z = zipfile.ZipFile(io.BytesIO(response.content))
    target_path = os.path.join('data', server_name)
    download_to = os.path.join(target_path, 'TempDir')
    z.extractall(download_to)
    if(move_to_repo):
        move_to_source_control(target_path, cleanup_tempfiles)

    if response.status_code == 200:
        return send_file(
            BytesIO(response.content), 
            mimetype='application/zip', 
            as_attachment=True, 
            download_name= f"{file_name}.zip"
        ) # str(soup.prettify()).encode('utf-8')

    else:
        return get_error_message(response.status_code)


@EntityBP.route('/ExportToSourceControl', methods=['GET', 'POST'])
def export_to_source_control():
    if request.method == 'POST':
        file_repo = request.args.get('FileRepository', 'SystemRepository')
        file_path = request.args.get('SourcePath', '/SourceControl')
        file_name = request.args.get('FileName', f'SourceControl_{datetime.datetime.now().strftime("%Y-%m-%d")}')


        server_name = request.args.get('ServerName', '')
        project_name = request.args.get('ProjectName', '')
        start_date = request.args.get('StartDate', '')
        
        move_to_repo = request.args.get('MoveToSourceControl', True)
        cleanup_tempfiles = request.args.get('CleanupTempFolders', False)
        
        app_key = get_app_key(server_name, True)

        headers = {
            'appKey': app_key["AppKey"],
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }

        url = f"{app_key['BaseURL']}/Thingworx/Resources/SourceControlFunctions/Services/ExportSourceControlledEntitiesToZipFile"
        payload = {
            "name": file_name,
            "projectName": project_name,
            "repositoryName": file_repo,
            "startDate": start_date,
            "path": file_path
        }

        try:
            requests.post(url, json=payload, headers=headers, timeout=2)
            time.sleep(1)
            response = requests.get(f"{app_key['BaseURL']}/Thingworx/FileRepositoryDownloader?download-repository={file_repo}&directRender=true&download-path={file_path}/{file_name}.zip", headers=headers)
            
        except requests.exceptions.Timeout:
            print('ERROR: Request timed out!')
            return get_error_message(500)
        
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return get_error_message(999)

        z = zipfile.ZipFile(io.BytesIO(response.content))
        target_path = os.path.join('data', server_name)
        download_to = os.path.join(target_path, 'TempDir')
        z.extractall(download_to)
        if(move_to_repo):
            move_to_source_control(target_path, cleanup_tempfiles)

        if response.status_code == 200:
            return send_file(
                BytesIO(response.content), 
                mimetype='application/zip', 
                as_attachment=True, 
                download_name= f"{file_name}.zip"
            ) # str(soup.prettify()).encode('utf-8')

        else:
            return get_error_message(response.status_code)


def move_to_source_control(base_path, cleanup_tempfiles):
    source_path = os.path.join(base_path, "TempDir")
    target_path = os.path.join(base_path, "SourceControl")

    if not os.path.exists(target_path):
        os.mkdir(target_path)
    for directory in os.listdir(source_path):
        full_path = os.path.join(source_path, directory)
        
        if os.path.isdir(full_path):
            for file in os.listdir(full_path):
                source_file = os.path.join(source_path, directory, file)
                target_dir = os.path.join(target_path, directory)
                target_file = os.path.join(target_dir, file)

                if not os.path.exists(target_dir):
                    os.mkdir(target_dir)

                if cleanup_tempfiles:
                    os.replace(source_file, target_file)
                else:
                    shutil.copy2(source_file, target_file)

            if cleanup_tempfiles:
                os.rmdir(full_path)

    if cleanup_tempfiles:
        os.rmdir(source_path)
