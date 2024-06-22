import os
from flask import Flask, request, send_from_directory, jsonify, redirect, url_for
from flask_cors import CORS 

import config
import loadIndex
from app.module import findPhoto


loadIndex.loadIndexFix()

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
app.config['UPLOAD_FOLDER'] = './app/public/upload_photos'
app.config.from_object(config)
CORS(app) 




@app.route("/", methods=['GET'])
def dev():
    if request.args:
        # print(request.args)
        key = list(request.args)[0]
        return send_from_directory(f"{os.getcwd()}/app/public/browser", key)
    else:
        return send_from_directory(f"{os.getcwd()}/app/public/browser", "index.html")

@app.route("/<path:text>", methods=['GET'], )
def chunkJs(text):
    if text.startswith('chunk-'):
        return send_from_directory(f"{os.getcwd()}/app/public/browser", text)


@app.route("/assets/<name>", methods=['GET'])
def assets(name):
    return send_from_directory(f"{os.getcwd()}/app/public/assets", name)

@app.route('/uploads/<filename>', methods=['GET'])
def send_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/get_files', methods=['GET'])
def getFiles():
    result = findPhoto.fileList()
    return jsonify(result)

@app.route('/clear_files', methods=['GET'])
def clearFiles():
    result = findPhoto.clearUploadFiles()
    return jsonify(result)

@app.route('/run_parallel', methods=['GET'])
def runParallel():
    findPhoto.encode_images_parallel()
    # result = { "isSuccess" : 0, "message": "Please select Search photos!", "data" : []}
    return "successfully"

@app.route('/upload', methods=['POST']) 
def upload():
    if request.method == 'POST': 
        print("POST")        
        if 'files' not in request.files:
            result = { "isSuccess" : 0, "message": "Please select  photos!", "data" : []}
            return jsonify(result)
        else:
            print("else")
            files = request.files.getlist("files")
            result = findPhoto.upload(files)
            return jsonify(result)
    else:
        result = { "isSuccess" : 0, "message": "Request not found!", "data" : []}
        return jsonify(result)

@app.route('/search-person', methods=['POST'])
def searchPerson():
    if 'file' not in request.files:
        result = { "isSuccess" : 0, "message": "Please select Search photos!", "data" : []}
        return jsonify(result)
    else:
        result = findPhoto.search(request.files['file'])
        return jsonify(result)


# ======================================
if __name__ == '__main__':
    print('Angular frontend enabled on localhost port 8080')
    app.run(debug=True, host='127.0.0.1', port=8080)