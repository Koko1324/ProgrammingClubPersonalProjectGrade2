from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/ping", methods=["POST"])#누군가 /ping으로 요청을 보내면
def ping():#ping()함수를 실행하라
    data = request.get_json()

    # 안전 검사
    if data is None:
        return jsonify({"error": "No JSON received"}), 400

    ip = data.get("ip")#ip만 저장
    count = data.get("count")#횟수만 저장

    return jsonify({
        "status": "ok",
        "ip": ip,
        "count": count
    })

if __name__ == '__main__':
    app.run(debug=True)
