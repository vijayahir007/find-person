import os
from flask import Flask
import cv2
import face_recognition
from multiprocessing import Pool
import math
import multiprocessing


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './app/public/upload_photos'
app.config['SEARCH_FOLDER'] = './app/public/search_photo'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}
# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['SEARCH_FOLDER'], exist_ok=True)

encode_photos = []

def get_maximum_process_count(image_count):
     maxCPUProcess = multiprocessing.cpu_count() * 2 + 1
     images_based_process = math.ceil(image_count / 4)
     max_parallel_length = maxCPUProcess if maxCPUProcess > images_based_process else images_based_process
     max_pool_process = 50
     final_max_process = max_pool_process if max_parallel_length > max_pool_process else max_parallel_length
     return final_max_process

def split_images_process_range(images):
    total_images = len(images)
    max_process = get_maximum_process_count(total_images)
    per_process_photos = math.ceil(total_images / max_process)
    image_array = [images[i:i + per_process_photos] for i in range(0, total_images, per_process_photos)]
    return image_array

def encode_images_parallel(images_list):  
    # pool object with number of elements in the list 
    pool = Pool(processes=len(images_list))   
    # map the function to the list and pass  
    # function and images_list as arguments 
    encode_result = pool.map(encode_images, images_list)
    return encode_result

def encode_images(images):
    encode_images = []
    for img_filename, img in images:
        face_locations, face_encodings = encode_face(img)
        encode_data = {
            "img_filename": img_filename,
            "face_locations": face_locations,
            "face_encodings": face_encodings
            }
        encode_images.append(encode_data)
    return encode_images

def encode_uploaded_images():
    images = load_images_from_folder(app.config['UPLOAD_FOLDER'])    
    image_array = split_images_process_range(images)
    encode_image_array = encode_images_parallel(image_array)
    for encode_images in encode_image_array:
        for encode_image in encode_images:
            encode_photos.append(encode_image)
    
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def encode_face(image):
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_image)
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
    return face_locations, face_encodings

def load_images_from_folder(folder):
    images = []
    for filename in os.listdir(folder):
        if allowed_file(filename):
            img_path = os.path.join(folder, filename)
            img = cv2.imread(img_path)
            if img is not None:
                images.append((filename, img))
    return images

def upload(files):
    for file in files:
        if file and allowed_file(file.filename):        
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
    return { "isSuccess" : 1, "message": "Album uploaded successfully!", "data" : [] }

def deleteImage(filePath):
    os.unlink(filePath)

def search(file):    

    if file and allowed_file(file.filename):
        filename = file.filename
        input_file_path = os.path.join(app.config['SEARCH_FOLDER'], filename)
        file.save(input_file_path)

        input_image = face_recognition.load_image_file(input_file_path)
        input_encodings = encode_face(input_image)
        if len(input_encodings[1]) == 0:
            deleteImage(input_file_path)
            return { "isSuccess" : 0, "message": "No faces found into search image.", "noMatch": 0, "data" : [] }
        elif len(input_encodings[0]) != 1:
            deleteImage(input_file_path)
            return { "isSuccess" : 0, "message": "Multiple faces found into search image, only single face image allowed!", "noMatch": 0, "data" : [] }

        input_encoding = input_encodings[1][0]

        # If the uploaded images not encoded then first encode all
        if len(encode_photos) == 0:
            encode_uploaded_images()

        matched_images = []
        for encode_photo in encode_photos:
            for face_encoding in encode_photo["face_encodings"]:
                matches = face_recognition.compare_faces([input_encoding], face_encoding)
                if matches[0]:
                    matched_images.append(encode_photo["img_filename"])
                    break
        if len(matched_images) > 0:
            deleteImage(input_file_path)
            return { "isSuccess" : 1, "message": "Match photos found successfully", "data" : matched_images }
        else:
            deleteImage(input_file_path)
            return { "isSuccess" : 0, "message": "Given person does not found from album!", "noMatch": 1, "data" : [] }
    else:
        return { "isSuccess" : 0, "message": "Please upload valid image files!", "noMatch": 0, "data" : []}        


def clearUploadFiles():
    result = {}
    try:
        with os.scandir(app.config['UPLOAD_FOLDER']) as entries:
            for entry in entries:
                if entry.is_file():
                    deleteImage(entry.path)
            encode_photos.clear()
            print("All files deleted successfully.")
            result = { "isSuccess" : 1, "message": "All files deleted successfully.", "data" : [] }
    except OSError:
        print("Error occurred while deleting files.")
        result = { "isSuccess" : 0, "message": "Error occurred while deleting files.", "data" : [] }
    return result

def fileList():
    files = os.listdir(app.config['UPLOAD_FOLDER'])

    return { "isSuccess" : 1, "message": "Album uploaded successfully!", "data" : {
        "list" : files
    }}
