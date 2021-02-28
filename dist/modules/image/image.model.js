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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageInput = exports.Image = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
// TODO: import the type from ecos-types
let Image = class Image {
};
__decorate([
    type_graphql_1.Field(() => String),
    typegoose_1.prop({ index: true }),
    __metadata("design:type", String)
], Image.prototype, "fileId", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    typegoose_1.prop(),
    __metadata("design:type", Number)
], Image.prototype, "width", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    typegoose_1.prop(),
    __metadata("design:type", Number)
], Image.prototype, "height", void 0);
Image = __decorate([
    type_graphql_1.ObjectType()
], Image);
exports.Image = Image;
let ImageInput = class ImageInput {
};
__decorate([
    type_graphql_1.Field(() => String),
    typegoose_1.prop(),
    __metadata("design:type", String)
], ImageInput.prototype, "fileId", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    typegoose_1.prop(),
    __metadata("design:type", Number)
], ImageInput.prototype, "width", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    typegoose_1.prop(),
    __metadata("design:type", Number)
], ImageInput.prototype, "height", void 0);
ImageInput = __decorate([
    type_graphql_1.InputType()
], ImageInput);
exports.ImageInput = ImageInput;
