var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define schema for Room
const roomSchema = new Schema({
    name: { type: String, required: true },
    // other room properties...
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Reference to Users
});


const Room = mongoose.model('Room', roomSchema);

module.exports = Room;