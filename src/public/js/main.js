const btnSignUp = document.querySelector("#btnSignUp");

btnSignUp.addEventListener("click", SignUp);

function SignUp(event){
    event.preventDefault();
    window.location.href = 'sign_up.html'
}