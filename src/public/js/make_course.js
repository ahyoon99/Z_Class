// 강의 시간 추가 / 삭제 버튼을 담은 변수
const btn_add_course = document.querySelector('#btn_add_course');
const btn_remove_course = document.querySelector('#btn_remove_course');
btn_add_course.addEventListener('click', (event)=>{
    event.preventDefault();
    AddCourse();
});
btn_remove_course.addEventListener('click', (event)=>{
    event.preventDefault();
    RemoveCourse();
});


//  강의 시간표 개수, 최소 1개, 최대 5개
let class_num = 1;
const class_container = document.querySelector('.class_container');


//  강의 시간표 추가
function AddCourse(){
    if(class_num ===5){
        window.alert('더 이상 강의 시간표를 추가할 수 없습니다 !!!');
        return;
    }
    else if(class_num ===4)
        btn_add_course.disabled = true;
    else
        btn_add_course.disabled = false;
        
    btn_remove_course.disabled=false;
    class_num++;
    const div_container = document.createElement('div');
    const div_day_container = document.createElement('div');
    const div_time_container = document.createElement('div');

    div_day_container.className = 'day_container';
    div_time_container.className = 'time_container';

    div_day_container.innerHTML =
    '<input type="radio" name="day'+class_num+'" value="Son." required="required">'+
    '<label for="Son.">일요일</label>'+
    '<input type="radio" name="day'+class_num+'" value="Mon.">'+
    '<label for="Mon.">월요일</label>'+
    '<input type="radio" name="day'+class_num+'" value="Tue.">'+
    '<label for="Tue.">화요일</label>'+
    '<input type="radio" name="day'+class_num+'" value="Wed.">'+
    '<label for="Wed.">수요일</label>'+
    '<input type="radio" name="day'+class_num+'" value="Thu.">'+
    '<label for="Thu.">목요일</label>'+
    '<input type="radio" name="day'+class_num+'" value="Fri.">'+
    '<label for="Fri.">금요일</label>'+
    '<input type="radio" name="day'+class_num+'" value="Sat.">'+
    '<label for="Sat.">토요일</label>';

    div_time_container.innerHTML =
    '수업 시작 시간<input type="time" name="time'+class_num+'" required="required">';

    div_container.id = 'day'+class_num+'_container';
    div_container.appendChild(div_day_container);
    div_container.appendChild(div_time_container);
    
    class_container.appendChild(div_container);
}

//  강의 시간표 제거
function RemoveCourse(){
    if(class_num===1){
        window.alert('더 이상 강의 시간표를 삭제할 수 없습니다 !!!');
        return;
    }
    else if(class_num ===2)
        btn_remove_course.disabled = true;
    else
        btn_remove_course.disabled = false;
        
    btn_add_course.disabled=false;
    const remove_course = document.querySelector('#day'+class_num+'_container');
    class_container.removeChild(remove_course);
    class_num--;
}