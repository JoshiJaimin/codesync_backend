const User = require("../models/user")
const express = require("express");
const app = express();
const router = express.Router()

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

app.use(express.json());
const port = process.env.PORT || 8080;

router.post("/signup", async (req, res) => {
    try {
    
        const newUser = new User(req.body);
        const username = req.body.username;
        const us = await User.findOne({ username });
        if (us) {
            res.status(400).json({ message: "username Already Exist" });
            return res;
        }
        const encryptedPassword = await bcrypt.hash(req.body.password, 10);
        newUser.password = encryptedPassword;
        const user = await newUser.save();
        res.status(201).json({ user });
    } catch (e) {
        console.log(e);
        res.status(400).json({ message: "Error in user registration" });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {

        const existingUser = await User.findOne({ username: username });
        if (!existingUser) {
            return res.status(404).json({ message: "User Not Found" });
        }
        const isMatchedPassword = await bcrypt.compare(password, existingUser.password);
        if (!isMatchedPassword) {
            return res.status(400).json({ message: "Invalid Credential" });
        }
        const token = jwt.sign({ email: existingUser.email }, "KLklwerklLKJekrjwlkjSDA", { expiresIn: 500000000 })
        res.status(201).json({ users: existingUser, token: token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Something Went Wrong" })
    }
})



module.exports = router;