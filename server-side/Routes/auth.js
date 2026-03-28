import { Router } from "express";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Admin from "../models/admin.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import middle from "../middleware/mid1.js";

const router = Router();

router.post("/signup", [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 4 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Admin({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ message: "Error registering user" });
    }
});


// ✅ FIXED LOGIN
router.post("/login", [
    body("email").isEmail(),
    body("password").notEmpty()
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let existingUser = await Admin.findOne({ email });
        let role = "Admin";

        if (!existingUser) {
            existingUser = await User.findOne({ email });
            role = "User";
        }

        if (!existingUser) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const check = await bcrypt.compare(password, existingUser.password);

        if (!check) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const payload = {
            user: {
                id: existingUser._id,
                role: role
            }
        };

        const token = jwt.sign(payload, process.env.secret_key);

        res.status(200).json({
            token,
            user: {
                id: existingUser._id,
                role
            }
        });

    } catch (err) {
        res.status(500).json({ message: "Error logging in" });
    }
});


// ✅ FIXED ADD MEMBER
router.post("/addmember", middle, async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(403).json({ message: "Only admins can add members" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            managerId: req.user.id // ✅ added
        });

        await newUser.save();

        res.status(201).json({ message: "Member added successfully" });

    } catch (err) {
        res.status(500).json({ err:err,message: "Error adding member" });
    }
});


// ✅ FIXED PROFILE
router.get("/profile", middle, async (req, res) => {
    const userId = req.user.id;

    try {
        const existingUser = await User.findById(userId).select("name email");

        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const completedTasks = await Task.countDocuments({
            assignedTo: userId,
            status: "completed"
        });

        const accuracy =
            totalTasks === 0 ? 0 :
            Number(((completedTasks / totalTasks) * 100).toFixed(2));

        res.json({
            name: existingUser.name,
            email: existingUser.email,
            completedTasks,
            totalTasks,
            accuracy
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});

export default router;