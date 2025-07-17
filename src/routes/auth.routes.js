const express = require('express');
const router = express.Router();

const authController = require("../controllers/auth.controller");

const rateLimitMiddleware = require("../middlewares/rateLimit.middleware");
const validateJoiMiddleware = require("../middlewares/validateJoi.middleware");

const { registerSchema, loginSchema } = require('../validations/auth.validation');

router.post("/auth/register", validateJoiMiddleware(registerSchema), rateLimitMiddleware.registerLimiter, authController.register);
router.post("/auth/login", validateJoiMiddleware(loginSchema), rateLimitMiddleware.loginLimiter, authController.login);

module.exports = router;