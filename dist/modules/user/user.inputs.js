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
exports.EditUserInput = exports.EditMeInput = void 0;
const image_model_1 = require("../image/image.model");
const type_graphql_1 = require("type-graphql");
let EditMeInput = class EditMeInput {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], EditMeInput.prototype, "firstname", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], EditMeInput.prototype, "lastname", void 0);
__decorate([
    type_graphql_1.Field(type => [image_model_1.ImageInput], { nullable: true }),
    __metadata("design:type", Array)
], EditMeInput.prototype, "picture", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], EditMeInput.prototype, "regId", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], EditMeInput.prototype, "pushType", void 0);
__decorate([
    type_graphql_1.Field(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], EditMeInput.prototype, "pushTags", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Boolean)
], EditMeInput.prototype, "pushActive", void 0);
EditMeInput = __decorate([
    type_graphql_1.InputType()
], EditMeInput);
exports.EditMeInput = EditMeInput;
let EditUserInput = class EditUserInput {
};
__decorate([
    type_graphql_1.Field(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], EditUserInput.prototype, "roles", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], EditUserInput.prototype, "state", void 0);
EditUserInput = __decorate([
    type_graphql_1.InputType()
], EditUserInput);
exports.EditUserInput = EditUserInput;
