const express = require("express");
const { addParlay, getParlays, updateParlay, deleteParlay } = require("../controllers/parlayController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Protect routes with authentication middleware
router.post("/", authMiddleware, addParlay); // Create
router.get("/", authMiddleware, getParlays); // Read all
router.put("/:id", authMiddleware, updateParlay); // Update
router.delete("/:id", authMiddleware, deleteParlay); // Delete

module.exports = router;