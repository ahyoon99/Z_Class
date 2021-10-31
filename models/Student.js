const mongoose = require("mongoose"); // mongoose 불러오기

// Schema 생성
const StudentSchema = new mongoose.Schema({
  s_member_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  }
});

// model을 export 해주기
var Student = mongoose.model("student", StudentSchema);
module.exports = Student;