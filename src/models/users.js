const mongoose = require('mongoose');

// #########  회원 정보 DB  ##########
// type: student/teacher, grade: 학생의 경우 학년 표시, phone_number: 학생의 경우 부모님 번호, affiliation: 소속 ( 같은 소속인 학생과 선생님끼리만 수업 )
const usersSchema = new mongoose.Schema({
    id: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    type: {type: String, require: true},
    name: {type: String, require: true},
    grade: {type: Number, min:1, max:6},
    phone_number: {type: String, require: true},
    affiliation: {type: String, require: true},
},{ versionKey:false });

// #####  회원 가입  #####
// userInfo 객체를 받아 저장
usersSchema.statics.signUp = function(userInfo){
    const user = new this(userInfo);
    if(user.type==='teacher')
        user.grade=null;
    return user.save();
}

// #####  같은 소속 회원 찾기  #####
// 소속과 주체의 타입을 넣으면 같은 소속인 다른 타입인 회원들 return
usersSchema.statics.findSameAffiliation = function(_affiliation, _type){
    if(_type==='teacher')
        return this.find({'affiliation':_affiliation, 'type':'student'});
    else if(_type==='student')
        return this.find({'affiliation':_affiliation,'type':'teacher'})
}

module.exports = mongoose.model('users', usersSchema);