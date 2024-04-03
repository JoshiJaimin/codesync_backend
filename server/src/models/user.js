var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	username:  {
        type:String,
        required:true
    },
	password:  {
        type:String,
        required:true,
    },
}),

User = mongoose.model('User', userSchema);
module.exports = User;