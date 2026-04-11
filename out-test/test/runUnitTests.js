"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const embedding_test_1 = require("./unit/embedding.test");
const linkFile_test_1 = require("./unit/linkFile.test");
const url_test_1 = require("./unit/url.test");
function runSuite(name, runner) {
    try {
        runner();
        console.log(`[pass] ${name}`);
    }
    catch (error) {
        console.error(`[fail] ${name}`);
        throw error;
    }
}
runSuite('embedding detection', embedding_test_1.runEmbeddingTests);
runSuite('link file parsing', linkFile_test_1.runLinkFileTests);
runSuite('URL validation', url_test_1.runUrlTests);
console.log('All unit tests passed.');
//# sourceMappingURL=runUnitTests.js.map