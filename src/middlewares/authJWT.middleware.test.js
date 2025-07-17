const authJWT = require('./authJWT.middleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('authJWT middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
        headers: {}
        };
        res = {
        status: jest.fn(() => res),
        json: jest.fn()
        };
        next = jest.fn();
    });

    it('should return 401 if no Authorization header', () => {
        authJWT(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
        error: 'Token de acceso faltante o malformado'
        });
    });

    it('should return 403 if token is invalid', () => {
        req.headers.authorization = 'Bearer fake.token';
        jwt.verify.mockImplementation((token, secret, cb) => cb(new Error('Invalid'), null));

        authJWT(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido o expirado'
        });
    });

    it('should attach user to req and call next if token is valid', () => {
        const fakeUser = { id: '123' };
        req.headers.authorization = 'Bearer valid.token';
        jwt.verify.mockImplementation((token, secret, cb) => cb(null, fakeUser));

        authJWT(req, res, next);

        expect(req.user).toEqual(fakeUser);
        expect(next).toHaveBeenCalled();
    });
});
