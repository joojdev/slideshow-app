import eel
import os
import base64
import sys
import json
from bottle import static_file, route

def get_base_directory():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))

def load_config(path):
    if not os.path.exists(path): return dict()
    with open(path, 'r') as file:
        config_content = file.read()

    return json.loads(config_content)

def save_config(path, data):
    with open(path, 'w') as file:
        config_content = json.dumps(data)
        file.write(config_content)

def create_folder_if_not_exists(folder):
    if not os.path.exists(folder):
        os.mkdir(folder)

base_directory = get_base_directory()

config_file = os.path.join(base_directory, 'config.json')
content_folder = os.path.join(base_directory, 'content')
config = load_config(config_file)
create_folder_if_not_exists(content_folder)

eel.init('web')

@eel.expose
def upload_file(file_name, file_content):
    if file_content.startswith('data:'):
        file_content = file_content.split(',')[1]

    data = base64.b64decode(file_content)

    with open(os.path.join(content_folder, file_name), 'wb') as file:
        file.write(data)

@eel.expose
def list_files():
    create_folder_if_not_exists(content_folder)
    return os.listdir(content_folder)

@eel.expose
def delete_file(file_name):
    os.remove(os.path.join(content_folder, file_name))

@eel.expose
def get_interval():
    return config.get('interval', 5)

@eel.expose
def set_interval(interval):
    config['interval'] = interval
    save_config(config_file, config)

@eel.expose
def get_file_order():
    """Return saved file order if exists, else natural order."""
    create_folder_if_not_exists(content_folder)
    files = os.listdir(content_folder)
    saved_order = config.get("file_order", [])
    # Keep only files that still exist
    ordered = [f for f in saved_order if f in files]
    # Add any new files not in order yet
    for f in files:
        if f not in ordered:
            ordered.append(f)
    return ordered

@eel.expose
def set_file_order(order):
    """Save the given file order list."""
    config["file_order"] = order
    save_config(config_file, config)

@route('/content/<filename:path>')
def serve_content(filename):
    return static_file(filename, root=content_folder)

eel.start('index.html', size=(800, 600))