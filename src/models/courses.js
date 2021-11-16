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
    const new_course = new this({
        title:_title,
        time: _times,
        teacher: _teacher_id,
        students: _students
    });
    return new_course.save();
}

module.exports = mongoose.model('courses', coursesSchema);