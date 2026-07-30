"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    error: 'Invalid input',
                    details: (error.issues || []).map((e) => ({ path: e.path.join('.'), message: e.message }))
                });
            }
            return res.status(500).json({ error: 'Internal Server Error during validation' });
        }
    };
};
exports.validateRequest = validateRequest;
