const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    id: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    type: {type: String, require: true}
});

module.exports = mongoose.model('users', usersSchema);