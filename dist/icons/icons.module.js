"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconsModule = void 0;
const common_1 = require("@nestjs/common");
const icons_service_1 = require("./icons.service");
const icons_controller_1 = require("./icons.controller");
const typeorm_1 = require("@nestjs/typeorm");
const icon_entity_1 = require("./entities/icon.entity");
let IconsModule = class IconsModule {
};
exports.IconsModule = IconsModule;
exports.IconsModule = IconsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([icon_entity_1.Icon])],
        controllers: [icons_controller_1.IconsController],
        providers: [icons_service_1.IconsService],
    })
], IconsModule);
//# sourceMappingURL=icons.module.js.map