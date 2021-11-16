const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    id: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    type: {type: String, require: true},
    name: {type: String, require: true},
    grade: {type: Number, min:1, max:6},
    phone_number: {type: String, require: true},
    affiliation: {type: String, require: true},
    courses: [{type:mongoose.Schema.Types.ObjectId, ref:'courses'}]
},{versionKey:false});


usersSchema.statics.signUp = function(userInfo){
    const user = new this(userInfo);
    if(user.type==='teacher')
        user.grade=null;
    return user.save();
}

module.exports = mongoose.model('users', usersSchema);