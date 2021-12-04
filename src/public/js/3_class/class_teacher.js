//  ###########  수동 출석체크 버튼  ###########
//  교사가 수업 시작 시간 이후에 접속한 경우 사용
//  버튼을 누른 시점의 학생들로 출석체크 진행
//  이후 30분 이내 접속 시 지각으로 체크
const btn_check_attendance = document.querySelector('#btn_check_attendance');
btn_check_attendance.addEventListener('click', (event)=>{
    event.preventDefault();
    console.log("출석체크");
    socket.emit('checkAttendance');
});