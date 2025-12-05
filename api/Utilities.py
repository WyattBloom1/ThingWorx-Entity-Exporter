import os, json
from cryptography.fernet import Fernet

# def decode_appkey(f=None, scopes=None):
#     def decorator(f):
#         @wraps(f)
#         def wrapped(*args, **kwargs):
#             if current_app.config.get('AUTH_ENABLED', True):
#                 auth = current_app.auth_instance
#                 if scopes:
#                     return auth.login_required(scopes=scopes)(f)(*args, **kwargs)
#                 return auth.login_required(f)(*args, **kwargs)
            
#             # Only use mock context when auth is explicitly disabled
#             mock_context = {
#                 'user': {'name': 'Test User'},
#                 'access_token': 'mock_token'
#             }
#             return f(*args, context=mock_context, **kwargs)
#         return wrapped
#     return decorator if f is None else decorator(f)

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


def get_server_dir(server_name: str):
    server_dir = os.path.join("data", server_name)
    if os.path.exists(server_dir):
        print('Directory already exists')
    else:
        os.mkdir(server_dir)
    return server_dir

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