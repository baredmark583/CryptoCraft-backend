"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRACE_HEADER = void 0;
exports.traceIdMiddleware = traceIdMiddleware;
const crypto_1 = require("crypto");
exports.TRACE_HEADER = 'x-trace-id';
function traceIdMiddleware(req, res, next) {
    const incomingTraceId = req.headers[exports.TRACE_HEADER] || req.header(exports.TRACE_HEADER);
    const traceId = incomingTraceId || (0, crypto_1.randomUUID)();
    req.id = traceId;
    res.setHeader(exports.TRACE_HEADER, traceId);
    next();
}
//# sourceMappingURL=trace-id.middleware.js.map