const mongoose = require('mongoose')
const express = require("express")
const app = express();
require("dotenv").config();
const url = 'mongodb+srv://jaiminjoshi118:JaiminJoshi@cluster0.bvcyzld.mongodb.net/'
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then((responce) => {
            console.log("Connected to MongoDB , ", responce.connection.name);
        })
        .catch((err) => console.log(err));
