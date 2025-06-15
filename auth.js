require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function auth(req, res, next) {
    const token = req.headers.token;
    if(!token) {
        return res.status(404).json({
            message: "Please Signin"
        });
    }
    const response = jwt.verify(token, JWT_SECRET);
    if(response){
        req.userId = response.id;
        next();
    }
    else{
        res.status(403).json({
            message: "Please Signin"
        });
    }
}

module.exports = {
    auth,
    JWT_SECRET
}