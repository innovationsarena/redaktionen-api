"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.handleControllerError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const handleControllerError = (error, reply) => {
    if (error instanceof AppError) {
        reply.log.error(error.message);
        reply.status(error.statusCode).send({ error: error.message });
        return;
    }
    if (error instanceof Error) {
        reply.log.error(error.message);
        reply.status(500).send({ error: error.message });
        return;
    }
    reply.log.error("Unknown error occurred");
    reply.status(500).send({ error: "Internal server error" });
};
exports.handleControllerError = handleControllerError;
const asyncHandler = (fn) => {
    return async (request, reply) => {
        try {
            return await fn(request, reply);
        }
        catch (error) {
            (0, exports.handleControllerError)(error, reply);
        }
    };
};
exports.asyncHandler = asyncHandler;
