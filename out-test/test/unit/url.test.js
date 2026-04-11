"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runUrlTests = runUrlTests;
const strict_1 = __importDefault(require("node:assert/strict"));
const url_1 = require("../../src/utils/url");
function runUrlTests() {
    strict_1.default.equal((0, url_1.validateHttpUrl)('http://localhost:3000').ok, true);
    strict_1.default.equal((0, url_1.validateHttpUrl)('https://example.com').ok, true);
    const result = (0, url_1.validateHttpUrl)('ftp://example.com');
    strict_1.default.equal(result.ok, false);
    if (!result.ok) {
        strict_1.default.match(result.message, /unsupported protocol/i);
    }
    const malformedResult = (0, url_1.validateHttpUrl)('not a url');
    strict_1.default.equal(malformedResult.ok, false);
    if (!malformedResult.ok) {
        strict_1.default.match(malformedResult.message, /valid URL/i);
    }
}
//# sourceMappingURL=url.test.js.map