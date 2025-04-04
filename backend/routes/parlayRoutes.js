const express = require("express");
const { addParlay, getParlays, updateParlay, deleteParlay } = require("../controllers/parlayController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Protect routes with authentication middleware
router.post("/", authMiddleware, addParlay); // Create parlay
router.get("/", authMiddleware, getParlays); // Read all
router.put("/:id", authMiddleware, updateParlay); // Update existing parlay given id
router.delete("/:id", authMiddleware, deleteParlay); // Delete exisitng parlay given id

module.exports = router;