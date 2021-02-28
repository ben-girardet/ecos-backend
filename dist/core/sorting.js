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
exports.SortBy = exports.SortOrder = void 0;
const type_graphql_1 = require("type-graphql");
var SortOrder;
(function (SortOrder) {
    SortOrder[SortOrder["ASC"] = 1] = "ASC";
    SortOrder[SortOrder["DESC"] = -1] = "DESC";
})(SortOrder = exports.SortOrder || (exports.SortOrder = {}));
let SortBy = class SortBy {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], SortBy.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], SortBy.prototype, "order", void 0);
SortBy = __decorate([
    type_graphql_1.InputType()
], SortBy);
exports.SortBy = SortBy;
