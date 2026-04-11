"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEmbeddingTests = runEmbeddingTests;
const strict_1 = __importDefault(require("node:assert/strict"));
const embedding_1 = require("../../src/utils/embedding");
function runEmbeddingTests() {
    const deniedHeaders = new Headers({
        'x-frame-options': 'deny'
    });
    const deniedResult = (0, embedding_1.inspectEmbeddingHeaders)(deniedHeaders);
    strict_1.default.ok(deniedResult);
    strict_1.default.equal(deniedResult?.canEmbed, false);
    strict_1.default.equal(deniedResult?.blockedBy, 'x-frame-options');
    strict_1.default.match(deniedResult?.reason ?? '', /X-Frame-Options: deny/i);
    const cspHeaders = new Headers({
        'content-security-policy': "default-src 'self'; frame-ancestors 'self' https://example.com"
    });
    const cspResult = (0, embedding_1.inspectEmbeddingHeaders)(cspHeaders);
    strict_1.default.ok(cspResult);
    strict_1.default.equal(cspResult?.canEmbed, false);
    strict_1.default.equal(cspResult?.blockedBy, 'csp-frame-ancestors');
    strict_1.default.match(cspResult?.reason ?? '', /frame-ancestors 'self' https:\/\/example\.com/i);
    const allowedHeaders = new Headers({
        'content-security-policy': "default-src 'self'; frame-ancestors *"
    });
    strict_1.default.equal((0, embedding_1.inspectEmbeddingHeaders)(allowedHeaders), undefined);
}
//# sourceMappingURL=embedding.test.js.map