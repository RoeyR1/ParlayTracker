const pool = require('../config/db');

exports.addParlay = async (req, res) => { //parlay table crud ops
    const { date, money_spent, win, num_legs } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO parlays (user_id, date, money_spent, win, num_legs) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [req.user.id, date, money_spent, win, num_legs]
        );
        res.json(result.rows[0]);//return entry
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};

exports.getParlays = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM parlays WHERE user_id = $1 ORDER BY date DESC",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateParlay = async (req, res) => {
    const { id } = req.params;
    const { date, money_spent, win, num_legs } = req.body;
    try {
        const result = await pool.query(
            "UPDATE parlays SET date = $1, money_spent = $2, win = $3, num_legs = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
            [date, money_spent, win, num_legs, id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Parlay not found or not authorized to update" });
        }
        res.json(result.rows[0]); // Return the updated entry
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteParlay = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM parlays WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Parlay not found or not authorized to delete" });
        }
        res.json({ message: "Parlay deleted successfully" }); // Confirm deletion
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
