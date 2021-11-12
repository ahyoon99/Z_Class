const express = require('express');
const User = require('../models/users');
const router = express.Router();

router.get('/', function(req, res){
                                                    // 메인 페이지 접속 시 세션 정보를 확인하여 로그인 되어있는지 아닌지 확인
    if(req.session.userInfo){                           // 로그인 되어 있는 경우 바로 페이지 이동
        res.redirect('/waiting_room');
    }
    else{
        res.render('main', {test :"not Logined"})       // 로그인이 되어있지 않은 경우 로그인 페이지 출력
    }
});


// form으로부터 post 방식으로 sign-in 경로로 로그인 입력값 전달받은 경우
router.post('/sign-in', function(req, res){
    const input_id = req.body.id;
    const input_password = req.body.password;

    User.findOne({'id':input_id, "password":input_password})    // id값, password값이 모두 일치하는 것을 찾음
        .exec((err, user)=>{
        if(err)
            return res.json(err);
        if(user){                                               // db와 id, password가 일치하는 경우
            req.session.userInfo = {id:input_id};                       // session 정보에 userInfo 객체 넣어줌, 이를 통해서 유저의 id와 로그인 여부 확인
            req.session.save(()=>{                                      // 위 내용을 session에 저장시키고 나서 페이지 이동, 안할 시 db 서버와의 딜레이로 문제 발생
                return res.redirect('/waiting_room');                   // 로그인에 성공하였으므로 로그인 페이지로 넘어감
            })
        }
        else{                                                   // db와 id, password가 일치하지 않는 경우
            res.send('아이디가 존재하지 않거나 비밀번호가 맞지 않습니다.');
        }
    });
});


router.get('/user/sign_up', function(req,res){
    res.render('sign_up');
})

router.post('/user/sign_up', function (req, res) {
    const input_id = req.body.id;
    const input_password = req.body.password;
    const input_name = req.body.name;
    const input_type = req.body.job;
    const input_grade = req.body.grade;
    const input_phone_number = req.body.phone_number;
    const input_affiliation = req.body.affiliation;
    User
        .findOne({'id': input_id})
        .then((result) => {
            if (result) {
                res.send("user exists");
            } else {
                User
                    .signUp({
                        id: input_id,
                        password: input_password,
                        name: input_name,
                        type: input_type,
                        grade: input_grade,
                        phone_number: input_phone_number,
                        affiliation: input_affiliation
                    })
                    .then(newUser => {
                        res.send('user created');
                    })
                    .catch(err => res.send(err));
            }
        })
        .catch((err) => {
            res.send(err)
        });
});

// logout 버튼 누를 시 해당 주소로 이동, session을 삭제하고 메인 페이지로 redirect시킴
router.get('/user/logout', function(req,res){
    if(req.session)
        req.session.destroy();
    res.redirect('../');
})

module.exports = router;

