from flask import request, Blueprint, current_app, send_file
import os, json
from Utilities import encrypt, get_app_key, get_server_dir

ServerBP = Blueprint('ServerBP', __name__)


@ServerBP.route('/', methods=['GET', 'POST'])
def servers():
    base_path = "data"
    if not os.path.exists(base_path):
        os.mkdir(base_path)

    try:
        if request.method == 'POST':
            params = request.json
            base_url = params.get('BaseURL', '')
            app_key = params.get('AppKey', '')
            token_expiration = params.get('TokenExpiration', '')
            project_name = params.get('ProjectName', '')
            logo = params.get('Logo', '')
            cover_image = params.get('CoverImage', '')

            server_name = params.get('ServerName', '')
            server_dir = get_server_dir(server_name)

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


@ServerBP.route('/<server_name>', methods=['GET'])
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

@ServerBP.route('/<server_name>/<file_name>')
def get_image(server_name, file_name):
    try:
        target_image = os.path.join('data', server_name, file_name)
        return send_file(target_image, mimetype='image/jpeg') # Or 'image/png', etc.
    except FileNotFoundError:
        return "Image not found", 404