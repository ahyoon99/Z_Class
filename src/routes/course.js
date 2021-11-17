const express = require('express');
const User = require('../models/users');
const router = express.Router();


//  ##########  /waiting_room/modify_course
router.post('/modify', function (req, res) {
    if (!req.session.userInfo) 
        return res.send('잘못된 접근입니다.');

    res.redirect('/course/modify?course_objectId='+req.body.course_objectId);
});


router.get('/modify', function (req, res){
    if (!req.session.userInfo) 
        return res.send('잘못된 접근입니다.');

    const course_objectId = req.query.course_objectId;

    // ++++++  objectId로 course 찾아서 정보 받아다가 web으로 넘겨주고 ejs에서 받아서 상태 보여주고 수정 기능 추가해야함


    res.render('modify_course');
});
module.exports = router;