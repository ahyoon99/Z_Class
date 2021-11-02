const btnSignUp = document.querySelector("#btnSignUp");

btnSignUp.addEventListener("click", SignUp);

function SignUp(event){
    event.preventDefault();
    window.location.href = 'pre_sign_up'
}