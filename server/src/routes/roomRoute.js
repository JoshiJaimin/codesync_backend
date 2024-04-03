const express = require("express");
const app = express();
const router = express.Router()
const User = require("../models/user")
const Room = require("../models/room")

//Creating a newRoom
router.post("/create", async (req, res) => {
    try {
        // Create a new room
        const room = await Room.create({ name: req.body.roomname });

        // Add the user who creates the room to the array of users
        const user = await User.create({
            username: req.body.username,
            password: req.body.password
            // Add other user properties if needed
        });
        room.users.push(user);
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Something Went Wrong" })
    }
})

//Add user to existing room
router.post("/AddUser/:roomId", async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        room.users.push(user);
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "err" })
    }
})

module.exports = router;


