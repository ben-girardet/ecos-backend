"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identity = void 0;
const request_context_1 = __importDefault(require("request-context"));
function identity(next) {
    const user = request_context_1.default.get('request').user;
    if (!user) {
        throw new Error('Missing user in request');
    }
    const doc = this;
    if (!doc.createdBy) {
        doc.createdBy = user._id;
    }
    doc.updatedBy = user._id;
    next();
}
exports.identity = identity;
