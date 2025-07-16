const express = require('express');
const router = express.Router();

const interactionsController = require("../controllers/interactions.controller");

const authJWTMiddleware = require("../middlewares/authJWT.middleware")

router.get("/search", authJWTMiddleware, interactionsController.searchUser);
router.post("/swipe/:targetId", authJWTMiddleware, interactionsController.swipeUser);
router.get("/matches", authJWTMiddleware, interactionsController.getMatches);
router.delete("/matches/:targetId", authJWTMiddleware, interactionsController.deleteMatch);

module.exports = router;