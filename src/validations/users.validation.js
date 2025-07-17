const Joi = require('joi');

const userIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
});

const editUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(500).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  age: Joi.number().integer().min(0).max(120).optional(),
  location: Joi.string().max(100).optional()
}).min(1);

module.exports = {userIdSchema, editUserSchema};