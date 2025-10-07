const { model, Schema } = require('mongoose');

const UserSchema = new Schema({
    UserName: String,
    Email: String,
    Password: String,
});

module.exports = model('UserSchema', UserSchema);
