const validateJoi = require('./validateJoi.middleware');
const Joi = require('joi');

describe('validateJoi middleware', () => {
    const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().integer().min(0)
    });

    it('should return 400 if validation fails', () => {
        const req = { body: { age: -5 } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const middleware = validateJoi(schema);
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        errors: expect.any(Array)
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should strip unknown fields and call next if validation passes', () => {
        const req = {
        body: { name: 'Alice', age: 30, extra: 'remove me' }
        };
        const res = {};
        const next = jest.fn();

        const middleware = validateJoi(schema);
        middleware(req, res, next);

        expect(req.body).toEqual({ name: 'Alice', age: 30 });
        expect(next).toHaveBeenCalled();
    });

    it('should work with query instead of body', () => {
        const req = {
        query: { name: 'Bob', age: '25', irrelevant: 'x' }
        };
        const res = {};
        const next = jest.fn();

        const middleware = validateJoi(schema, 'query');
        middleware(req, res, next);

        expect(req.query).toEqual({ name: 'Bob', age: 25 });
        expect(next).toHaveBeenCalled();
    });
});
