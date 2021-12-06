// 메인 컨테이너
const course_info_container = document.querySelector('#course_info_container');
// 강의 시간표 개수, 최소 1개, 최대 5개
const class_container = document.querySelector('.class_container');
// 강의 시간 추가 / 삭제 버튼
const btn_add_course = document.querySelector('#btn_add_course');
const btn_remove_course = document.querySelector('#btn_remove_course');
btn_add_course.addEventListener('click', (event)=>AddCourse());
btn_remove_course.addEventListener('click', (event)=>RemoveCourse());

// 현재 강의 시간표 개수
let class_num = class_container.childElementCount-1;

// 강의 시간표 개수에 따라 초기화 ( 수정 페이지에서 사용 )
if(class_num!==1){
    btn_remove_course.disabled=false;
}
else if(class_num!==5)
    btn_add_course.disabled=false;

//  의 시간표 추가
function AddCourse(){
    if(class_num ===5)
        return window.alert('더 이상 강의 시간표를 추가할 수 없습니다 !!!');
    else if(class_num ===4)
        btn_add_course.disabled = true;
    else
        btn_add_course.disabled = false;
        
    class_num++;

    // 새 수업 시간 html
    let tempHTML =`
    <span>&nbsp;수업 ${class_num} - </span>
    <select name="day${class_num}" required>
        <option value="">요일</option>
        <option value="0">일요일</option>
        <option value="1">월요일</option>
        <option value="2"">화요일</option>
        <option value="3"">수요일</option>
        <option value="4">목요일</option>
        <option value="5">금요일</option>
        <option value="6">토요일</option>
    </select>
    &nbsp;
    <select name="hour${class_num}" required>
        <option value="">시</option>`;
    for(let i=9;i<23;i++){
        tempHTML+=`
        <option value="${i}">${i}</option>`
    }
    tempHTML+=`
    </select>
    <span>&nbsp;:&nbsp;</span>
    <select name="minute${class_num}" required>
        <option value="">분</option>`;
    for(let i=0; i<12; i++){
        tempHTML+=`
        <option value="${5*i}">${5*i}</option>`;
    }
    tempHTML+=`
    </select>`;

    const div_container = document.createElement('div');
    div_container.id = 'day'+class_num+'_container';
    div_container.className = 'day_container';
    div_container.innerHTML=tempHTML;
    class_container.appendChild(div_container);

    btn_remove_course.disabled=false;
    course_info_container.style.setProperty('height','calc(800px + '+2.5*(class_num-1)+'rem)');

}

//  강의 시간표 제거
function RemoveCourse(){
    if(class_num===1)
        return window.alert('더 이상 강의 시간표를 삭제할 수 없습니다 !!!');
    else if(class_num ===2)
        btn_remove_course.disabled = true;
    else
        btn_remove_course.disabled = false;

    const remove_course = document.querySelector('#day'+class_num+'_container');
    class_container.removeChild(remove_course);

    btn_add_course.disabled=false;
    class_num--;
    course_info_container.style.setProperty('height','calc(800px + '+2.5*(class_num-1)+'rem)');
}