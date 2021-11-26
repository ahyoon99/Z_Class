const student_input_container = document.querySelector('#student_input');
const input_container = document.querySelector('#sign_up_input_container');
const student_container = document.querySelector('#student_container');
const input_phone_number = document.querySelector("#phone_number");

const btn_back = document.querySelector('#btn_back');
const btn_submit = document.querySelector('#btn_submit');

const radios_job = document.querySelectorAll('input[name="job"]');
radios_job.forEach((radio)=>{
    radio.addEventListener('click', (event)=>{
        jobChanged(radio.value);
    })
});

function jobChanged(_job){
    input_container.classList.remove('invisible');
    if(_job==='teacher'){
        student_container.classList.add('none_display');
        input_phone_number.setAttribute('placeholder', '휴대폰 번호');
    }
    else if(_job==='student'){
        student_container.classList.remove('none_display');
        input_phone_number.setAttribute('placeholder', '부모님 휴대폰 번호');
    }
}