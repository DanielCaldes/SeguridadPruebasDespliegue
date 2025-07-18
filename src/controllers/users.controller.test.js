const usersController = require('./users.controller');
const User = require('../models/user.model');

jest.mock('../models/user.model');

describe('User Profile Controller', () => {
    let req, res, status, json;

    beforeEach(() => {
        json = jest.fn();
        status = jest.fn(() => ({ json }));
        req = { params: {}, body: {}, user: {} };
        res = { status };
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    describe('getProfile', () => {
        it('should return 404 if user not found', async () => {
            req.params.id = 'userId';
            User.findById.mockResolvedValue(null);

            await usersController.getProfile(req, res);

            expect(status).toHaveBeenCalledWith(404);
            expect(json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
        });

       it('should return user data if found', async () => {
            const userMock = { 
                _id: 'userId',
                name: 'John Doe',
                description: '',
                gender: '',
                age: null,
                location: ''
            };
            req.params.id = 'userId';
            User.findById.mockResolvedValue(userMock);

            await usersController.getProfile(req, res);

            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith(userMock);
        });


        it('should return 500 on error', async () => {
            req.params.id = 'userId';
            User.findById.mockRejectedValue(new Error('fail'));

            await usersController.getProfile(req, res);

            expect(status).toHaveBeenCalledWith(500);
            expect(json).toHaveBeenCalledWith({ message: 'Error del servidor' });
        });
    });

    describe('editProfile', () => {
        it('should return 403 if user tries to edit another profile', async () => {
            req.params.id = 'user1';
            req.user.id = 'user2';

            await usersController.editProfile(req, res);

            expect(status).toHaveBeenCalledWith(403);
            expect(json).toHaveBeenCalledWith({ message: "No tienes permiso para editar esta cuenta" });
        });

        it('should return 404 if user to edit not found', async () => {
            req.params.id = 'user1';
            req.user.id = 'user1';
            User.findById.mockResolvedValue(null);

            await usersController.editProfile(req, res);

            expect(status).toHaveBeenCalledWith(404);
            expect(json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
        });

        it('should update user and return updated user', async () => {
            req.params.id = 'user1';
            req.user.id = 'user1';
            req.body = {
                name: 'New Name',
                description: 'New desc',
                gender: 'M',
                age: 30,
                location: 'NYC',
            };

            const existingUser = {
                _id: 'user1',
                name: 'Old Name',
                description: 'Old desc',
                gender: 'F',
                age: 25,
                location: 'LA',
            };

            User.findById.mockResolvedValue(existingUser);

            const updatedUser = {
                ...existingUser,
                ...req.body,
            };

            User.findByIdAndUpdate.mockResolvedValue(updatedUser);

            await usersController.editProfile(req, res);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'user1',
                {
                    name: 'New Name',
                    description: 'New desc',
                    gender: 'M',
                    age: 30,
                    location: 'NYC',
                },
                { new: true }
            );

            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith({
                _id: updatedUser._id,
                name: updatedUser.name,
                description: updatedUser.description,
                gender: updatedUser.gender,
                age: updatedUser.age,
                location: updatedUser.location,
            });
        });


        it('should return 500 on error', async () => {
            req.params.id = 'user1';
            req.user.id = 'user1';
            User.findById.mockResolvedValue({});
            User.findByIdAndUpdate.mockRejectedValue(new Error('fail'));

            await usersController.editProfile(req, res);

            expect(status).toHaveBeenCalledWith(500);
            expect(json).toHaveBeenCalledWith({ message: 'Error del servidor' });
        });
    });

    describe('deleteProfile', () => {
        it('should return 403 if user tries to delete another profile', async () => {
            req.params.id = 'user1';
            req.user.id = 'user2';

            await usersController.deleteProfile(req, res);

            expect(status).toHaveBeenCalledWith(403);
            expect(json).toHaveBeenCalledWith({ message: "No tienes permiso para eliminar esta cuenta" });
        });

        it('should return 404 if user to delete not found', async () => {
            req.params.id = 'user1';
            req.user.id = 'user1';
            User.findByIdAndDelete.mockResolvedValue(null);

            await usersController.deleteProfile(req, res);

            expect(status).toHaveBeenCalledWith(404);
            expect(json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
        });

        it('should delete user and return success message', async () => {
            req.params.id = 'user1';
            req.user.id = 'user1';
            User.findByIdAndDelete.mockResolvedValue({ _id: 'user1' });

            await usersController.deleteProfile(req, res);

            expect(User.findByIdAndDelete).toHaveBeenCalledWith('user1');
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith({ message: 'Usuario borrado user1' });
        });

        it('should return 500 on error', async () => {
            req.params.id = 'user1';
            req.user.id = 'user1';
            User.findByIdAndDelete.mockRejectedValue(new Error('fail'));

            await usersController.deleteProfile(req, res);

            expect(status).toHaveBeenCalledWith(500);
            expect(json).toHaveBeenCalledWith({ message: 'Error del servidor' });
        });
    });
});
