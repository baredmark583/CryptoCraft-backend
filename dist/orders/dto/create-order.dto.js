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
exports.CreateOrderDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CartItemDto {
}
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CartItemDto.prototype, "product", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CartItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CartItemDto.prototype, "priceAtTimeOfAddition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CartItemDto.prototype, "variant", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['RETAIL', 'WHOLESALE']),
    __metadata("design:type", String)
], CartItemDto.prototype, "purchaseType", void 0);
class FullShippingAddressDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FullShippingAddressDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FullShippingAddressDto.prototype, "postOffice", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FullShippingAddressDto.prototype, "recipientName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FullShippingAddressDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FullShippingAddressDto.prototype, "cityRef", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FullShippingAddressDto.prototype, "warehouseRef", void 0);
class MeetingDetailsDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MeetingDetailsDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MeetingDetailsDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MeetingDetailsDto.prototype, "notes", void 0);
class CreateOrderDto {
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CartItemDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "cartItems", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['ESCROW', 'DIRECT']),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.checkoutMode !== 'DEPOSIT'),
    (0, class_validator_1.IsEnum)(['NOVA_POSHTA', 'UKRPOSHTA', 'MEETUP']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "shippingMethod", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.checkoutMode !== 'DEPOSIT'),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FullShippingAddressDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", FullShippingAddressDto)
], CreateOrderDto.prototype, "shippingAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "transactionHash", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['CART', 'DEPOSIT']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "checkoutMode", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.checkoutMode === 'DEPOSIT'),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "escrowDepositAmount", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.checkoutMode === 'DEPOSIT'),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MeetingDetailsDto),
    __metadata("design:type", MeetingDetailsDto)
], CreateOrderDto.prototype, "meetingDetails", void 0);
//# sourceMappingURL=create-order.dto.js.map