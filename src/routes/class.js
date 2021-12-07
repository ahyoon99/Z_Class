const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    /*
    if (!req.session.userInfo||!req.session.canEnter) 
        return res.render('1_main/return', {msg:"잘못된 접근입니다 !"});
    */
    // 세션에 저장해둔 사용자 정보의 type을 확인해 해당하는 페이지로 이동
    if (req.session.userInfo['type'] === 'student') {
        res.render('3_class/class_student');
    } else if (req.session.userInfo['type'] === 'teacher') {
        res.render('3_class/class_teacher');
    }
});

// # 학생인 경우 출석인증 페이지, 선생님인 경우 바로 입장 #
router.post('/', function (req, res){
    req.session.course_objectId = req.body.course_objectId;
    req.session.save();
    //res.redirect('/class');

    /// * //     테스트 간소화
    if (req.session.userInfo['type'] === 'student') {
        res.redirect('/class/init');
    } else if (req.session.userInfo['type'] === 'teacher') {
        res.redirect('/class');
    }
    // */
});

// #####  수업 페이지 입장 전 중간 페이지   #####
// 출석 인증 수행
router.get('/init', function(req,res){
    if (!req.session.userInfo||!req.session.course_objectId) 
        return res.render('1_main/return', {msg:"잘못된 접근입니다 !"});

    res.render('3_class/class_init');
})

module.exports = router;