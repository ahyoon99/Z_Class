const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    console.log(req.user);
    if(req.user.type === "student"){
        res.render("class_student.html");

    }
    else if(req.user.type === "teacher"){
        res.render("class_teacher.html",{isTeacher: false});
    }
});

module.exports = router;

