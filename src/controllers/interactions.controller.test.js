const interactionsController = require('./interactions.controller');
const User = require('../models/user.model');

jest.mock('../models/user.model');

describe('userController', () => {
    let req, res, json, status;

    beforeEach(() => {
        json = jest.fn();
        status = jest.fn(() => ({ json }));
        req = { user: { id: 'currentUserId' }, params: {}, body: {} };
        res = { status };
        jest.clearAllMocks();
    });

    describe('searchUser', () => {
        it('debe devolver usuarios que no están en swipes, likes, matches ni el propio usuario', async () => {
            User.findById.mockResolvedValue({
                swipes: ['swipe1'],
                likes: ['like1'],
                matches: ['match1'],
                _id: 'currentUserId'
            });
            User.find.mockResolvedValue([
                { _id: 'candidate1', name: "", description: "", gender: "", age: null, location: "" },
                { _id: 'candidate2', name: "", description: "", gender: "", age: null, location: "" }
            ]);

            await interactionsController.searchUser(req, res);

            expect(User.findById).toHaveBeenCalledWith('currentUserId');
            expect(User.find).toHaveBeenCalledWith({ _id: { $nin: ['swipe1', 'like1', 'match1', 'currentUserId'] } });
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith([
                { _id: 'candidate1', name: "", description: "", gender: "", age: null, location: "" },
                { _id: 'candidate2', name: "", description: "", gender: "", age: null, location: "" }
            ]);
        });
    });

    describe('swipeUser', () => {
        beforeEach(() => {
            req.user.id = 'user1';
            req.params.targetId = 'user2';
        });

        it('debe devolver error si intentas hacer swipe sobre ti mismo', async () => {
            req.params.targetId = 'user1';

            await interactionsController.swipeUser(req, res);

            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: "No puedes hacer swipe sobre ti mismo" });
            });

            it('debe devolver error si usuario objetivo no existe', async () => {
            User.findById.mockImplementation(id => id === 'user1' ? Promise.resolve({ likes: [], swipes: [], matches: [], save: jest.fn() }) : Promise.resolve(null));

            await interactionsController.swipeUser(req, res);

            expect(status).toHaveBeenCalledWith(404);
            expect(json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
        });

        it('registra match correctamente si el usuario objetivo ya te había dado like', async () => {
            const currentUser = { likes: [], swipes: [], matches: [], save: jest.fn() };
            const targetUser = { likes: ['user1'], matches: [], save: jest.fn() };

            User.findById.mockImplementation(id => id === 'user1' ? Promise.resolve(currentUser) : Promise.resolve(targetUser));
            req.body.liked = true;

            await interactionsController.swipeUser(req, res);

            expect(currentUser.matches).toContain('user2');
            expect(targetUser.matches).toContain('user1');
            expect(targetUser.likes).not.toContain('user1');
            expect(currentUser.save).toHaveBeenCalled();
            expect(targetUser.save).toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith({ message: "¡Felicidades! ¡Tenéis un Match!" });
        });

        it('registra like si liked es true y no hay match previo', async () => {
            const currentUser = { likes: [], swipes: [], matches: [], save: jest.fn() };
            const targetUser = { likes: [], matches: [], save: jest.fn() };

            User.findById.mockImplementation(id => id === 'user1' ? Promise.resolve(currentUser) : Promise.resolve(targetUser));
            req.body.liked = true;

            await interactionsController.swipeUser(req, res);

            expect(currentUser.likes).toContain('user2');
            expect(currentUser.save).toHaveBeenCalled();
            expect(targetUser.save).toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith({ message: "Like registrado" });
        });

        it('registra swipe si liked es false', async () => {
            const currentUser = { likes: [], swipes: [], matches: [], save: jest.fn() };
            const targetUser = { likes: [], matches: [], save: jest.fn() };

            User.findById.mockImplementation(id => id === 'user1' ? Promise.resolve(currentUser) : Promise.resolve(targetUser));
            req.body.liked = false;

            await interactionsController.swipeUser(req, res);

            expect(currentUser.swipes).toContain('user2');
            expect(currentUser.save).toHaveBeenCalled();
            expect(targetUser.save).toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith({ message: "Swipe registrado" });
        });
    });

    describe('getMatches', () => {
        it('debe devolver la lista de matches del usuario actual', async () => {
            const matches = [
            { _id: 'match1', name: "", description: "", gender: "", age: null, location: "" },
            { _id: 'match2', name: "", description: "", gender: "", age: null, location: "" }
            ];
            User.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ matches })
            });

            await interactionsController.getMatches(req, res);

            expect(User.findById).toHaveBeenCalledWith('currentUserId');
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith(matches);
        });
    });

    describe('deleteMatch', () => {
        it('debe devolver error si alguno de los usuarios no existe', async () => {
            User.findById.mockResolvedValueOnce(null);

            await interactionsController.deleteMatch(req, res);

            expect(status).toHaveBeenCalledWith(404);
            expect(json).toHaveBeenCalledWith({ message: "Usuario no encontrado." });
        });

        it('debe eliminar el match correctamente', async () => {
            req.params.targetId = 'targetUserId';

            const currentUser = {
                matches: ['targetUserId', 'otherId'],
                save: jest.fn()
            };
            const targetUser = {
                matches: ['currentUserId', 'anotherId'],
                save: jest.fn()
            };

            User.findById.mockImplementation(id => {
                if (id === 'currentUserId') return Promise.resolve(currentUser);
                if (id === 'targetUserId') return Promise.resolve(targetUser);
                return Promise.resolve(null);
            });

            req.user.id = 'currentUserId';

            await interactionsController.deleteMatch(req, res);

            expect(currentUser.matches).not.toContain('targetUserId');
            expect(targetUser.matches).not.toContain('currentUserId');
            expect(currentUser.save).toHaveBeenCalled();
            expect(targetUser.save).toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith({ message: "Match eliminado" });
        });
    });

});
