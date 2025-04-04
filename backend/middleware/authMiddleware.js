const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization"); //get token from req header
    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); //verify token
        req.user = verified; //attach user data to req
        next(); //proceed to next mw or route
    } catch (err) {
        res.status(400).json({ error: "Invalid token" });
    }
};