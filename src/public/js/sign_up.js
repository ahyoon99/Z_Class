const student_input_container = document.querySelector('#student_input');
const input_container = document.querySelector('#input_container');
const phone_number_label = document.querySelector('#phone_number_label');
const student_container = document.querySelector('#student_container');

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
        phone_number_label.innerText = '휴대전화 번호';
        student_container.classList.add('invisible');
    }
    else if(_job==='student'){
        phone_number_label.innerText = ' 부모님 휴대전화 번호';
        student_container.classList.remove('invisible');
    }
}