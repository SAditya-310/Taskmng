const solve = async (data) => {
    if (!data || data.length === 0)
        return { priorityTask: null, count: 0, cntpd: 0 };

    let count = 0;     
    let cntpd = 0;     
    let bestTask = null;
    let bestScore = -Infinity;

    const now = Date.now();

    for (const task of data) {

        if (task.status === "overdue") continue;

        if (task.status === "completed") {

            if (!task.doneAt) continue;

            const [year, month, day] = task.doneAt.split("-").map(Number);
            const [hour, minute] = (task.doneTime || "00:00").split(":").map(Number);

            const doneTimeMs = new Date(year, month - 1, day, hour, minute, 0).getTime();

            const diffMs = now - doneTimeMs;

            if (diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000) {
                count++;
            }

            continue;
        }

        cntpd++;

        const d = new Date(task.deadline);

        const year  = d.getUTCFullYear();
        const month = d.getUTCMonth();      
        const day   = d.getUTCDate();

        const [hour, minute] = (task.time || "23:59").split(":").map(Number);

        const deadlineMs = new Date(year, month, day, hour, minute, 0).getTime();

        const diffMs = deadlineMs - now;
        const hoursRemaining = diffMs / (1000 * 60 * 60);

        let urgencyBoost;

        if (diffMs <= 0) {
            urgencyBoost = 200;
        } else {
            urgencyBoost = Math.min(200, 50 * Math.exp(-hoursRemaining / 6));
        }

        const importance = task.importance || 1;

        const score = (importance * 10) + urgencyBoost;

        const taskObj = task.toObject ? task.toObject() : task;

        if (score > bestScore) {
            bestScore = score;
            bestTask = { ...taskObj, priorityScore: score };
        }
    }

    return {
        priorityTask: bestTask,
        count: count,
        cntpd: cntpd
    };
};

export default solve;