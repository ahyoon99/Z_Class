// #####  최상단의 인사말  #####
const msg_hi = document.querySelector('#msg_hi');
const msg_ori = msg_hi.innerText;
const msg_emoji = ['😊', '😁'];
let i = 0;
setInterval(()=>{
    msg_hi.innerText =  msg_emoji[i] +msg_ori;
    i = (i+1)%2;
},500);

// #####  초기화 과정  #####
const courses = document.querySelectorAll('.course');
const day_string = ['일', '월', '화', '수', '목', '금', '토'];

const now = new Date();
const now_day = now.getDay();
const now_hour = now.getHours();
const now_minute = now.getMinutes();

// 강의 정보들 map으로 저장
const course_info_map = new Map();
courses.forEach(course=>{
    let i=0;
    let temp = {};
    const course_infos = [];
    for(const data in course.dataset){
        switch(i%3){
            case 0:
                temp['day'] = course.dataset[data];
                break;
            case 1:
                temp['hour'] = course.dataset[data];
                break;
            case 2:
                temp['minute'] = course.dataset[data];
                course_infos.push(temp);
                temp={};
                break;
        }
        i++;
    }
    const new_course_info = {course_infos:course_infos, course_labels_container: document.querySelector('#label_'+course.id+'_container').children};
    course_info_map.set(course.id,new_course_info);
});

// #####  강의 목록  #####
ShowTodayCourses();
// # 오늘의 수업 띄우기 #
function ShowTodayCourses(){
    course_info_map.forEach((_course)=>{
        let contains_today= false;
        let infos = "";
        _course.course_infos.forEach((_times)=>{
            if(_times.day===now_day.toString()){
                contains_today=true;
                infos += _times.hour.padStart(2,'0')+ ':'+_times.minute.padStart(2,'0')+' ';
            }
        });
        if(contains_today)
            UpdateLabels(_course.course_labels_container, infos, true);
        else
            UpdateLabels(_course.course_labels_container, infos, false);
    });
}
// # 수강중인 전체 수업 띄우기 #
function ShowAllCourses(){
    course_info_map.forEach((_course)=>{
        let infos = "";
        _course.course_infos.forEach((_times)=>{
            infos += day_string[_times.day] + ' ';
        });
        UpdateLabels(_course.course_labels_container, infos, true);
    });
}

// 강의 띄울 때 label 설정
function UpdateLabels(_labels_container, _infos, _display){
    _labels_container[1].innerText = _infos;
    if(_display){
        _labels_container[0].classList.remove('display_none');
        _labels_container[1].classList.remove('display_none');
    }
    else{
        _labels_container[0].classList.add('display_none');
        _labels_container[1].classList.add('display_none');
    }
}

// # 강의 목록 오늘 / 전체 버튼 #
let is_today_list = true;
const btn_change_list= document.querySelector('#btn_change_list');
btn_change_list.addEventListener('click',(event)=>{
    is_today_list = !is_today_list;
    if(is_today_list){
        ShowTodayCourses();
        btn_change_list.innerText = 'Today';
    }
    else{
        ShowAllCourses();
        btn_change_list.innerText = 'All';
    }
});

// #####  강의 입장  #####
const form_course = document.querySelector('form');
const btn_enter_course = document.querySelector('#btn_enter_course');
btn_enter_course.addEventListener('click', (event)=>{
    const selected_course = document.querySelector('input[name="course_objectId"]:checked');
    if(!selected_course)
        return Alert('입장할 수업을 선택해주세요 !');
    
    const selected_course_time = course_info_map.get(selected_course.id).course_infos;
    let can_enter = false;
    // 선택한 코스의 강의 시작 시간을 모두 체크
    selected_course_time.forEach((_time)=>{
        if(_time.day !== now_day.toString())   // 같은 날인지
            return;                 // continue와 같음
        const time_difference = (now_hour*60 + now_minute) - (_time.hour*60 + parseInt(_time.minute));
        
        if(time_difference>=-10&&time_difference<=30)   // 10분 전 ~ 30분 후 사이인지
            can_enter=true;
    })
    form_course.action = '/class';
    // !!!!! 테스트용
    can_enter ? form_course.submit() : Alert('수업 시작 10분 전부터 30분 후까지만 입장할 수 있습니다 !');
    // form_course.submit();
});