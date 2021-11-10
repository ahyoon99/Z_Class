const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    console.log(req.user);
    if(req.user.type === "student"){
        res.render("class_student");

    }
    else if(req.user.type === "teacher"){
        res.render("class_teacher",{isTeacher: false});
    }
});

module.exports = router;

