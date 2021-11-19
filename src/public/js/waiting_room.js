const btn_logout = document.querySelector('#btn_logout');

btn_logout.addEventListener('click',(event)=>{
    event.preventDefault();
    window.location.href = '/user/logout';
});

const btn_make_course = document.querySelector("#btn_make_course");
btn_make_course.addEventListener('click', (event)=>{
    event.preventDefault();
    window.location.href = '/course/make_course';
});