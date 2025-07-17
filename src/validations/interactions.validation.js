const Joi = require('joi');

const targetIdSchema = Joi.object({
  targetId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
});

const swipeSchema = Joi.object({
  liked: Joi.boolean().required()
});

module.exports = {targetIdSchema, swipeSchema};