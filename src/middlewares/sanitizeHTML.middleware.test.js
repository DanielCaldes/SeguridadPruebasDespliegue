const sanitizeInputs = require('./sanitizeHTML.middleware');

describe('sanitizeInputs middleware', () => {
    it('should sanitize HTML in req.body', () => {
        const req = {
        body: {
            name: '<script>alert("x")</script>',
            bio: '<b>bold</b>'
        },
        query: {},
        params: {}
        };
        const res = {};
        const next = jest.fn();

        sanitizeInputs(req, res, next);

        expect(req.body.name).toBe('');
        expect(req.body.bio).toBe('bold');
        expect(next).toHaveBeenCalled();
    });

    it('should sanitize nested objects', () => {
        const req = {
        body: {
            user: {
            name: '<i>test</i>',
            about: {
                description: '<div>hi</div>'
            }
            }
        },
        query: {},
        params: {}
        };
        const res = {};
        const next = jest.fn();

        sanitizeInputs(req, res, next);

        expect(req.body.user.name).toBe('test');
        expect(req.body.user.about.description).toBe('hi');
        expect(next).toHaveBeenCalled();
    });

    it('should sanitize req.query and req.params', () => {
        const req = {
        body: {},
        query: {
            search: '<img src="x" onerror="alert(1)">'
        },
        params: {
            id: '<span>123</span>'
        }
        };
        const res = {};
        const next = jest.fn();

        sanitizeInputs(req, res, next);

        expect(req.query.search).toBe('');
        expect(req.params.id).toBe('123');
        expect(next).toHaveBeenCalled();
    });

    it('should handle non-string values without crashing', () => {
        const req = {
        body: {
            count: 5,
            isActive: true,
            data: null,
            nested: {
            value: undefined
            }
        },
        query: {},
        params: {}
        };
        const res = {};
        const next = jest.fn();

        sanitizeInputs(req, res, next);

        expect(req.body.count).toBe(5);
        expect(req.body.isActive).toBe(true);
        expect(req.body.data).toBe(null);
        expect(req.body.nested.value).toBe(undefined);
        expect(next).toHaveBeenCalled();
    });

    it('should skip sanitizing if body, query, and params are missing', () => {
        const req = {};
        const res = {};
        const next = jest.fn();

        expect(() => sanitizeInputs(req, res, next)).not.toThrow();
        expect(next).toHaveBeenCalled();
    });
});
