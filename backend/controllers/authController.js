const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Register new user
exports.register = async (req, res) => {
    const { username, email, password } = req.body; //get user data from req
    try {
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
            [username, email, hashedPass]
        );
        res.json(newUser.rows[0]); //return new user exlcuding pass
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//login user
exports.login = async (req, res) => {
    const { email, password } = req.body; // get email and pass from login req
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]); //filter results to return only row where email column matches
        if (!user.rows.length) return res.status(400).json({ error: "User not found" });

        const isValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isValid) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};