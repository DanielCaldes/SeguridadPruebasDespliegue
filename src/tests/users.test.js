jest.mock('../middlewares/authJWT.middleware', () => {
    return (req, res, next) => {
        if (!global.currentUserId) {
            return res.status(500).send('User not authenticated');
        }
        req.user = { id: global.currentUserId };
        next();
    };
});

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const usersRouter = require('../routes/users.routes');
const User = require('../models/user.model');

let app;
let currentUser;

beforeAll(async () => {
    const mongoUri = 'mongodb://localhost:27017/testdb_users';
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api', usersRouter);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});

beforeEach(async () => {
    await mongoose.connection.dropDatabase();

    currentUser = await User.create({
        name: 'Alice',
        email: 'alice@test.com',
        password: 'hashedpassword',
        description: 'Test user',
        gender: 'F',
        age: 25,
        location: 'Madrid',
    });

    global.currentUserId = currentUser._id.toString();
});

afterEach(() => {
    delete global.currentUserId;
});

describe('Users API Integration', () => {
    test('GET /api/users/:id - should return user profile', async () => {
        const res = await request(app).get(`/api/users/${currentUser._id}`);

        expect(res.status).toBe(200);
        expect(res.body.name).toBe(currentUser.name);
        expect(res.body.email).toBe(currentUser.email);
    });

    test('PUT /api/users/:id - should update profile when authorized', async () => {
        const newName = 'Alice Updated';

        const res = await request(app)
            .put(`/api/users/${currentUser._id}`)
            .send({ name: newName });

        expect(res.status).toBe(200);
        expect(res.body.user.name).toBe(newName);

        const userInDb = await User.findById(currentUser._id);
        expect(userInDb.name).toBe(newName);
    });

    test('PUT /api/users/:id - should fail update if not owner', async () => {
        // Creamos otro usuario para intentar modificar currentUser
        const otherUser = await User.create({
            name: 'Bob',
            email: 'bob@test.com',
            password: 'hashedpassword',
        });

        global.currentUserId = otherUser._id.toString();

        const res = await request(app)
            .put(`/api/users/${currentUser._id}`)
            .send({ name: 'Hack attempt' });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('No tienes permiso para editar esta cuenta');
    });

    test('DELETE /api/users/:id - should delete profile when authorized', async () => {
        const res = await request(app).delete(`/api/users/${currentUser._id}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain(currentUser._id.toString());

        const userInDb = await User.findById(currentUser._id);
        expect(userInDb).toBeNull();
    });

    test('DELETE /api/users/:id - should fail delete if not owner', async () => {
        const otherUser = await User.create({
            name: 'Bob',
            email: 'bob@test.com',
            password: 'hashedpassword',
        });

        global.currentUserId = otherUser._id.toString();

        const res = await request(app).delete(`/api/users/${currentUser._id}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('No tienes permiso para eliminar esta cuenta');
    });
});
