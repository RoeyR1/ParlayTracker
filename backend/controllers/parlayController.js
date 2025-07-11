const pool = require('../config/db');

exports.addParlay = async (req, res) => {
    const { date, money_spent, win, num_legs, payout } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO parlays (user_id, date, money_spent, win, num_legs, payout) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [req.user.id, date, money_spent, win, num_legs, win ? payout : 0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error in addParlay:", err); // Log error to backend console
        res.status(500).json({ error: err.message });
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
    const { date, money_spent, win, num_legs, payout } = req.body; // Include payout

    try {
        const result = await pool.query(
            `UPDATE parlays
             SET date = $1,
                 money_spent = $2,
                 win = $3,
                 num_legs = $4,
                 payout = $5
             WHERE id = $6 AND user_id = $7
             RETURNING *`,
            [
                date,
                money_spent,
                win,
                num_legs,
                win ? payout : 0, // If it's a loss, store payout as 0
                id,
                req.user.id
            ]
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
