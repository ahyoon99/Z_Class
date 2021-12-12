//  ###########  수동 출석체크 버튼  ###########
//  교사가 수업 시작 시간 이후에 접속한 경우 사용
//  버튼을 누른 시점의 학생들로 출석체크 진행
//  이후 30분 이내 접속 시 지각으로 체크
/*
const btn_check_attendance = document.querySelector('#btn_check_attendance');
btn_check_attendance.addEventListener('click', (event)=>{
    event.preventDefault();
    console.log("출석체크");
    socket.emit('checkAttendance');
});

*/

// #####  초기화  #####
let now = new Date();        // 현재 시간 구하기 위함
let time_info = {};             // 강의 시작 시간 객체

setInterval(()=>{
    now = new Date();
    console.log(now);
},30000)

// 출석 정보를 저장할 Map
// key : 학생의 obejctId, value : {first: 최초 출결, current: 현재 출결}
let attendance_infos = {};

// #####  출석 체크 ( 학생 )  #####
// # 강의 시작 시간 ~ 30분 사이에 퇴장한 경우 #
// 조퇴 처리

// # 강의 시작 시간 ~ 30분 사이에 퇴장 후 입장한 경우 #
// 출석, 조퇴라면 출석, 출석
// 지각, 조퇴라면 지각, 지각


function AddAttendance(_id){
    const temp = GetTimeDifference(time_info);
    console.log(temp);
    if(temp<=0){
        UpdateAttendance(_id, '출석');
    }
    else{
        switch(attendance_infos[_id].first){
            case '출석':
                UpdateAttendance(_id, '출석');
                break;
            case '지각':
                UpdateAttendance(_id, '지각');
                break;
            case '결석':
                UpdateAttendance(_id, '지각');
                break;
        }
        
    }
}
function AddAttendanceBefore(_id){
    UpdateAttendance(_id, '출석');
}
function DeleteAttendance(_id){
    attendance_infos[_id] = {first: attendance_infos[_id].first, current: "조퇴"};
    document.querySelector('#td_attendance_'+_id).innerText =  "조퇴";
}

function UpdateAttendance(_id, _state){
    attendance_infos[_id] =  {first: _state,current: _state};
    document.querySelector('#td_attendance_'+_id).innerText = _state;
}

function SubmitAttendance(){
    socket.emit('setAttendance', attendance_infos);
}

InitializeAttendance();

// # 강의 시작 시간 구하기 #
function InitializeAttendance(){
    
    student_ids.forEach(_id => attendance_infos[_id] = {first: "결석", current: "결석"});
    

    let time_difference;
    let is_lated = false;                   // 강의 시간에 늦었나 안늦었나

    console.log(time_infos);
    time_infos.forEach((_time)=>{               // ejs에서 time_infos 선언해둠
        if(_time.day !== now.getDay().toString())   // 같은 날인지
            return;                              // continue와 같음
        time_difference = GetTimeDifference(_time);
    
        if(time_difference>=-10&&time_difference<=30){   // 10분 전 ~ 30분 후 사이인지
            time_info = _time;
            if(time_difference<0)
                is_lated = false;
            else
                is_lated = true;
        }
    });

    time_difference = GetTimeDifference(time_info);
    console.log(time_difference);

    if(!is_lated){
        time_difference = time_difference * 60 * -1000; // ms초로 변환
        console.log(time_difference + 'ms 후에 출석체크 실행');
        setTimeout(()=>{
            console.log('출석체크 실행');
            SubmitAttendance(); 
            setTimeout(()=>{
                SubmitAttendance();
            }, 30 * 60 * 1000);
    }, time_difference);
    }else{
        console.log('출석체크 실행');
        SubmitAttendance();
        const temp_time = (time_info.hour * 60 + parseInt(time_info.minute) + 30 ) - (now.getHours() * 60 + now.getMinutes());
        console.log(temp_time);
        setTimeout(()=>{
            console.log('출석체크 실행');
            SubmitAttendance();
        }, temp_time * 60 * 1000);
    }
}

// # 강의 시작 시간과 현재 시간의 차
function GetTimeDifference(_time_info){
   return parseInt((now.getHours() * 60 + now.getMinutes()) - (_time_info.hour * 60 + parseInt(_time_info.minute)));
}


// #####  출석 체크 ( 교사 )  #####
// # 강의시작 전 입장한 경우 #
// 강의 시작시간이 되면 출석 체크
// 이후 30분 뒤, 최종 출결 확인


// # 강의시작 이후 입장한 경우 #
// 즉시 출석 체크
// 이후 강의 시작시간으로부터 30분이 지난 시점에 최종 출결 확인









