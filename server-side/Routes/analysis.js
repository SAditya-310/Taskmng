import express from "express";
import { GoogleGenAI } from "@google/genai";

import User from "../models/User.js";
import Task from "../models/Task.js";

const router = express.Router();

const ai = new GoogleGenAI({
    apiKey: process.env.gemini_key
});

const getTaskOwnerId = (task) => {
    if (!task) return "";
    if (typeof task.assignedTo === "string") return task.assignedTo;
    return String(task.assignedTo?._id || task.assignedTo?.id || task.assignedToId || "");
};

const buildTeamStats = (members = [], tasks = []) => {
    return members.map((member) => {
        const memberTasks = tasks.filter((task) => getTaskOwnerId(task) === String(member._id));
        const assignedTasks = memberTasks.length;
        const completedTasks = memberTasks.filter((task) => task.status === "completed").length;
        const pendingTasks = memberTasks.filter((task) => task.status === "pending").length;
        const overdueTasks = memberTasks.filter((task) => task.status === "overdue").length;
        const onTimeTasks = memberTasks.filter((task) => task.status === "completed" && !task.doneAt ? false : true).length;

        return {
            memberId: member._id,
            name: member.name,
            assignedTasks,
            completedTasks,
            pendingTasks,
            overdueTasks,
            completionRate: assignedTasks === 0 ? 0 : Math.round((completedTasks / assignedTasks) * 100),
            lateWork: Math.max(0, completedTasks - onTimeTasks)
        };
    });
};

const parseGeminiJson = (text) => {
    if (!text) return null;
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const jsonText = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;

    try {
        return JSON.parse(jsonText);
    } catch {
        return null;
    }
};

router.post("/team-analysis", async (req, res) => {
    try {
        const { members = [], tasks = [] } = req.body;
        const teamStats = buildTeamStats(members, tasks);

        const prompt = `
You are an Engineering Manager.

Analyze the team statistics.

Return JSON.

{
"overallSummary":"",
"productivity":"",
"deadlineHealth":"",
"workloadBalance":"",
"managerInsight":[
"...",
"..."
],
"employees":[
{
"name":"",
"summary":""
}
]
}

The employee summary should be 2–3 professional sentences.

Avoid using headings like strengths or weaknesses.

Sound like a real engineering manager writing a sprint report.

Keep the report concise.

Team statistics:

${JSON.stringify(teamStats, null, 2)}

Return JSON only.
`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const reply =
            response.text?.trim() ||
            (response.candidates || [])
                .map((c) => (c.content?.parts || []).map((p) => p.text || "").join("")).join("")
                .trim() ||
            "";

        if (!reply) {
            console.error("Gemini returned empty response", response);
            return res.status(500).json({ message: "Gemini returned an empty response" });
        }

        const analysis = parseGeminiJson(reply);

        if (!analysis) {
            console.error("Failed to parse Gemini JSON. Reply:", reply);
            return res.status(500).json({ message: "Gemini returned invalid JSON" });
        }

        res.json(analysis);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
});

export default router;