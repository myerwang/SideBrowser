"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLinkFileUrl = readLinkFileUrl;
exports.resolvePreviewSource = resolvePreviewSource;
exports.parseLinkFileContent = parseLinkFileContent;
exports.isLinkFileUri = isLinkFileUri;
exports.isLinkFilePath = isLinkFilePath;
exports.isSupportedWebFileUri = isSupportedWebFileUri;
exports.isSupportedWebFilePath = isSupportedWebFilePath;
exports.isSupportedMarkdownFileUri = isSupportedMarkdownFileUri;
exports.isSupportedMarkdownFilePath = isSupportedMarkdownFilePath;
exports.isSupportedPdfFileUri = isSupportedPdfFileUri;
exports.isSupportedPdfFilePath = isSupportedPdfFilePath;
exports.isSupportedImageFileUri = isSupportedImageFileUri;
exports.isSupportedImageFilePath = isSupportedImageFilePath;
exports.isSupportedMediaFileUri = isSupportedMediaFileUri;
exports.isSupportedMediaFilePath = isSupportedMediaFilePath;
exports.isSupportedNotebookFileUri = isSupportedNotebookFileUri;
exports.isSupportedNotebookFilePath = isSupportedNotebookFilePath;
exports.isSupportedPreviewFileUri = isSupportedPreviewFileUri;
exports.pickDefaultPreviewFileName = pickDefaultPreviewFileName;
exports.pickDefaultLinkFileName = pickDefaultLinkFileName;
const path = __importStar(require("path"));
const url_1 = require("./url");
const SUPPORTED_WEB_FILE_EXTENSIONS = new Set(['.html', '.htm', '.xhtml', '.shtml']);
const SUPPORTED_MARKDOWN_FILE_EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.mkd']);
const SUPPORTED_PDF_FILE_EXTENSIONS = new Set(['.pdf']);
const SUPPORTED_IMAGE_FILE_EXTENSIONS = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.ico',
    '.avif',
    '.tif',
    '.tiff'
]);
const SUPPORTED_MEDIA_FILE_EXTENSIONS = new Set([
    '.mp3',
    '.wav',
    '.ogg',
    '.flac',
    '.m4a',
    '.aac',
    '.mp4',
    '.webm',
    '.ogv',
    '.mov'
]);
const SUPPORTED_NOTEBOOK_FILE_EXTENSIONS = new Set(['.ipynb']);
const DEFAULT_FOLDER_LINK_FILES = [
    'preview.link',
    'index.link',
    'default.link',
    'home.link'
];
const DEFAULT_FOLDER_ENTRY_FILES = [
    'index.html',
    'index.htm',
    'default.html',
    'default.htm',
    'home.html',
    'home.htm'
];
async function readLinkFileUrl(fileUri) {
    const rawContent = await readLinkFileContent(fileUri);
    return parseLinkFileContent(rawContent, getLabel(fileUri)).url;
}
async function resolvePreviewSource(targetUri) {
    if (targetUri.scheme === 'http' || targetUri.scheme === 'https') {
        return {
            kind: 'browser',
            label: targetUri.toString(true),
            sourceUri: targetUri,
            url: targetUri.toString(true)
        };
    }
    if (isLinkFileUri(targetUri)) {
        return {
            kind: 'browser',
            label: getLabel(targetUri),
            sourceUri: targetUri,
            url: await readLinkFileUrl(targetUri)
        };
    }
    const vscode = await Promise.resolve().then(() => __importStar(require('vscode')));
    const stat = await vscode.workspace.fs.stat(targetUri);
    if ((stat.type & vscode.FileType.Directory) !== 0) {
        return resolveFolderPreviewSource(targetUri);
    }
    if (isSupportedMarkdownFileUri(targetUri)) {
        return {
            kind: 'markdown',
            label: getLabel(targetUri),
            sourceUri: targetUri,
            url: targetUri.toString(true)
        };
    }
    if (isSupportedPdfFileUri(targetUri)) {
        return {
            kind: 'pdf',
            label: getLabel(targetUri),
            sourceUri: targetUri,
            url: targetUri.toString(true)
        };
    }
    if (isSupportedImageFileUri(targetUri)) {
        return {
            kind: 'image',
            label: getLabel(targetUri),
            sourceUri: targetUri,
            url: targetUri.toString(true)
        };
    }
    if (isSupportedMediaFileUri(targetUri)) {
        return {
            kind: 'media',
            label: getLabel(targetUri),
            sourceUri: targetUri,
            url: targetUri.toString(true)
        };
    }
    if (isSupportedNotebookFileUri(targetUri)) {
        return {
            kind: 'notebook',
            label: getLabel(targetUri),
            sourceUri: targetUri,
            url: targetUri.toString(true)
        };
    }
    if (isSupportedWebFileUri(targetUri)) {
        return {
            kind: 'browser',
            label: getLabel(targetUri),
            sourceUri: targetUri,
            url: targetUri.toString(true)
        };
    }
    throw new Error(`SideBrowser can open .link files, Markdown files (${[...SUPPORTED_MARKDOWN_FILE_EXTENSIONS].join(', ')}), PDF files (${[...SUPPORTED_PDF_FILE_EXTENSIONS].join(', ')}), image files (${[...SUPPORTED_IMAGE_FILE_EXTENSIONS].join(', ')}), media files (${[...SUPPORTED_MEDIA_FILE_EXTENSIONS].join(', ')}), notebook files (${[...SUPPORTED_NOTEBOOK_FILE_EXTENSIONS].join(', ')}), common web files (${[...SUPPORTED_WEB_FILE_EXTENSIONS].join(', ')}), or folders containing a .link file or default HTML entry.`);
}
function parseLinkFileContent(content, label = 'file') {
    const sanitizedContent = content.replace(/^\uFEFF/, '');
    const nonEmptyLines = sanitizedContent
        .split(/\r?\n/g)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    if (nonEmptyLines.length === 0) {
        throw new Error(`SideBrowser: ${label} is empty. Add a http:// or https:// URL.`);
    }
    const candidate = nonEmptyLines[0];
    const validation = (0, url_1.validateHttpUrl)(candidate);
    if (!validation.ok) {
        throw new Error(`SideBrowser: ${label} ${validation.message}`);
    }
    return {
        raw: candidate,
        url: validation.url
    };
}
function isLinkFileUri(uri) {
    return isLinkFilePath(uri.path);
}
function isLinkFilePath(filePath) {
    return path.extname(filePath).toLowerCase() === '.link';
}
function isSupportedWebFileUri(uri) {
    return isSupportedWebFilePath(uri.path);
}
function isSupportedWebFilePath(filePath) {
    return SUPPORTED_WEB_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
function isSupportedMarkdownFileUri(uri) {
    return isSupportedMarkdownFilePath(uri.path);
}
function isSupportedMarkdownFilePath(filePath) {
    return SUPPORTED_MARKDOWN_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
function isSupportedPdfFileUri(uri) {
    return isSupportedPdfFilePath(uri.path);
}
function isSupportedPdfFilePath(filePath) {
    return SUPPORTED_PDF_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
function isSupportedImageFileUri(uri) {
    return isSupportedImageFilePath(uri.path);
}
function isSupportedImageFilePath(filePath) {
    return SUPPORTED_IMAGE_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
function isSupportedMediaFileUri(uri) {
    return isSupportedMediaFilePath(uri.path);
}
function isSupportedMediaFilePath(filePath) {
    return SUPPORTED_MEDIA_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
function isSupportedNotebookFileUri(uri) {
    return isSupportedNotebookFilePath(uri.path);
}
function isSupportedNotebookFilePath(filePath) {
    return SUPPORTED_NOTEBOOK_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
function isSupportedPreviewFileUri(uri) {
    return (isLinkFileUri(uri) ||
        isSupportedWebFileUri(uri) ||
        isSupportedMarkdownFileUri(uri) ||
        isSupportedPdfFileUri(uri) ||
        isSupportedImageFileUri(uri) ||
        isSupportedMediaFileUri(uri) ||
        isSupportedNotebookFileUri(uri));
}
function pickDefaultPreviewFileName(candidateNames) {
    const normalizedCandidates = new Map(candidateNames.map((name) => [name.toLowerCase(), name]));
    for (const fileName of DEFAULT_FOLDER_ENTRY_FILES) {
        const match = normalizedCandidates.get(fileName);
        if (match) {
            return match;
        }
    }
    return undefined;
}
function pickDefaultLinkFileName(candidateNames) {
    const normalizedCandidates = new Map(candidateNames.map((name) => [name.toLowerCase(), name]));
    for (const fileName of DEFAULT_FOLDER_LINK_FILES) {
        const match = normalizedCandidates.get(fileName);
        if (match) {
            return match;
        }
    }
    const linkFiles = candidateNames.filter((name) => isLinkFilePath(name));
    if (linkFiles.length === 1) {
        return linkFiles[0];
    }
    return undefined;
}
async function readLinkFileContent(fileUri) {
    const vscode = await Promise.resolve().then(() => __importStar(require('vscode')));
    const openDocument = vscode.workspace.textDocuments.find((document) => document.uri.toString() === fileUri.toString());
    if (openDocument) {
        return openDocument.getText();
    }
    const bytes = await vscode.workspace.fs.readFile(fileUri);
    return Buffer.from(bytes).toString('utf8');
}
function getLabel(fileUri) {
    const baseName = path.basename(fileUri.path);
    return baseName || fileUri.toString();
}
async function resolveFolderPreviewSource(folderUri) {
    const vscode = await Promise.resolve().then(() => __importStar(require('vscode')));
    const entries = await vscode.workspace.fs.readDirectory(folderUri);
    const candidateNames = entries
        .filter((entry) => (entry[1] & vscode.FileType.File) !== 0)
        .map((entry) => entry[0]);
    const linkEntry = pickDefaultLinkFileName(candidateNames);
    if (linkEntry) {
        const entryUri = getChildUri(folderUri, linkEntry);
        return {
            kind: 'browser',
            label: `${getLabel(folderUri)} (${linkEntry})`,
            sourceUri: folderUri,
            url: await readLinkFileUrl(entryUri)
        };
    }
    const defaultEntry = pickDefaultPreviewFileName(candidateNames);
    if (!defaultEntry) {
        throw new Error(`SideBrowser: ${getLabel(folderUri)} does not contain a preview .link file or a default HTML entry. Add a .link file such as preview.link, or one of: ${DEFAULT_FOLDER_ENTRY_FILES.join(', ')}.`);
    }
    const entryUri = getChildUri(folderUri, defaultEntry);
    return {
        kind: 'browser',
        label: `${getLabel(folderUri)} (${defaultEntry})`,
        sourceUri: folderUri,
        url: entryUri.toString(true)
    };
}
function getChildUri(folderUri, childName) {
    return folderUri.with({
        path: `${folderUri.path.replace(/\/$/, '')}/${childName}`
    });
}
//# sourceMappingURL=linkFile.js.map