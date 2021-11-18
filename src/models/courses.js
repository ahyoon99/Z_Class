const mongoose = require('mongoose');
const User = require('../models/users');

const coursesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    time: [{ type: Object, required: true }],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
},{ versionKey:false });


//  강의 생성 시 사용하는 함수
//  인수로 강의명 (String), 시간 (Object{day, time})
//          선생님 objectId, 학생들의 ObjectId의 배열
coursesSchema.statics.createCourse = function(_title, _times, _teacher_id, _students){
    const student_ids = [];
    _students.forEach(_student => {
        student_ids.push(mongoose.Types.ObjectId(_student));
    });
    const new_course = new this({
        title:_title,
        time: _times,
        teacher: _teacher_id,
        students: student_ids
    });
    return new_course.save();
}

coursesSchema.statics.findCourses = async function(_user_type, _objectId){
    if(_user_type==='student')
        return this.find({'students':_objectId});
    else if(_user_type==='teacher')
        return this.find({'teacher':_objectId});
}

coursesSchema.statics.modifyCourse = async function(_objectId, _data){
    const course = await this.findOne({'_id':_objectId});
    course.title = _data.title;
    course.time = _data.time;
    course.teacher = _data.teacher;

    const student_ids = [];
    _data.students.forEach(_student => {
        student_ids.push(mongoose.Types.ObjectId(_student));
    });
    course.students = student_ids;

    return course.save();
}

coursesSchema.statics.deleteCourse = async function(_objectId){
    return this.deleteOne({'_id':_objectId});
}
module.exports = mongoose.model('courses', coursesSchema);