const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
    // course_id:{
    //     type:Number,
    //     required:true,
    //     min:1,      //최소값설정
    // },
    title:{
        type:String,
    },
    day:{
        type:String,
    },
    // t_member_id:{
    //     type:String,
    //     required:true,
    // },
    start_time:{
        type:String,
    },
    // student_count:{
    //     type:Number,
    //     required:true
    // }
});

module.exports = mongoose.model('Course',courseSchema);