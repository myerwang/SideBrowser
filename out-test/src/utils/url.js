"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHttpUrl = validateHttpUrl;
function validateHttpUrl(value) {
    try {
        const parsed = new URL(value);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return {
                ok: false,
                message: `uses unsupported protocol "${parsed.protocol}". Only http:// and https:// are supported.`
            };
        }
        return {
            ok: true,
            url: parsed.toString()
        };
    }
    catch {
        return {
            ok: false,
            message: 'does not contain a valid URL.'
        };
    }
}
//# sourceMappingURL=url.js.map