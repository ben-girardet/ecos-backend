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
exports.Login = void 0;
const type_graphql_1 = require("type-graphql");
let Login = class Login {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Login.prototype, "token", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], Login.prototype, "refreshToken", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], Login.prototype, "refreshTokenExpiry", void 0);
__decorate([
    type_graphql_1.Field(() => Date),
    __metadata("design:type", Date)
], Login.prototype, "expires", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Login.prototype, "userId", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Login.prototype, "privateKey", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    __metadata("design:type", Number)
], Login.prototype, "state", void 0);
Login = __decorate([
    type_graphql_1.ObjectType()
], Login);
exports.Login = Login;
