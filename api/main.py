from flask import Flask, render_template, request, send_file, send_from_directory
from io import BytesIO
from bs4 import BeautifulSoup as BeautifulSoup
from flask_cors import CORS
import os, io, time, shutil, json, datetime
from dotenv import load_dotenv
import requests, zipfile
from cryptography.fernet import Fernet

app = Flask(__name__, static_folder='./static', static_url_path='/')
cors = CORS(app, origins="*", expose_headers=["Content-Disposition"])

### Load the .env file
# load_dotenv()

use_mock = os.getenv("USE_MOCK_DATA")
print(f"Use Mock: {use_mock}")

use_mock_provider = False
if str(use_mock).lower() == 'true':
    print("WARNING: Using Mock Provider!")
    use_mock_provider = True
    
requests_timeout= os.getenv("REQUESTS_TIMEOUT", '5')
requests_timeout = int(requests_timeout)
print(f"Timeout: {requests_timeout}")

# Serve static React files for UI
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')


# Routes requests back to the React Router
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/time')
def get_current_time():
    return { 'time': f"Current Time: {time.time()}" }, 200


@app.route('/api/SourceControl', methods=['GET', 'POST'])
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


@app.route('/api/Servers/<server_name>/Entities/<entity_type>/<entity_name>', methods=['GET'])
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


@app.route('/api/Servers', methods=['GET', 'POST'])
def servers():
    base_path = "data"
    if not os.path.exists(base_path):
        os.mkdir(base_path)

    try:
        if request.method == 'POST':
            params = request.json
            server_name = params.get('ServerName', '')
            base_url = params.get('BaseURL', '')
            app_key = params.get('AppKey', '')
            token_expiration = params.get('TokenExpiration', '')
            project_name = params.get('ProjectName', '')
            logo = params.get('Logo', '')
            cover_image = params.get('CoverImage', '')

            encrypted = encrypt(app_key)

            jsonObj = {
                "ServerDisplayName": server_name,
                "BaseURL": base_url,
                "AppKey": encrypted[0].decode(),
                "TokenExpiration": token_expiration,
                "ProjectName": project_name,
                "Logo": logo,
                "CoverImage": cover_image
            }

            server_dir = os.path.join("data", server_name)
            if os.path.exists(server_dir):
                print('Directory already exists')
            else:
                os.mkdir(server_dir)


            server_config_path = os.path.join(server_dir, 'ServerConfig.json')
            with open(server_config_path, 'w') as file:
                file.write(json.dumps(jsonObj))
        else:
            server_name = request.args.get('ServerName', '')

            directories = []
            for item in os.listdir(base_path):
                full_path = os.path.join(base_path, item)
                
                if os.path.isdir(full_path):
                    app_key = get_app_key(item)

                    config = {
                        'Server': item,
                        'Config': app_key
                    }

                    directories.append(config)

            return directories, 200

        return 'SUCCESS', 200
    except Exception as e:
        print(e)
        # raise(e)
        return "Error", 500


@app.route('/api/Servers/<server_name>', methods=['GET'])
def get_server_by_name(server_name):
    base_path = "data"
    if not os.path.exists(base_path):
        os.mkdir(base_path)

    directories = []
    full_path = os.path.join(base_path, server_name)
        
    if os.path.isdir(full_path):
        app_key = get_app_key(server_name)

        config = {
            'Server': server_name,
            'Config': app_key
        }

        directories.append(config)

    return directories, 200


def encrypt(string):
    if os.path.exists('refKey.txt'):
        with open('refKey.txt') as f:
            refKey = ''.join(f.readlines())
            key = bytes(refKey, 'utf-8')
        f.close()
    else:
        # Generate an encryption key and write it to a file
        key = Fernet.generate_key()

        f = open("refKey.txt", "wb")
        f.write(key)
        f.close()

    # Encrypt the input string and and return it
    refKey = Fernet(key)
    mypwdbyt = bytes(string, 'utf-8') # convert into byte
    encryptedPWD = refKey.encrypt(mypwdbyt)

    return encryptedPWD, key


def decrypt(string_to_decrypt):
    # Read the encryption key and convert it into bytes
    with open('refKey.txt') as f:
        refKey = ''.join(f.readlines())
        refKeybyt = bytes(refKey, 'utf-8')
    f.close()

    print(f"Encryption Key: {refKeybyt} | {string_to_decrypt}")
    # Use the key to decrypt the input string and return it
    encryption_key = Fernet(refKeybyt.decode())
    myPass = (encryption_key.decrypt(string_to_decrypt))

    return myPass


def get_app_key(server_name, decrypt_key = False):
    server_config_path = os.path.join('data', server_name, 'ServerConfig.json')

    if os.path.exists(server_config_path):
        with open(server_config_path, 'r') as read_file:
            server_config = json.load(read_file)
        
        if decrypt_key:
            print(f"ServerConfig Key: {server_config}")
            decrypted_key = decrypt(server_config["AppKey"]).decode()
            print(f"Decrypted Key: {decrypted_key}")

            server_config["AppKey"] = decrypted_key
            server_config["TokenExpiration"] = "None"
        else:
            del server_config["AppKey"]
            del server_config["BaseURL"]

        return server_config
    # else:
        # raise(500)


@app.route('/api/Servers/<server_name>/Entities', methods=['GET'])
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
        'Content-Type': 'application/json',
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

    if use_mock_provider:
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
            response = requests.post(url, json=payload, headers=headers, timeout=requests_timeout)

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

@app.route('/api/Servers/<server_name>/DownloadEntities', methods=['GET'])
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


@app.route('/api/image/<server_name>/<file_name>')
def get_image(server_name, file_name):
    try:
        target_image = os.path.join('data', server_name, file_name)
        print(f"Target Image: {target_image}")
        return send_file(target_image, mimetype='image/jpeg') # Or 'image/png', etc.
    except FileNotFoundError:
        return "Image not found", 404


def get_error_message(status_code: int):
    print(f"ERROR: {status_code}")
    match status_code:
        case 400:
            return 'Invalid URL. Please verify Server URL is correct.', status_code
        case 401:
            return "Unauthorized. App key may be expired or invalid.", status_code
        case 500:
            return 'No response. Thinworx server may be offline', status_code
        case 502:
            return 'No response. Thinworx server may be offline', status_code
        case _:
            return "Unhandled exception occured.", status_code

if __name__ == '__main__':
    DEBUG_VAR = os.getenv("DEBUG_MODE", "false")
    DEBUG_MODE = str(DEBUG_VAR).lower() == "true"

    app.run(host='0.0.0.0', debug=DEBUG_MODE, port=5000)