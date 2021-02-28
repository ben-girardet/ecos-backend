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
exports.PushNotificationModel = exports.PushNotification = void 0;
const type_graphql_1 = require("type-graphql");
const typegoose_1 = require("@typegoose/typegoose");
let PushNotification = class PushNotification {
    constructor() {
        // @Field(() => [String], {nullable: false})
        this.regIds = [];
        // @Field(() => [String], {nullable: false})
        this.sentToRegIds = [];
        // @Field(() => [String], {nullable: false})
        this.viewedByRegIds = [];
        //@Field(() => [String], {nullable: false})
        this.openedByRegIds = [];
        this.contentAvailable = false;
        //@Field(() => [String], {nullable: false})
        this.sendToTags = [];
        this.sent = false;
    }
    get id() {
        return this._id ? this._id.toString() : '';
    }
    ;
};
__decorate([
    typegoose_1.prop({ type: () => [String] }),
    __metadata("design:type", Array)
], PushNotification.prototype, "regIds", void 0);
__decorate([
    typegoose_1.prop({ type: () => [String] }),
    __metadata("design:type", Array)
], PushNotification.prototype, "sentToRegIds", void 0);
__decorate([
    typegoose_1.prop({ type: () => [String] }),
    __metadata("design:type", Array)
], PushNotification.prototype, "viewedByRegIds", void 0);
__decorate([
    typegoose_1.prop({ type: () => [String] }),
    __metadata("design:type", Array)
], PushNotification.prototype, "openedByRegIds", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], PushNotification.prototype, "title", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], PushNotification.prototype, "message", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], PushNotification.prototype, "collapseKey", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Boolean)
], PushNotification.prototype, "contentAvailable", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Number)
], PushNotification.prototype, "badge", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], PushNotification.prototype, "custom", void 0);
__decorate([
    typegoose_1.prop({ type: () => [String] }),
    __metadata("design:type", Array)
], PushNotification.prototype, "sendToTags", void 0);
__decorate([
    typegoose_1.prop({ index: true }),
    __metadata("design:type", Boolean)
], PushNotification.prototype, "sent", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Date)
], PushNotification.prototype, "sentAt", void 0);
PushNotification = __decorate([
    type_graphql_1.ObjectType()
], PushNotification);
exports.PushNotification = PushNotification;
const PushNotificationModel = typegoose_1.getModelForClass(PushNotification, { schemaOptions: { timestamps: false } });
exports.PushNotificationModel = PushNotificationModel;
