from flask import Flask, jsonify, request
from flask_cors import CORS  # CORS 추가
from datetime import datetime

app = Flask(__name__)
CORS(app)#모든 출처(origin)에서 오는 요청 허용

#전역 변수 정의
ip_states = {}        # IP별 요청 수
ip_blocked = {}       # 차단된 IP
request_total = 0     # 전체 요청 수
request_logs = []     # 요청 기록 (IP + 시간 + count)

#/ping은 이제 상태를 바꾸는 역할만 함
@app.route("/ping", methods=["POST"])#누군가 /ping으로 요청을 보내면
def ping():#ping()함수를 실행하라
    global request_total

    data = request.get_json()
    # 안전 검사
    if data is None:
        return jsonify({"error": "No JSON received"}), 400

    ip = data.get("ip")#ip만 저장
    count = int(data.get("count"))#횟수만 저장

    # 차단 IP 확인: 이미 차단된 IP라면 처리하지 않고 상태 반환
    if ip in ip_blocked:
        return jsonify({"status": "blocked", "ip": ip}), 403

    #RPS
    #요청이 왔을 때의 시간 계산
    time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    #그 시간을 json에 추가해야함
    request_logs.append({
    "ip": ip,
    "count": count,
    "time": time_str
    })

    #ip요청 수 누적
    ip_states[ip] = ip_states.get(ip, 0) + count#[ip]는 ip라는 키에 대응되는 값을 가져오라는 것(파이썬 딕셔너리의 핵심 문법)
    #ip_states.get(ip, 0)은 서버 내부에 이미 ip키가 있으면 그 값을 주고 없으면 0을 대신 주라는 것

    #전체 요청 수 누적
    request_total = request_total + count

    #차단 판단
    if ip_states[ip] >=90:
        ip_blocked[ip] = True

    return jsonify({"status": "ok",})#상태 반환 안하고 저장과 누적만 하기 때문에 이 코드를 사용했음

@app.route("/status", methods=["GET"])#누군가 /status에서 데이터를 받을 때
def status():#status()함수를 실행하라
    return jsonify({
        "ip_states": ip_states,
        "ip_blocked": ip_blocked,
        "request_total": request_total,
        "request_logs": request_logs
    })

if __name__ == '__main__':
    app.run(debug=True)
