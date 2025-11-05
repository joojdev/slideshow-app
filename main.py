import eel
import os
import base64
from bottle import static_file, route

def create_folder_if_not_exists(folder):
    if not os.path.exists(folder):
        os.mkdir(folder)

content_folder = 'content'
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

@route('/content/<filename:path>')
def serve_content(filename):
    return static_file(filename, root=content_folder)

eel.start('index.html', mode='edge', size=(800, 600))