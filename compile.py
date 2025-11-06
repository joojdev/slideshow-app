import os
import platform
import subprocess

def build():
  command = [
    'pyinstaller',
    '--noconsole',
    '--onefile',
    '--name', 'SlideshowApp',
    '--icon', 'icon.ico'
  ]

  if platform.system() == 'Windows':
    command += ['--add-data', 'web;web']
  else:
    command += ['--add-data', 'web:web']

  command.append('main.py')

  subprocess.run(command, check=True)

  print('Build finished!')

if __name__ == '__main__':
  build()