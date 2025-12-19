from flask import Flask, jsonify, request

app = Flask(__name__)

request_count = 0

@app.route("/ping")#로컬 링크/ping로 접속 하면 아래 코드 실행
def ping():
    global request_count
    request_count += 1

    ip = request.remote_addr

    print(request_count)
    
    return jsonify({#리턴 없으면 TypeError오류 남
        "message": "request received",
        "ip": ip,
        "count":request_count
    })

if __name__ == '__main__':
    app.run(debug=True)