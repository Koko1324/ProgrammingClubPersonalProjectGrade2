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

    })
    .catch(err => console.error(err));//디버깅을 위해 모든 예외를 콘솔에 출력
