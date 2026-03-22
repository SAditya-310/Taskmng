import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express, { application } from "express";
import cors from "cors";
import taskroute from "./Routes/tasks.js";
import authroute from "./Routes/auth.js";
const app=express();
app.use(cors());
app.use(express.json());
const PORT=5000;
await mongoose.connect(process.env.mongo_uri).then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("Error connecting to MongoDB",err);
});
app.use("/",taskroute);
app.use("/",authroute);
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});