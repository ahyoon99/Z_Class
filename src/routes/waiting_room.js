const express = require('express');
const User = require('../models/users');
const Course = require('../models/courses');
const router = express.Router();

//  ##########  /waiting_room 주소로 접속 시
router.get('/', function(req, res){
    if(!req.session.userInfo){
        return res.send('잘못된 접근입니다.');
    }

    // 세션에 저장해둔 id를 이용하여 db에서 유저 type을 확인
    User.findOne({'id':req.session.userInfo['id']})
        .exec((err, user)=>{
            if(err)
                return res.json(err);
            if(user){                       // 학생읜 경우와 선생님인 경우를 구별하여 각각에 해당하는 페이지 render
                if(user.type==='student'){
                    res.render('waiting_room_student',{user_name: req.session.userInfo['name']});
                }
                else if(user.type==='teacher'){
                    res.render('waiting_room_teacher',{user_name: req.session.userInfo['name']});
                }
            }
            else{
                return res.json(err);
            }
        });
    
});

//  ##########  /waiting_room/make_course 주소로 접속 시
router.get('/make_course', function (req, res) {
    if (!req.session.userInfo) 
        return res.send('잘못된 접근입니다.');
    
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


//  ##########  /waiting_room/make_course 주소에서 post 방식으로 form 전송
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
    const input_students = req.body.student;

    // object_id로 외래키 참조
    Course.createCourse(input_title, input_day_n_time, req.session.userInfo['object_id'], input_students)
    .then(newCourse=>{
        res.send('강의 생성 완료');
    })
    .catch(err=>res.json(err));
});


module.exports = router;