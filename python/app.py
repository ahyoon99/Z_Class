from flask import Flask

app = Flask(__name__)


# localhost:5000/flask로 접속 시 Flask server 출력됨
# node js 서버에서 127.0.0.1:5000/flask로 접속

@app.route('/flask', methods=['GET'])
def test():
    return "Flask server"

if __name__=="__main__":
    app.run(port=5000,debug=True)


