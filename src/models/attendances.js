const mongoose = require('mongoose');
const Course = require('../models/courses');
const Attendance = require('../models/attendances');


// ##########  출석부  DB  ##########
// course_id와 data로 이루어짐
// course_id: course의 _id로 각 course별로 하나의 출석부가 존재
// data로는 Map(key: 날짜, value: Map(key: 학생의 _id, value: 출석정보 String))
const attendance_schema = new mongoose.Schema({
    course_id:{type: mongoose.Schema.Types.ObjectId, ref: 'courses', required:true},
    data:{type: Map, of: Map}
},{ versionKey:false });

// #####  출석 체크 함수  #####
// 해당 코스의 _id와 현재 출석처리할 학생들의 _id를 받아 db에 등록
attendance_schema.statics.checkAttendance = async function (_course_id, _attendance_infos) {
    const course_info = await Course.findOne({'_id': _course_id});
    if (!course_info.students) // 학생 정보 없을 시 출석체크 진행 종료
        return;
    



    // 날짜 String 생성, YYYYMMDD의 형식
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const today = year + month + date;

    let attendance_infos = {};
    for(let i in _attendance_infos){
        attendance_infos[i] = _attendance_infos[i].current;
    }


    // 처음 출석체크일 경우 출석부 생성, 아닐 경우 출석부 불러와서 출석정보 추가
    let attendance;
    let date_map;

    console.log('실행됨');
    if (course_info.isFirst) {
        date_map = new Map();
        attendance = new this({course_id: _course_id,data: date_map.set(today, attendance_infos)});
        course_info.isFirst = false;
        await course_info.save();
    } else {
        attendance = await this.findOne({"course_id": _course_id});
        attendance.data.set(today, attendance_infos);
    }

    return attendance.save();

}

attendance_schema.statics.viewAttendance = async function(_course_id){
    const attendance_info = await this.findOne({"course_id": _course_id});
    const attendance = attendance_info.data;
    let temp ={};
    attendance.forEach((value, key, mapObject) =>{
        temp[key] = {};
        value.forEach((_value,_key,_mapObject)=>{
            temp[key][_key] = _value;
        });
    });

    return temp;
}


module.exports = mongoose.model('attendances', attendance_schema);