const express = require('express');
const router = express.Router();

const interactionsController = require("../controllers/interactions.controller");

const authJWTMiddleware = require("../middlewares/authJWT.middleware")
const validateJoiMiddleware = require("../middlewares/validateJoi.middleware")

const {targetIdSchema, swipeSchema} = require('../validations/interactions.validation');

router.get("/search", authJWTMiddleware, interactionsController.searchUser);
router.post("/swipe/:targetId", authJWTMiddleware, validateJoiMiddleware(targetIdSchema, 'params'), validateJoiMiddleware(swipeSchema), interactionsController.swipeUser);
router.get("/matches", authJWTMiddleware, interactionsController.getMatches);
router.delete("/matches/:targetId", authJWTMiddleware, validateJoiMiddleware(targetIdSchema, 'params'), interactionsController.deleteMatch);

module.exports = router;