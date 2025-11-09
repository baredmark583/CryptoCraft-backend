"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovaPoshtaModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nova_poshta_service_1 = require("./nova-poshta.service");
const nova_poshta_controller_1 = require("./nova-poshta.controller");
let NovaPoshtaModule = class NovaPoshtaModule {
};
exports.NovaPoshtaModule = NovaPoshtaModule;
exports.NovaPoshtaModule = NovaPoshtaModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [nova_poshta_controller_1.NovaPoshtaController],
        providers: [nova_poshta_service_1.NovaPoshtaService],
    })
], NovaPoshtaModule);
//# sourceMappingURL=nova-poshta.module.js.map