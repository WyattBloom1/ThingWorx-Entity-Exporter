from flask import Flask, render_template, request, send_file, send_from_directory
from io import BytesIO
from flask_cors import CORS
import os, io, time, shutil, json, datetime
import requests, zipfile
from Routes.serverRoutes import ServerBP
from Routes.entityRoutes import EntityBP

app = Flask(__name__, static_folder='./static', static_url_path='/')

# Register Routes
app.register_blueprint(ServerBP, url_prefix='/api/Servers')
app.register_blueprint(EntityBP, url_prefix='/api/Servers/<server_name>/Entities')

# Set CORS policy
cors = CORS(app, origins="*", expose_headers=["Content-Disposition"])

# Set env variables
use_mock = os.getenv("USE_MOCK_DATA")
print(f"Use Mock: {use_mock}")

if str(use_mock).lower() == 'true':
    print("WARNING: Using Mock Provider!")
    app.config['use_mock_provider'] = True
else:
    app.config['use_mock_provider'] = False

requests_timeout= os.getenv("REQUESTS_TIMEOUT", '5')
app.config['requests_timeout'] = int(requests_timeout)


# Serve static React files for UI
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')


# Routes requests back to the React Router
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

# Test route
@app.route('/time')
def get_current_time():
    return { 'time': f"Current Time: {time.time()}" }, 200

if __name__ == '__main__':
    DEBUG_VAR = os.getenv("DEBUG_MODE", "true")
    DEBUG_MODE = str(DEBUG_VAR).lower() == "true"

    app.run(host='0.0.0.0', debug=DEBUG_MODE, port=5000)