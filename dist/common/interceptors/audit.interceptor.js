"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let AuditInterceptor = class AuditInterceptor {
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const { method, originalUrl, ip, headers, user, body } = req;
        const start = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            console.log('[AUDIT]', {
                ts: new Date().toISOString(),
                method,
                url: originalUrl,
                ms: Date.now() - start,
                userId: user?.userId,
                role: user?.role,
                ip,
                ua: headers['user-agent'],
                body,
            });
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)()
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map