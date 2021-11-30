const mongoose = require('mongoose');
const Course = require('../models/courses');
const Attendance = require('../models/attendances');


const attendance_schema = new mongoose.Schema({
    course_id:{type: mongoose.Schema.Types.ObjectId, ref: 'courses', required:true},
    data:{type: Map} // key는 날짜, value는 map(key:학생, value: 출석여부)
});

//  #####  출석 체크 함수  #####
attendance_schema.statics.checkAttendance = function (_course_id, _student_ids) {
    // 
    let students = [];
    Course.findById(_course_id, function (err, doc) {
        students = doc.students;
    });
    console.log(students);

    let attendance_map = new Map();
    students.foreach(_student_id => attendance_map.set(_student_id, '결석'));
    _student_ids.foreach(_student_id => attendance_map.set(_student_id, '출석'));

    const now = new Date();
    const date = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    const today = year.toString() + month.toString() + date.toString();

    this.findById(_course_id, function(err,doc)
    {
        if(doc){
            console.log("있음");
        }
        else{
            console.log("없음");
        }
    });
}



module.exports = mongoose.model('attendances', attendance_schema);