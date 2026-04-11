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
exports.openUrlInConfiguredBrowser = openUrlInConfiguredBrowser;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
async function openUrlInConfiguredBrowser(url) {
    const config = getBrowserConfig();
    if (config.kind === 'system') {
        const didOpen = await vscode.env.openExternal(vscode.Uri.parse(url));
        if (!didOpen) {
            throw new Error(`Could not open ${url} with the system browser.`);
        }
        return;
    }
    const executable = resolveBrowserExecutable(config.kind, config.customPath);
    if (!executable) {
        throw new Error(getMissingBrowserMessage(config.kind));
    }
    await launchBrowser(executable, [...config.customArgs, url]);
}
function getBrowserConfig() {
    const config = vscode.workspace.getConfiguration('linkView');
    return {
        kind: config.get('externalBrowser.kind', 'system'),
        customArgs: config.get('externalBrowser.customArgs', []),
        customPath: config.get('externalBrowser.customPath', '').trim()
    };
}
function resolveBrowserExecutable(kind, customPath) {
    if (kind === 'custom') {
        return fileExists(customPath) ? customPath : undefined;
    }
    const platform = os.platform();
    const candidates = getBrowserCandidates(kind, platform);
    return candidates.find(fileExists);
}
function getBrowserCandidates(kind, platform) {
    switch (platform) {
        case 'win32':
            return getWindowsBrowserCandidates(kind);
        case 'darwin':
            return getMacBrowserCandidates(kind);
        default:
            return getLinuxBrowserCandidates(kind);
    }
}
function getWindowsBrowserCandidates(kind) {
    const programFiles = process.env.ProgramFiles ?? 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)';
    const localAppData = process.env.LOCALAPPDATA ?? '';
    switch (kind) {
        case 'edge':
            return [
                path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
                path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
            ];
        case 'chrome':
            return [
                path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
                path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
                path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe')
            ];
        case 'firefox':
            return [
                path.join(programFiles, 'Mozilla Firefox', 'firefox.exe'),
                path.join(programFilesX86, 'Mozilla Firefox', 'firefox.exe')
            ];
        case 'safari':
            return [];
    }
}
function getMacBrowserCandidates(kind) {
    switch (kind) {
        case 'edge':
            return ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'];
        case 'chrome':
            return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
        case 'firefox':
            return ['/Applications/Firefox.app/Contents/MacOS/firefox'];
        case 'safari':
            return ['/Applications/Safari.app/Contents/MacOS/Safari'];
    }
}
function getLinuxBrowserCandidates(kind) {
    switch (kind) {
        case 'edge':
            return ['/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable'];
        case 'chrome':
            return ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
        case 'firefox':
            return ['/usr/bin/firefox'];
        case 'safari':
            return [];
    }
}
function fileExists(filePath) {
    return Boolean(filePath) && fs.existsSync(filePath);
}
function launchBrowser(command, args) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(command, args, {
            detached: true,
            stdio: 'ignore'
        });
        child.on('error', (error) => {
            reject(error);
        });
        child.unref();
        resolve();
    });
}
function getMissingBrowserMessage(kind) {
    if (kind === 'custom') {
        return 'SideBrowser could not find the configured custom browser path. Update linkView.externalBrowser.customPath.';
    }
    if (kind === 'safari' && os.platform() !== 'darwin') {
        return 'Safari launch is only supported on macOS. Choose another browser or use a custom path.';
    }
    return `SideBrowser could not find a local ${kind} executable. Choose another browser or configure linkView.externalBrowser.customPath.`;
}
//# sourceMappingURL=browser.js.map