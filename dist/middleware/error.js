"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const jsonResp = {
        error: err.message
    };
    if (process.env.NODE_ENV === 'development') {
        jsonResp.stack = err.stack;
    }
    res.status(500);
    res.send(jsonResp);
};
exports.errorHandler = errorHandler;
