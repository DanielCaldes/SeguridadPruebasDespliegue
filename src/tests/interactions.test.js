jest.mock('../middlewares/authJWT.middleware', () => {
    return (req, res, next) => {
        if (!global.currentUserId) {
            console.error('No currentUserId set');
            return res.status(500).send('User not authenticated');
        }
        req.user = { id: global.currentUserId };
        next();
    };
});

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const interactionsRoutes = require('../routes/interactions.routes');
const User = require('../models/user.model');

let app;
let currentUser, otherUser;

process.env.MONGO_URI = 'mongodb://localhost:27017/testdb_interactions';

beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());

    // Asegúrate que las rutas son correctas respecto al prefijo
    app.use('/api', interactionsRoutes);
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
        password: 'hashed',
        swipes: [],
        likes: [],
        matches: [],
    });

    otherUser = await User.create({
        name: 'Bob',
        email: 'bob@test.com',
        password: 'hashed',
        swipes: [],
        likes: [],
        matches: [],
    });

    global.currentUserId = currentUser._id.toString();
});

describe('Interactions API Integration', () => {
    test('GET /search returns users not interacted with', async () => {
        const res = await request(app).get('/api/search');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].email).toBe(otherUser.email);
    });

    test('POST /swipe/:targetId with like but no match', async () => {
        const res = await request(app)
            .post(`/api/swipe/${otherUser._id}`)
            .send({ liked: true });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Like registrado');

        const updated = await User.findById(currentUser._id);
        expect(updated.likes).toContainEqual(otherUser._id);
    });

    test('POST /swipe/:targetId with match', async () => {
        otherUser.likes.push(currentUser._id);
        await otherUser.save();

        const res = await request(app)
            .post(`/api/swipe/${otherUser._id}`)
            .send({ liked: true });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('¡Tenéis un Match!');

        const updatedCurrent = await User.findById(currentUser._id);
        const updatedOther = await User.findById(otherUser._id);

        expect(updatedCurrent.matches).toContainEqual(otherUser._id);
        expect(updatedOther.matches).toContainEqual(currentUser._id);
    });

    test('GET /matches returns current matches', async () => {
        currentUser.matches.push(otherUser._id);
        otherUser.matches.push(currentUser._id);
        await currentUser.save();
        await otherUser.save();

        const res = await request(app).get('/api/matches');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].email).toBe(otherUser.email);
    });

    test('DELETE /matches/:targetId removes a match from both users', async () => {
        currentUser.matches.push(otherUser._id);
        otherUser.matches.push(currentUser._id);
        await currentUser.save();
        await otherUser.save();

        const res = await request(app).delete(`/api/matches/${otherUser._id}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Match eliminado');

        const updatedCurrent = await User.findById(currentUser._id);
        const updatedOther = await User.findById(otherUser._id);

        expect(updatedCurrent.matches).not.toContainEqual(otherUser._id);
        expect(updatedOther.matches).not.toContainEqual(currentUser._id);
    });
});
