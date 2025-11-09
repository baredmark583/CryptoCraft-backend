"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIconDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_icon_dto_1 = require("./create-icon.dto");
class UpdateIconDto extends (0, mapped_types_1.PartialType)(create_icon_dto_1.CreateIconDto) {
}
exports.UpdateIconDto = UpdateIconDto;
//# sourceMappingURL=update-icon.dto.js.map