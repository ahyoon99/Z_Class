//loginBtn
const btnSignIn = document.querySelector("#btnSignIn");
btnSignIn.addEventListener("click",login);

function login()
{
    var id=document.getElementById("loginId").value;
    var pwd=document.getElementById("loginPassword").value;
    if(id==""||pwd=="")
    {
       alert("아이디 또는 비밀번호를 입력해주세요.");
    }
    else{
       compareDB(id,pwd);
       //이후에 id, pwd 디비랑 비교해서 있는지 확인 없으면 회원가입 해주세요, 있으면 강의실로 입장.
    }

}

function compareDB(id,pwd)
{
    //임시 test용- 선생님인 경우
    if(id=="ss"&&pwd=="123")
    {
        alert("입장합니다.");
        window.location.href='student_enter_room.html';
    }
    //임시 test용-학생인 경우
    else if(id=="tt"&&pwd=="123")
    {
        alert("입장합니다.");
        window.location.href='teacher_enter_room.html';
    }
    else{
        alert("회원이 아닙니다.");
        //회원가입 창으로 이동.
    }

}