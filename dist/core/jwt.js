"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshToken = exports.createToken = exports.decodeRefreshToken = exports.decodeToken = exports.retrieveToken = exports.isValidToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isValidToken = (token) => {
    try {
        // @ts-expect-error
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_OR_KEY);
        return true;
    }
    catch (error) {
        // error
        return false;
    }
};
exports.isValidToken = isValidToken;
const retrieveToken = (headers) => {
    if (headers && headers.authorization) {
        const tokens = headers.authorization.split(' ');
        if (tokens && tokens.length === 2) {
            return tokens[1];
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
};
exports.retrieveToken = retrieveToken;
// @ts-expect-error
const decodeToken = (token) => jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_OR_KEY);
exports.decodeToken = decodeToken;
const decodeRefreshToken = (token) => {
    try {
        // @ts-expect-error
        return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY);
    }
    catch (error) {
        return null;
    }
};
exports.decodeRefreshToken = decodeRefreshToken;
const createToken = (payload) => {
    try {
        // @ts-expect-error
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_OR_KEY, { expiresIn: process.env.JWT_TOKEN_EXPIRATION });
    }
    catch (error) {
        return null;
    }
};
exports.createToken = createToken;
const createRefreshToken = (payload) => {
    try {
        // @ts-expect-error
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY, { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION });
    }
    catch (error) {
        return null;
    }
};
exports.createRefreshToken = createRefreshToken;
