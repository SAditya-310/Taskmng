import { Router } from "express";
import User from "../models/User.js";
import Task from "../models/Task.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import middle from "../middleware/mid1.js";
const router=Router();
router.post("/signup",[
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({min:4}).withMessage("Password must be at least 6 characters long")
],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {name,email,password}=req.body;
    try{
        const existingUser=await User.findOne({email:email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const newUser=new User({
            name:name,
            email:email,
            password:hashedPassword
        });
        await newUser.save();
        res.status(201).json({message:"User registered successfully"});
    }catch(err){
        res.status(500).json({message:"Error registering user",error:err});
    }
});
router.post("/login",[
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {email,password}=req.body;
    try{
        const existingUser=await User.findOne({email:email});
        if(!existingUser){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const check=await bcrypt.compare(password,existingUser.password);
        if(!check){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const payload={
            user:{
                id:existingUser._id
            }
        }
        const token=jwt.sign(payload,process.env.secret_key);
        res.status(200).json({token:token});
    }catch(err){
        res.status(500).json({message:"Error registering user",error:err});
    }
});

router.get("/profile", middle, async (req, res) => {
    const userId = req.user.id;
    try {
        const existingUser = await User.findById(userId).select("name email");
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const totalTasks = await Task.countDocuments({ id: userId });
        const completedTasks = await Task.countDocuments({ id: userId, status: "completed" });
        const accuracy = totalTasks === 0 ? 0 : Number(((completedTasks / totalTasks) * 100).toFixed(2));

        return res.status(200).json({
            name: existingUser.name,
            email: existingUser.email,
            completedTasks,
            totalTasks,
            accuracy
        });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
});

export default router;