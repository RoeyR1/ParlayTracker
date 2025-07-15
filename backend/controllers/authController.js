const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login
exports.googleLogin = async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        // Try to find user by email
        let user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (!user.rows.length) {
            // Create user with Google info, no password
            const newUser = await pool.query(
                "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
                [name || email, email, '']
            );
            user = { rows: [newUser.rows[0]] };
        }
        // Issue JWT
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
    } catch (err) {
        res.status(401).json({ error: 'Invalid Google token' });
    }
};