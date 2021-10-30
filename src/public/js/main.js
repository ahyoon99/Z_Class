
//loginBtn
const btnSignIn = document.querySelector("#btnSignIn");
btnSignIn.addEventListener("click",login);

async function login()
{
    var id=document.getElementById("loginId").value;
    var pwd=document.getElementById("loginPassword").value;
    if(id==""||pwd=="")
    {
       alert("아이디 또는 비밀번호를 입력해주세요.");
    }
    else{
        
       alert("아이디:"+id+"pwd:"+pwd);
       //이후에 id, pwd 디비랑 비교해서 있는지 확인 없으면 회원가입 해주세요, 있으면 강의실로 입장.
    }

}


const btnSignUp = document.querySelector("#btnSignUp");
btnSignUp.addEventListener("click", SignUp);



function SignUp(event){
    event.preventDefault();
    window.location.href = 'sign_up.html'
}