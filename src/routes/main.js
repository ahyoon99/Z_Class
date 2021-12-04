const express = require('express');
const User = require('../models/users');
const router = express.Router();

router.get('/', function(req, res){
                                                    // 메인 페이지 접속 시 세션 정보를 확인하여 로그인 되어있는지 아닌지 확인
    if(req.session.userInfo){                           // 로그인 되어 있는 경우 바로 페이지 이동
        res.redirect('2_waiting_room/waiting_room');
    }
    else{
        res.render('1_main/main')       // 로그인이 되어있지 않은 경우 로그인 페이지 출력
    }
});


// form으로부터 post 방식으로 sign-in 경로로 로그인 입력값 전달받은 경우
router.post('/user/sign_in', function(req, res){
    const input_id = req.body.id;
    const input_password = req.body.password;

    // id값, password값이 모두 일치하는 user를 찾음
    User.findOne({'id':input_id, "password":input_password})    
        .exec((err, user)=>{

        if(user){                                               // db와 id, password가 일치하는 경우
            req.session.userInfo = {objectId:user._id, id:input_id, name:user.name, type: user.type, affiliation: user.affiliation};     // session 정보에 userInfo 객체 넣어줌, 이를 통해서 유저의 id와 로그인 여부 확인
            req.session.save(()=>{                                      // 위 내용을 session에 저장시키고 나서 페이지 이동, 안할 시 db 서버와의 딜레이로 문제 발생
                return res.redirect('/waiting_room');                   // 로그인에 성공하였으므로 로그인 페이지로 넘어감
            })
        }
        else{                                                   // db와 id, password가 일치하지 않는 경우
            res.render('1_main/return', {msg:"아이디가 존재하지 않거나 비밀번호가 맞지 않습니다."});
        }
    });
});

//  회원 가입 페이지
router.get('/user/sign_up', function(req,res){
    res.render('1_main/sign_up');
})

//  회원 가입 페이지에서 form에서 post 방식으로 전송
router.post('/user/sign_up', async function (req, res) {
    try{
    const new_user = await User.signUp({
        id: req.body.id,
        password: req.body.password,
        name: req.body.name,
        type: req.body.job,
        grade: req.body.grade,
        phone_number: req.body.phone_number,
        affiliation: req.body.affiliation
    });
    if(new_user){
        return res.render('1_main/return', {msg: '회원가입을 완료하였습니다 !'});
    }
    else{
        return res.render('1_main/return', {msg:'이미 존재하는 ID입니다 !'})
    }}
    catch(e){console.log(e);}
});

// logout 버튼 누를 시 해당 주소로 이동, session을 삭제하고 메인 페이지로 redirect시킴
router.get('/user/logout', function(req,res){
    if(req.session)
        req.session.destroy((err)=>{
            res.redirect('../');
        });
});

module.exports = router;

