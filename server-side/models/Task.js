import mongoose from "mongoose";
const taskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    deadline:{
        type:Date,
        required:true
    },
    importance:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["pending","completed","overdue"],
        default:"pending"
    },
    time:{
        type:String,
        required:true
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }, 
    assignedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin",
        required:true
    },
    doneAt:{
        type:String,
        default:null
    },
    doneTime:{
        type:String,
        default:null
    }
});
const Task=mongoose.model("Task",taskSchema);
export default Task;