fetch("http://127.0.0.1:5000/status")//Flask 서버의 /status API로 HTTP GET 요청을 보냄
    .then(res => {//서버가 응답을 보내면 Response 객체를 res로 받음
        if (!res.ok) throw new Error("서버 응답 오류");//HTTP 상태 코드가 200~299가 아니면 오류로 처리한다.
        return res.json();//응답 본문(body)을 JSON 객체로 파싱함
    })
    .then(data => {//파싱된 JSON 데이터를 data 변수로 받음

        /* IP별 요청량 출력 */
        document.getElementById("ipStates").innerText =//해당 id의 요소를 선택 후 
            JSON.stringify(data.ip_states, null, 2);//data.ip_states로 객체를 문자열(JSON 형태)로 변환

        /* 차단된 IP 출력 */
        const blockedList = document.getElementById("blockedIps");//차단된 IP를 표시할 <ul> 요소를 가져옴
        blockedList.innerHTML = "";//중복 출력 방지를 위해 초기화함

        for (const ip in data.ip_blocked) {//data.ip_blocked 객체 안에 있는 모든 key를 하나씩 ip 변수에 담음
            const li = document.createElement("li");//<li>요소를 생성
            li.textContent = ip;//리스트 항목에 ip주소를 넣음
            blockedList.appendChild(li);//<ul> 안에 <li>를 추가해 화면에 표시함
        }

        /* 위험 알림 생성 */
        const alerts = document.getElementById("alerts");//위험 알림을 출력할 <ul> 요소를 선택함
        alerts.innerHTML = "";//초기화(누적 방지)

        for (const ip in data.ip_blocked) {//차단된 IP 목록을 다시 순회
            const li = document.createElement("li");//알림용 <li> 생성
            li.textContent = `⚠ ${ip} 요청 과다`;//템플릿 문자열을 사용해 IP를 삽입
            alerts.appendChild(li);//<ul> 안에 <li>를 추가해 화면에 표시함
        }
        drawRPSGraph(data.request_logs);//그래프
    })
    .catch(err => console.error(err));//디버깅을 위해 모든 예외를 콘솔에 출력

//그래프 그리는 함수
function drawRPSGraph(logs) {
    // ... (데이터 준비 로직은 동일) ...
    // 초 단위로 요청 수 누적
    // 시간 순으로 정렬
    // 최근 10초만 사용 (slicedTimes, slicedValues)
    // ... 

    const rpsMap = {};
    logs.forEach(log => {
        const time = log.time; 
        if (!rpsMap[time]) { rpsMap[time] = 0; }
        rpsMap[time] += log.count;
    });

    const times = Object.keys(rpsMap).sort();
    const values = times.map(t => rpsMap[t]);
    const slicedTimes = times.slice(-10);
    const slicedValues = values.slice(-10);
    const numPoints = slicedValues.length;
    if (numPoints < 2) return; // 데이터가 부족하면 그래프를 그리지 않음

    const canvas = document.getElementById("rpsChart");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 차트 여백 설정
    const padding = 20;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    const maxRPS = Math.max(...slicedValues, 5); // 최소 5 이상으로 설정하여 0일 때 너무 커지는 것을 방지
    const stepX = chartWidth / (numPoints - 1);
    const scaleY = chartHeight / maxRPS;

    // --- 1. 격자 (Grid Lines) 그리기 ---
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    
    // Y축 수평선 (5개)
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
        
        // Y축 값 레이블
        ctx.fillStyle = "#000";
        ctx.font = "10px Arial";
        ctx.fillText(
            (maxRPS * (1 - i / 4)).toFixed(0), 
            0, // X 좌표
            y + 3 // Y 좌표 (약간 아래로)
        );
    }

    // X축 수직선 및 레이블 (각 데이터 포인트 위치)
    ctx.fillStyle = "#000";
    ctx.font = "10px Arial";
    slicedTimes.forEach((time, i) => {
        const x = padding + i * stepX;
        
        // 수직 격자선
        ctx.strokeStyle = "#eee";
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();

        // X축 레이블 (시간의 초 부분만 표시)
        const seconds = time.slice(-2);
        ctx.fillText(seconds, x - 10, canvas.height - padding + 15);
    });
    
    // --- 2. 선 그래프 그리기 ---
    ctx.beginPath();
    
    // 첫 번째 지점으로 이동 (좌표계 변환 적용)
    const startY = chartHeight - slicedValues[0] * scaleY + padding;
    ctx.moveTo(padding, startY);

    slicedValues.forEach((value, i) => {
        const x = padding + i * stepX;
        const y = chartHeight - value * scaleY + padding;
        ctx.lineTo(x, y);
    });

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3; // 선을 더 두껍게
    ctx.stroke();
    
    // --- 3. 데이터 포인트 그리기 ---
    ctx.fillStyle = "red";
    slicedValues.forEach((value, i) => {
        const x = padding + i * stepX;
        const y = chartHeight - value * scaleY + padding;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2); // 원형 포인트
        ctx.fill();
    });
}