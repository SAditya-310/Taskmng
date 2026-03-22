import jwt from "jsonwebtoken";
function safeHandler(req, res, next) {
    const token = req.headers['token'];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    try {
        const data = jwt.verify(token, process.env.secret_key);
        req.user = data.user;  
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        return res.status(403).json({ 
            message: "Unauthorized: Invalid or expired token",
            error: err.message 
        });
    }
}
export default safeHandler;