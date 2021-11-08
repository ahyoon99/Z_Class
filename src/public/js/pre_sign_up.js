const btnSignUp = document.querySelector("#student");

btnSignUp.addEventListener("click", SignUpStudent);

function SignUpStudent(event){
    event.preventDefault();
    window.location.href = 'sign_up_info'
}

const btnSignUp = document.querySelector("#teacher");

btnSignUp.addEventListener("click", SignUpTeacher);

function SignUpTeacher(event){
    event.preventDefault();
    window.location.href = 'sign_up_info_teacher'
}