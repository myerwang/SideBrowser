"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runLinkFileTests = runLinkFileTests;
const strict_1 = __importDefault(require("node:assert/strict"));
const linkFile_1 = require("../../src/utils/linkFile");
function runLinkFileTests() {
    const result = (0, linkFile_1.parseLinkFileContent)('\uFEFF  \n  http://localhost:3000  \n\n', 'sample.link');
    strict_1.default.equal(result.url, 'http://localhost:3000/');
    strict_1.default.equal(result.raw, 'http://localhost:3000');
    const firstLineResult = (0, linkFile_1.parseLinkFileContent)('\nhttps://example.com\nhttps://ignored.example.com\n', 'sample.link');
    strict_1.default.equal(firstLineResult.url, 'https://example.com/');
    strict_1.default.throws(() => (0, linkFile_1.parseLinkFileContent)(' \n\t\n', 'empty.link'), /empty/);
    strict_1.default.equal((0, linkFile_1.isLinkFilePath)('preview.link'), true);
    strict_1.default.equal((0, linkFile_1.isLinkFilePath)('preview.txt'), false);
    strict_1.default.equal((0, linkFile_1.isSupportedWebFilePath)('preview.html'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedWebFilePath)('preview.HTM'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedWebFilePath)('preview.md'), false);
    strict_1.default.equal((0, linkFile_1.isSupportedMarkdownFilePath)('README.md'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedMarkdownFilePath)('guide.markdown'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedMarkdownFilePath)('guide.txt'), false);
    strict_1.default.equal((0, linkFile_1.isSupportedPdfFilePath)('book.pdf'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedPdfFilePath)('book.PDF'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedPdfFilePath)('book.png'), false);
    strict_1.default.equal((0, linkFile_1.isSupportedImageFilePath)('cover.png'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedImageFilePath)('cover.SVG'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedImageFilePath)('cover.mp4'), false);
    strict_1.default.equal((0, linkFile_1.isSupportedMediaFilePath)('clip.mp4'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedMediaFilePath)('clip.MP3'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedMediaFilePath)('clip.png'), false);
    strict_1.default.equal((0, linkFile_1.isSupportedNotebookFilePath)('analysis.ipynb'), true);
    strict_1.default.equal((0, linkFile_1.isSupportedNotebookFilePath)('analysis.md'), false);
    strict_1.default.equal((0, linkFile_1.pickDefaultLinkFileName)(['README.md', 'preview.link', 'app.js']), 'preview.link');
    strict_1.default.equal((0, linkFile_1.pickDefaultLinkFileName)(['README.md', 'demo.link']), 'demo.link');
    strict_1.default.equal((0, linkFile_1.pickDefaultLinkFileName)(['first.link', 'second.link', 'README.md']), undefined);
    strict_1.default.equal((0, linkFile_1.pickDefaultPreviewFileName)(['README.md', 'Index.html', 'app.js']), 'Index.html');
    strict_1.default.equal((0, linkFile_1.pickDefaultPreviewFileName)(['README.md', 'app.js']), undefined);
}
//# sourceMappingURL=linkFile.test.js.map