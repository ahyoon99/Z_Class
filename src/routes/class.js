const express = require('express');
const User = require('../models/users');
const router = express.Router();

router.get('/', function (req, res) {
    if (!req.session.userInfo) 
        return res.send('잘못된 접근입니다.');

    // 세션에 저장해둔 사용자 정보의 type을 확인해 해당하는 페이지로 이동
    if (req.session.userInfo['type'] === 'student') {
        res.render('class_student');
    } else if (req.session.userInfo['type'] === 'teacher') {
        res.render('class_teacher');
    }
});

router.post('/', function (req, res){
    const course_objectId = req.body.course_objectId;
    req.session.course_objectId = course_objectId;
    
    res.redirect('/class');
});

module.exports = router;