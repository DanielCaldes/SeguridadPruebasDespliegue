const authController = require('../controllers/auth.controller');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../models/user.model');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('authController.register', () => {
    let req, res, json, status;
    let consoleErrorSpy;

    beforeEach(() => {
        json = jest.fn();
        status = jest.fn(() => ({ json }));
        req = { body: {} };
        res = { status };
        jest.clearAllMocks();
    });

    beforeAll(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    it('retorna 400 si falta un campo', async () => {
        req.body = { email: 'test@test.com', password: '123456' };

        await authController.register(req, res);

        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Faltan campos') }));
    });

    it('retorna 400 si usuario ya existe', async () => {
        req.body = { name: 'Juan', email: 'test@test.com', password: '123456' };
        User.findOne.mockResolvedValue(true);

        await authController.register(req, res);

        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'El usuario ya existe' }));
    });

    it('registra correctamente usuario nuevo', async () => {
        req.body = { name: 'Juan', email: 'test@test.com', password: '123456' };
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashedPassword');
        const saveMock = jest.fn();
        User.mockImplementation(() => ({ save: saveMock }));
        
        await authController.register(req, res);
        
        expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
        expect(saveMock).toHaveBeenCalled();
        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({ message: "Usuario registrado correctamente" });
    });

    it('maneja error y retorna 500', async () => {
        req.body = { name: 'Juan', email: 'test@test.com', password: '123456' };
        User.findOne.mockRejectedValue(new Error('fail'));

        await authController.register(req, res);

        expect(status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error del servidor' }));
    });
});

describe('authController.login', () => {
    let req, res, json, status;
    let consoleErrorSpy;

    beforeAll(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
        json = jest.fn();
        status = jest.fn(() => ({ json }));
        req = { body: {} };
        res = { status };
        jest.clearAllMocks();
    });

    it('retorna 400 si falta email o password', async () => {
        req.body = { email: 'test@test.com' };

        await authController.login(req, res);

        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: "Faltan email o password" }));
    });

    it('retorna 400 si el usuario no existe', async () => {
        req.body = { email: 'test@test.com', password: '123456' };
        User.findOne.mockResolvedValue(null);

        await authController.login(req, res);

        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Credenciales inválidas, revisa que email y password sean correctos"
        }));
    });

    it('retorna 400 si la contraseña es incorrecta', async () => {
        req.body = { email: 'test@test.com', password: 'wrongpass' };
        User.findOne.mockResolvedValue({ password: 'hashedPassword', _id: '123' });
        bcrypt.compare.mockResolvedValue(false);

        await authController.login(req, res);

        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Credenciales inválidas, revisa que email y password sean correctos"
        }));
    });

    it('retorna 200 y token si login es correcto', async () => {
        req.body = { email: 'test@test.com', password: 'correctpass' };
        const user = { _id: '123', password: 'hashedPassword' };
        User.findOne.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('fake-jwt-token');

        await authController.login(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith('correctpass', 'hashedPassword');
        expect(jwt.sign).toHaveBeenCalledWith(
        { id: '123' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );
        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({ id: '123', token: 'fake-jwt-token' });
    });

    it('maneja error y retorna 500', async () => {
        req.body = { email: 'test@test.com', password: '123456' };
        User.findOne.mockRejectedValue(new Error('fail'));

        await authController.login(req, res);

        expect(status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error del servidor' }));
    });
});