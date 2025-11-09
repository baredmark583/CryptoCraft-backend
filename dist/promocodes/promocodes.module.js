"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoCodesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const promocodes_service_1 = require("./promocodes.service");
const promocodes_controller_1 = require("./promocodes.controller");
const promocode_entity_1 = require("./entities/promocode.entity");
const global_promocode_entity_1 = require("./entities/global-promocode.entity");
const global_promocodes_service_1 = require("./global-promocodes.service");
const global_promocodes_controller_1 = require("./global-promocodes.controller");
const user_entity_1 = require("../users/entities/user.entity");
const products_module_1 = require("../products/products.module");
let PromoCodesModule = class PromoCodesModule {
};
exports.PromoCodesModule = PromoCodesModule;
exports.PromoCodesModule = PromoCodesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([promocode_entity_1.PromoCode, global_promocode_entity_1.GlobalPromoCode, user_entity_1.User]),
            (0, common_1.forwardRef)(() => products_module_1.ProductsModule),
        ],
        controllers: [promocodes_controller_1.PromoCodesController, global_promocodes_controller_1.GlobalPromoCodesController],
        providers: [promocodes_service_1.PromoCodesService, global_promocodes_service_1.GlobalPromoCodesService],
        exports: [promocodes_service_1.PromoCodesService, global_promocodes_service_1.GlobalPromoCodesService],
    })
], PromoCodesModule);
//# sourceMappingURL=promocodes.module.js.map