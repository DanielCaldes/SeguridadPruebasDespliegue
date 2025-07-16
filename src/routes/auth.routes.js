const express = require('express');
const router = express.Router();

const authController = require("../controllers/auth.controller");

const rateLimitMiddleware = require("../middlewares/rateLimit.middleware")

router.post("/auth/register", rateLimitMiddleware.registerLimiter, authController.register);
router.post("/auth/login", rateLimitMiddleware.loginLimiter, authController.login);

module.exports = router;