const courses = document.querySelectorAll('.course');
const now = new Date();
const day_string = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
const now_day = now.getDay();
const now_hour = now.getHours();
const now_minute = now.getMinutes();


courses.forEach(course=>{
    let i=0;
    let temp = {};
    let course_times = [];
    for(let data in course.dataset){
        if(i%2==0)
            temp['day'] = day_string.indexOf(course.dataset[data]);
        else{
            const hour_n_minute = course.dataset[data].split(':').map(Number);
            temp['hour'] = hour_n_minute[0];
            temp['minute'] = hour_n_minute[1];
            course_times.push(temp);
            temp={};
        }
        i++;
    }
    
    let is_same_day = false;
    course_times.forEach(course_time=>{
        if(now_day===course_time.day){
            is_same_day= true;
            return false;
        }
        else
            return;         // continue와 같음
        
    });
    // 같은 요일일 경우에만 출력도되록 함           +++ 날짜 바뀌는 시간대일 경우??? (빠른 개발을 위해 패스)
    if(!is_same_day){
    const course_label = document.querySelector('#label_'+course.id);
    course_label.classList.add('display_none');
    }

});

const btn_enter_course = document.querySelector('#btn_enter_course');
const form_course = document.querySelector('#form_course');
btn_enter_course.addEventListener('click', (event)=>{
    const selected_course = document.querySelector('input[name="course_objectId"]:checked');
    if(!selected_course)
        return alert('입장할 수업을 선택해주세요 !');

        let course_times = [];
    let temp = {};
    let i=0;
    for(let data in selected_course.dataset){
        if(i%2==0)
            temp['day'] = day_string.indexOf(selected_course.dataset[data]);
        else{
            const hour_n_minute = selected_course.dataset[data].split(':').map(Number);
            temp['hour'] = hour_n_minute[0];
            temp['minute'] = hour_n_minute[1];
            course_times.push(temp);
            temp={};
        }
        i++;
    }

    let can_enter = false;
    course_times.forEach(course_time=>{
        if(now_day!==course_time.day)
            return;

        const time_difference = (now_hour*60 + now_minute)-(course_time['hour'] * 60 + course_time['minute']);
        if(time_difference>=-10&&time_difference<=30)
            can_enter=true;
    })
    can_enter ? form_course.submit() : alert('수업 시작 10분 전부터 30분 후까지만 입장하실 수 있습니다.');
    
    // 
})