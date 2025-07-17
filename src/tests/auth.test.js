const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../models/user.model');

process.env.JWT_SECRET = 'testsecret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MONGO_URI = 'mongodb://localhost:27017/testdb_auth';

describe('Auth API Integration Tests', () => {
    beforeAll(async () => {
        const mongoUri = process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await mongoose.connection.dropDatabase();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    description: 'Test',
                    gender: 'M',
                    age: 30,
                    location: 'NYC'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Usuario registrado correctamente');

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user).not.toBeNull();
            expect(user.name).toBe('Test User');
            expect(user.password).not.toBe('password123');
        });

        it('should fail registering with existing email', async () => {
            await User.create({ name: 'Existente', email: 'exist@example.com', password: 'hashedpw' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Existente',
                    email: 'exist@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('El usuario ya existe');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const hashedPassword = await require('bcrypt').hash('password123', 10);
            await User.create({ name: 'LoginUser', email: 'login@example.com', password: hashedPassword });
        });

        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                email: 'login@example.com',
                password: 'password123',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('id');
        });

        it('should fail login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                email: 'login@example.com',
                password: 'wrongpassword',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Credenciales inválidas, revisa que email y password sean correctos');
        });
    });
});
