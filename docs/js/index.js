/**
 * [입력 제한] 요청 횟수 범위 제한
 */
function limitRange(input) {
    const min = Number(input.min);
    const max = Number(input.max);
    let value = Number(input.value);

    if (isNaN(value)) return;

    if (value < min) input.value = min;
    if (value > max) input.value = max;
}

console.log("hi")

/**
 * [입력 제한] 아이피 입력 제한
 */
document.addEventListener("DOMContentLoaded", function () {
    // HTML 문서의 모든 요소가 로드된 후 실행됨

    const ipv4Input = document.getElementById("ipv4");
    // id가 ipv4인 input 요소를 선택

    const ipMask = new Inputmask({
        alias: "ip",
        greedy: false
        // IPv4 형식으로 입력을 제한하고,
        // 입력 전에는 마스크를 미리 표시하지 않음
    });

    ipMask.mask(ipv4Input);
    // 선택한 input 요소에 IP 입력 마스크 적용
});

/**
 * [입력 처리] 아이피, 횟수 입력 저장 및 처리
 */
// form 요소 선택
const request = document.getElementById('request');
// form 제출 이벤트 처리
request.addEventListener('submit', function(event) {
    event.preventDefault(); // 페이지 새로고침 방지
    
    //아이피 값 읽어서 저장
    const ipInput = document.getElementById('ipv4');
    const ip = ipInput.value;

    //요청 횟수 값 읽어서 저장
    const countInput = document.getElementById('count');
    const count = Number(countInput.value);
    
    //디버깅용
    console.log(ip)
    console.log(count)

    // Flask 서버로 데이터 전송
    fetch('http://127.0.0.1:5000/ping', {
        method: 'POST', // 데이터 보내므로 POST
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ip: ip,
            count: count
        })
    })
    .then(response => response.json()) // Flask 응답 JSON 파싱
    .then(data => {
        console.log(data); // 서버 응답 확인
    });
});