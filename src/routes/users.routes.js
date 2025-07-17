const express = require('express');
const router = express.Router();

const usersController = require("../controllers/users.controller");

const authJWTMiddleware = require("../middlewares/authJWT.middleware");
const validateJoiMiddleware = require("../middlewares/validateJoi.middleware")

const {userIdSchema, editUserSchema} = require('../validations/users.validation');

router.get("/users/:id", authJWTMiddleware, validateJoiMiddleware(userIdSchema, 'params'), usersController.getProfile);
router.put("/users/:id", authJWTMiddleware, validateJoiMiddleware(userIdSchema, 'params'), validateJoiMiddleware(editUserSchema), usersController.editProfile);
router.delete("/users/:id", authJWTMiddleware, validateJoiMiddleware(userIdSchema, 'params'), usersController.deleteProfile);

module.exports = router;