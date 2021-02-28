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
exports.PushPlayerModel = exports.PushPlayer = void 0;
const type_graphql_1 = require("type-graphql");
const typegoose_1 = require("@typegoose/typegoose");
let PushPlayer = class PushPlayer {
    get id() {
        return this._id ? this._id.toString() : '';
    }
    ;
    get userId() {
        return this.user ? this.user.toString() : '';
    }
};
__decorate([
    typegoose_1.prop({ ref: () => 'User', index: true }),
    __metadata("design:type", Object)
], PushPlayer.prototype, "user", void 0);
__decorate([
    typegoose_1.prop({ type: String }),
    __metadata("design:type", String)
], PushPlayer.prototype, "regId", void 0);
__decorate([
    typegoose_1.prop({ type: String }),
    __metadata("design:type", String)
], PushPlayer.prototype, "uuid", void 0);
__decorate([
    typegoose_1.prop({ type: String }),
    __metadata("design:type", String)
], PushPlayer.prototype, "type", void 0);
__decorate([
    type_graphql_1.Authorized(['me']),
    type_graphql_1.Field(() => [String], { nullable: false }),
    typegoose_1.prop({ type: () => [String] }),
    __metadata("design:type", Array)
], PushPlayer.prototype, "tags", void 0);
__decorate([
    type_graphql_1.Authorized(['me']),
    type_graphql_1.Field(() => Boolean),
    typegoose_1.prop({ index: true }),
    __metadata("design:type", Boolean)
], PushPlayer.prototype, "active", void 0);
PushPlayer = __decorate([
    type_graphql_1.ObjectType()
], PushPlayer);
exports.PushPlayer = PushPlayer;
const PushPlayerModel = typegoose_1.getModelForClass(PushPlayer, { schemaOptions: { timestamps: false } });
exports.PushPlayerModel = PushPlayerModel;
