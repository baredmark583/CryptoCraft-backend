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
exports.Collection = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const product_entity_1 = require("../../products/entities/product.entity");
let Collection = class Collection extends base_entity_1.BaseEntity {
};
exports.Collection = Collection;
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.collections, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], Collection.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Collection.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product, { cascade: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Collection.prototype, "products", void 0);
exports.Collection = Collection = __decorate([
    (0, typeorm_1.Entity)('collections')
], Collection);
//# sourceMappingURL=collection.entity.js.map