from flask import Flask

app = Flask(__name__)

@app.route('/', methods=['GET'])
def welcome():
    return "Welcome to find person app"

@app.route('/users', methods=['GET'])
def getUsers():
    return "User get successfully"

if __name__ == '__main__':
    print('Find Person application launch for localhost port 8080')
    app.run(debug=True, host='127.0.0.1', port=8080)
