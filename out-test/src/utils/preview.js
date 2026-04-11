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
exports.getPreviewMode = getPreviewMode;
exports.getPreviewFallbackMode = getPreviewFallbackMode;
exports.openUrlInLocalBrowserKernel = openUrlInLocalBrowserKernel;
exports.openFileInDefaultEditor = openFileInDefaultEditor;
const vscode = __importStar(require("vscode"));
function getPreviewMode() {
    const config = vscode.workspace.getConfiguration('linkView');
    return config.get('previewMode', 'nativeBrowser');
}
function getPreviewFallbackMode() {
    const config = vscode.workspace.getConfiguration('linkView');
    return config.get('previewFallbackMode', 'externalBrowser');
}
async function openUrlInLocalBrowserKernel(url) {
    const target = vscode.Uri.parse(url);
    await vscode.commands.executeCommand('simpleBrowser.api.open', target, {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Active
    });
}
async function openFileInDefaultEditor(fileUri) {
    await vscode.commands.executeCommand('vscode.open', fileUri, {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Active
    });
}
//# sourceMappingURL=preview.js.map