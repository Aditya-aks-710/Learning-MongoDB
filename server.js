require("dotenv").config();
const express = require("express");
const { z }  = require("zod");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const SALT_ROUND = parseInt(process.env.SALT_ROUND);
mongoose.connect(process.env.MONGO_URI);


const { UserModel, TodoModel } = require("./db");

const { auth, JWT_SECRET } = require("./auth");

const { signupSchema, signinSchema } = require("./zod");


const app = express();

app.use(express.json());


app.post("/signup", async function(req, res) {
    try {
        const valid = signupSchema.parse(req.body);

        const email = valid.email;
        const password = valid.password;
        const name = valid.name;

        const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

        await UserModel.create({
            email: email,
            password: hashedPassword,
            name: name
        });

        res.json({
            message: "SignUp successful"
        });

    } catch(e) {
        console.log(e);
        if(e instanceof z.ZodError) {
            return res.status(400).json({
                errors: e.errors.map(err => err.message)
            })
        }
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

app.post("/signin", async function(req, res) {
    try {
        const valid = signinSchema.parse(req.body);

        const email = valid.email;
        const password = valid.password;

        const response = await UserModel.findOne({
            email: email
        });

        const passwordMatch = await bcrypt.compare(password, response.password); 

        if(response && passwordMatch){
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
    } catch(e) {
        if(e instanceof z.ZodError){
            return res.status(400).json({
                errors: e.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            message: "Error while signing in"
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

app.listen(process.env.PORT);