"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivestreamsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const livestreams_service_1 = require("./livestreams.service");
const livestreams_controller_1 = require("./livestreams.controller");
const livestream_entity_1 = require("./entities/livestream.entity");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
let LivestreamsModule = class LivestreamsModule {
};
exports.LivestreamsModule = LivestreamsModule;
exports.LivestreamsModule = LivestreamsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([livestream_entity_1.Livestream, user_entity_1.User, product_entity_1.Product]),
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [livestreams_controller_1.LivestreamsController],
        providers: [livestreams_service_1.LivestreamsService],
    })
], LivestreamsModule);
//# sourceMappingURL=livestreams.module.js.map