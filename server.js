require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

const { UserModel, TodoModel } = require("./db");

const { auth, JWT_SECRET } = require("./auth");
const app = express();

app.use(express.json());


app.post("/signup", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    await UserModel.create({
        email: email,
        password: password,
        name: name
    });

    res.json({
        message: "SignUp successful"
    });
});

app.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email: email,
        password: password
    });

    if(response){
        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_SECRET);
        res.json({
            token: token
        });

    } else {
        res.status(403).json({
            message: "Incorrect Credentials"
        });
    }
});

app.post("/todo", auth, async function(req, res) {
    const title = req.body.title;
    const id = req.userId;
    await TodoModel.create({
        userId: id,
        title: title
    });

    res.json({
        message: "Success"
    });
});

app.get("/todos", auth, async function(req, res) {
    const userId = req.userId;
    const todos = await TodoModel.find({userId});
    res.json(todos);
});

app.listen(3000);