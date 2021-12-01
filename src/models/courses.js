const mongoose = require('mongoose');
const User = require('../models/users');

// ##########  강의 정보 DB  ##########
// 강의 이름, 강의 시작 시간, 선생님 _id, 학생 _id 배열, 첫번째 수업인지 여부 (출석 체크 시 db를 새로 생성할지 수정할지에 사용)
const coursesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    time: [{ type: Object, required: true }],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    isFirst: {type: Boolean, required: true}
},{ versionKey:false });


// #####  강의 생성  #####
// 인수 : 강의명 (String), 시간 (Object{day, time}), 선생님 _id, 학생 _id의 배열
coursesSchema.statics.createCourse = function (_title, _times, _teacher_id, _students) {
    // data로 받은 수강 학생 _id가 배열로 오는 경우와 1개만 오는 경우가 있어 구별하여 배열에 넣어줌
    const student_ids = [];
    if (Array.isArray(_students)) 
        _students.forEach(_student => student_ids.push(mongoose.Types.ObjectId(_student)));
    else 
        student_ids.push(mongoose.Types.ObjectId(_students));
    
    // 수강 학생이 없는 경우와 있는 경우에 따라 생성
    let new_course;
    if (_students) 
        new_course = new this(
            {title: _title, time: _times, teacher: _teacher_id, students: student_ids, isFirst:true}
        );
    else 
        new_course = new this(
            {title: _title, time: _times, teacher: _teacher_id, isFirst:true}
        );
    return new_course.save();
}

// ####  수강중인 강의 전부 가져오기  #####
// 인수: 요청한 사용자의 타입 ( 학생/선생님 ), 요청한 사용자의 _id
// 대기실 페이지에서 해당 사용자의 강의 목록 출력을 위함
coursesSchema.statics.findCourses = async function(_user_type, _objectId){
    if(_user_type==='student')
        return this.find({'students':_objectId});
    else if(_user_type==='teacher')
        return this.find({'teacher':_objectId});
}

// ##### 강의 수정  #####
// 인수 : 해당 강의의 _id, 수정된 데이터
coursesSchema.statics.modifyCourse = async function (_objectId, _data) {
    const course = await this.findOne({'_id': _objectId});
    course.title = _data.title;
    course.time = _data.time;
    course.teacher = _data.teacher;

    // data로 받은 수강 학생 _id가 배열로 오는 경우와 1개만 오는 경우가 있어 구별하여 배열에 넣어줌
    const student_ids = [];
    if (Array.isArray(_data.students)) 
        _data.students.forEach(_student => student_ids.push(mongoose.Types.ObjectId(_student)));
    else 
        student_ids.push(mongoose.Types.ObjectId(_data.students));
    
    // 수강중인 학생 없는 경우와 있는 경우
    if (_data.students) 
        course.students = student_ids;
    else
        course.students = [];
    
    return course.save();
}

// ##### 강의 삭제  #####
// course의 _id를 이용해 찾은 강의 삭제
coursesSchema.statics.deleteCourse = async function(_objectId){
    return this.deleteOne({'_id':_objectId});
}

module.exports = mongoose.model('courses', coursesSchema);