const express = require('express');
const User = require('../models/users');
const Course = require('../models/courses');
const router = express.Router();


//  ##########  /course/make_course 주소로 접속 시
router.get('/make_course', function (req, res) {
    if (!req.session.userInfo) 
        return res.render('return', {msg:"잘못된 접근입니다 !"});
    
    User.find({             //  
            'type': 'student', 'affiliation': req.session.userInfo['affiliation']})
        .exec((err, users) => {
            if (err) 
                return res.json(err);
            else {
                res.render('make_course', {students: users});
            }
        });
});

//  ##########  /course/make_course 주소에서 post 방식으로 form 전송
router.post('/make_course', function (req, res) {
    const input_title = req.body.title;
    const input_day_n_time = [{
            day: req.body.day1,
            time: req.body.time1
        }];

    //  강의 시간 추가되었을 경우에 추가적으로 저장
    if (req.body.day2) 
        input_day_n_time.push({day: req.body.day2, time: req.body.time2});
    if (req.body.day3) 
        input_day_n_time.push({day: req.body.day3, time: req.body.time3});
    if (req.body.day4) 
        input_day_n_time.push({day: req.body.day4, time: req.body.time4});
    if (req.body.day5) 
        input_day_n_time.push({day: req.body.day5, time: req.body.time5});
    const input_students = req.body.students;

    // object_id로 외래키 참조
    Course.createCourse(input_title, input_day_n_time, req.session.userInfo['objectId'], input_students)
    .then(newCourse=>{
        res.render('return', {msg:"강의 생성이 완료되었습니다 !"});
    })
    .catch(err=>res.json(err));
});

//  ##########  /waiting_room/modify_course
router.post('/modify', function (req, res) {
    if (!req.session.userInfo) 
        return res.render('return', {msg:"잘못된 접근입니다 !"});

    res.redirect('/course/modify?course_objectId='+req.body.course_objectId);
});


router.get('/modify', async function (req, res){
    if (!req.session.userInfo) 
        return res.render('return', {msg:"잘못된 접근입니다 !"});

    // 선택한 course의 objectId를 이용하여 course의 정보 가져옴
    const course_objectId = req.query.course_objectId;
    const course = await Course.findOne({'_id':course_objectId});
    // 선생님과 같은 소속인 학생들의 배열
    const students = await User.findSameAffiliation(req.session.userInfo['affiliation'], req.session.userInfo['type']);

    // 코스의 선생님 objectId와 자신의 objectId가 다를 경우 권한 없음
    if(course.teacher.toString() !== req.session.userInfo['objectId'])
        return res.render('return', {msg:"잘못된 접근입니다 !"});

    
    res.render('modify_course',{course_info: course, students_info: students});
});

router.post('/modify_course', async function (req, res){
    
    const course_objectId = req.body.course_objectId;
    
    const input_title = req.body.title;
    const input_day_n_time = [{
            day: req.body.day1,
            time: req.body.time1
        }];

    //  강의 시간 추가되었을 경우에 추가적으로 저장
    if (req.body.day2) 
        input_day_n_time.push({day: req.body.day2, time: req.body.time2});
    if (req.body.day3) 
        input_day_n_time.push({day: req.body.day3, time: req.body.time3});
    if (req.body.day4) 
        input_day_n_time.push({day: req.body.day4, time: req.body.time4});
    if (req.body.day5) 
        input_day_n_time.push({day: req.body.day5, time: req.body.time5});
    const input_students = req.body.student;

    const course_data = {title:input_title, time: input_day_n_time, teacher: req.session.userInfo['objectId'], students:input_students};
    // object_id로 외래키 참조
    await Course.modifyCourse(course_objectId, course_data);
    
    res.render('return', {msg:"수정이 완료되었습니다 !"});
});

router.post('/delete_course', async function (req, res){

    const course_objectId = req.body.course_objectId;

    await Course.deleteCourse(course_objectId);
    
    res.render('return', {msg:"삭제가 완료되었습니다 !"});
});
module.exports = router;