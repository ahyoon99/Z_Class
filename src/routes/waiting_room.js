const express = require('express');
const User = require('../models/users');
const Course = require('../models/courses');
const router = express.Router();

// ##########  /waiting_room 주소로 접속 시  ##############
// 회원 타입에 따라 대기실에 입장
router.get('/', async (req, res) =>{
    if(!req.session.userInfo){
        return res.render('1_main/return', {msg:"잘못된 접근입니다 !"});
    }

    let courses;

    if(req.session.userInfo['type']==='student'){
        courses = await Course.findCourses('student', req.session.userInfo['objectId']);
        res.render('2_waiting_room/waiting_room_student',{user_name: req.session.userInfo['name'], user_courses: courses});
    }
    else if(req.session.userInfo['type']==='teacher'){
        courses = await Course.findCourses('teacher', req.session.userInfo['objectId']);
        res.render('2_waiting_room/waiting_room_teacher',{user_name: req.session.userInfo['name'], user_courses: courses});
    }
});

module.exports = router;