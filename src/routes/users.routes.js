const express = require('express');
const router = express.Router();

const usersController = require("../controllers/users.controller");

const authJWTMiddleware = require("../middlewares/authJWT.middleware");

router.get("/users/:id", authJWTMiddleware, usersController.getProfile);
router.put("/users/:id", authJWTMiddleware, usersController.editProfile);
router.delete("/users/:id", authJWTMiddleware, usersController.deleteProfile);

module.exports = router;