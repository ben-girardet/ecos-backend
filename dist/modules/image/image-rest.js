"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageController = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const framework_1 = require("../../core/framework");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const nanoid_1 = require("nanoid");
const nanoid = nanoid_1.customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 24);
const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        let ext = '';
        if (file.mimetype === 'image/png') {
            ext = '.png';
        }
        else if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            ext = '.jpg';
        }
        else if (file.mimetype === 'image/gif') {
            ext = '.gif';
        }
        cb(null, nanoid() + ext); // appending extension
    }
});
const upload = multer_1.default({ storage });
let ImageController = class ImageController {
    async addImage(req, res, next) {
        upload.single('file')(req, res, (err) => {
            if (err) {
                return next(err);
            }
            if (!req.file) {
                return next(new Error('Error while saving the image file'));
            }
            return res.status(http_status_codes_1.StatusCodes.CREATED).send({ id: req.file.filename });
        });
    }
    async getImage(req, res, next) {
        const { id } = req.params;
        res.status(http_status_codes_1.StatusCodes.OK);
        const filepath = path_1.default.join(__dirname, `../../../${uploadPath}${id}`);
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.setHeader("Expires", new Date(Date.now() + 31536000000).toUTCString());
        res.download(filepath);
    }
};
__decorate([
    framework_1.Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], ImageController.prototype, "addImage", null);
__decorate([
    framework_1.Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], ImageController.prototype, "getImage", null);
ImageController = __decorate([
    framework_1.Controller('/image')
], ImageController);
exports.ImageController = ImageController;
