const express = require('express');
const User = require('../models/users');
const router = express.Router();

router.get('/', function(req, res){
    // 세션에 저장해둔 id를 이용하여 db에서 유저 type을 확인
    User.findOne({'id':req.session.userInfo['id']})
        .exec((err, user)=>{
            if(err)
                return res.json(err);
            if(user){                       // 학생읜 경우와 선생님인 경우를 구별하여 각각에 해당하는 페이지 render
                if(user.type==='student'){
                    res.render('waiting_room_student');
                }
                else if(user.type==='teacher'){
                    res.render('waiting_room_teacher');
                }
            }
            else{
                return res.json(err);
            }
        });
});

module.exports = router;