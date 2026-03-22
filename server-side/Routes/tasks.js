import { Router } from "express";
import Task from "../models/Task.js";
import { body, validationResult } from "express-validator";
import middle from "../middleware/mid1.js";
import solve from "../calc/prioritycalc.js";
const router = Router();
router.post("/addtask", middle, [
    body("title").notEmpty().withMessage("Title is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
    body("priority").isInt({ min: 1, max: 10 }).withMessage("Priority must be between 1 and 10")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const Id = req.user.id;
    const { title, date, time, priority } = req.body;
    const newTask = new Task({
        title: title,
        deadline: date,
        time: time,
        importance: priority,
        id: Id
    });
    try {
        const savedTask = await newTask.save();
        const deadlineDate = new Date(savedTask.deadline);
        const formattedDeadline = deadlineDate.toISOString().split('T')[0];
        res.status(201).json({
            _id: savedTask._id,
            title: savedTask.title,
            date: formattedDeadline,
            deadline: formattedDeadline,
            time: savedTask.time,
            priority: savedTask.importance,
            category: "General",
            status: savedTask.status,
            doneAt: savedTask.doneAt,
            doneTime: savedTask.doneTime
        });
    } catch (err) {
        res.status(500).json({ message: "Error adding task", error: err });
    }
});
router.get("/gettask", middle, async (req, res) => {
    const Id = req.user.id;
    const { status } = req.query;
    const query={ id: Id };
    if(status &&status!=="all"){
        query.status=status;
    }
    try {
        const taskdata = await Task.find(query);
        if (!taskdata) {
            res.status(401).send("Not found");
        }
        const formattedTasks = taskdata.map(task => {
            const deadlineDate = new Date(task.deadline);
            const formattedDeadline = deadlineDate.toISOString().split('T')[0];
            return {
                _id: task._id,
                title: task.title,
                date: formattedDeadline,
                deadline: formattedDeadline,
                time: task.time,
                priority: task.importance,
                category: "General",
                status: task.status,
                doneAt: task.doneAt,
                doneTime: task.doneTime
            };
        });
        res.status(200).json(formattedTasks);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching tasks", error: err });
    }
});
router.get("/getprioritytask", middle, async (req, res) => {
    const Id = req.user.id;
    try {
        const taskdata = await Task.find({ id: Id });
        if (!taskdata || taskdata.length === 0) {
            return res.status(200).json(null);
        }
        const {priorityTask,count,cntpd} = await solve(taskdata);
        if (!priorityTask) return res.status(200).json(null);
        const deadlineDate = new Date(priorityTask.deadline);
        const formattedDeadline = deadlineDate.toISOString().split('T')[0];
        res.status(200).json({
            task:{
                _id: priorityTask._id,
            title: priorityTask.title,
            deadline: formattedDeadline,
            time: priorityTask.time,
            priority: priorityTask.importance,
            status: priorityTask.status
            },
            count:count,
            cntpd:cntpd
        });
    } catch (err) {
        console.error("Priority Route Error:", err);
        res.status(500).json({
            message: "Error fetching tasks",
            error: err.message
        });
    }
});
router.post("/mark/:id", middle, async (req, res) => {
    const taskId = req.params.id;
    const Id = req.user.id;
    try {
        const task = await Task.findOne({ _id: taskId, id: Id });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if(task.status==="completed"){
            return res.status(400).json({ message: "Task is already marked as completed" });
        }
        if(task.status==="overdue"){
            return res.status(400).json({ message: "Task is overdue and cannot be marked as completed" });
        }
        task.status = "completed";
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        task.doneAt = date;
        task.doneTime = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
        await task.save();
        const deadlineDate = new Date(task.deadline);
        const formattedDeadline = deadlineDate.toISOString().split('T')[0];
        const msg="Task marked as completed";
        res.status(200).json({
            task:{
                _id: task._id,
            title: task.title,
            date: formattedDeadline,
            deadline: formattedDeadline,
            time: task.time,
            priority: task.importance,
            category: "General",
            status: task.status,
            doneAt: task.doneAt,
            doneTime: task.doneTime,
            },
            message: msg
        });
    } catch (err) {
        console.error("Mark Task Error:", err);
        res.status(500).json({ message: "Error marking task as completed: " + err.message, error: err.message });
    }
});

router.delete("/task/:id", middle, async (req, res) => {
    const taskId = req.params.id;
    const Id = req.user.id;

    try {
        const deletedTask = await Task.findOneAndDelete({ _id: taskId, id: Id });
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({ message: "Task deleted successfully", taskId });
    } catch (err) {
        console.error("Delete Task Error:", err);
        return res.status(500).json({ message: "Error deleting task: " + err.message, error: err.message });
    }
});

router.get("/getcompleted", middle, async (req, res) => {
    const Id = req.user.id;
    try {
        const completedTasks = await Task.find({ id: Id, status: "completed" });
        completedTasks.sort((a, b) => {
            const fullDateB = new Date(`${b.doneAt}T${b.doneTime}`);
            const fullDateA = new Date(`${a.doneAt}T${a.doneTime}`);
            return fullDateB - fullDateA;
        });
        const topTwoTasks = completedTasks.slice(0, 2);
        res.status(200).json(topTwoTasks);
    } catch (err) {
        console.error("Get Completed Tasks Error:", err);
        res.status(500).json({ message: "Error fetching completed tasks: " + err.message, error: err.message });
    }
});
router.get("/getoverdue",middle,async(req,res)=>{
    const Id=req.user.id;
    try{
        const now=new Date();
        const tsk=Task.updateMany({id:Id,deadline:{$lt:now},status:"pending"},{$set:{status:"overdue"}});
        await tsk;
        res.status(200).json({message:"Overdue tasks updated"});
    }
    catch(err){
        console.error("Overdue Update Error:", err);
        res.status(500).json({message:"Error updating overdue tasks: "+err.message,error:err.message});
    }
});
export default router;