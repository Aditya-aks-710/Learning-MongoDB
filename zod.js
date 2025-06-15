const { z } = require("zod");

const signupSchema = z.object({
    email: z.string().email("Invalid Email address"),
    password: z.string().min(8, "Password must be of 8 characters long"),
    name: z.string().min(1, "Name is Required")
});

const signinSchema = z.object({
    email: z.string().email("Invalid Email address"),
    password: z.string().min(8, "Password must be of 8 characters long")
});

module.exports = {
    signupSchema,
    signinSchema
}