const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .required(),

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required(),

    password: Joi.string()
        .min(6)
        .trim()
        .required(),
        
    description: Joi.string().allow('', null),
    gender: Joi.string().allow('', null),
    age: Joi.number().integer().min(0).allow(null),
    location: Joi.string().allow('', null),
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required(),

    password: Joi.string()
        .trim()
        .required(),
});

module.exports = { registerSchema, loginSchema, };