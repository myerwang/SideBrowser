import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { spawn } from 'child_process';

export type ExternalBrowserKind =
  | 'system'
  | 'edge'
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'custom';

interface BrowserConfig {
  readonly kind: ExternalBrowserKind;
  readonly customArgs: string[];
  readonly customPath: string;
}

export async function openUrlInConfiguredBrowser(url: string): Promise<void> {
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

function getBrowserConfig(): BrowserConfig {
  const config = vscode.workspace.getConfiguration('linkView');
  return {
    kind: config.get<ExternalBrowserKind>('externalBrowser.kind', 'system'),
    customArgs: config.get<string[]>('externalBrowser.customArgs', []),
    customPath: config.get<string>('externalBrowser.customPath', '').trim()
  };
}

function resolveBrowserExecutable(
  kind: Exclude<ExternalBrowserKind, 'system'>,
  customPath: string
): string | undefined {
  if (kind === 'custom') {
    return fileExists(customPath) ? customPath : undefined;
  }

  const platform = os.platform();
  const candidates = getBrowserCandidates(kind, platform);
  return candidates.find(fileExists);
}

function getBrowserCandidates(
  kind: Exclude<ExternalBrowserKind, 'system' | 'custom'>,
  platform: NodeJS.Platform
): string[] {
  switch (platform) {
    case 'win32':
      return getWindowsBrowserCandidates(kind);
    case 'darwin':
      return getMacBrowserCandidates(kind);
    default:
      return getLinuxBrowserCandidates(kind);
  }
}

function getWindowsBrowserCandidates(kind: 'edge' | 'chrome' | 'firefox' | 'safari'): string[] {
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

function getMacBrowserCandidates(kind: 'edge' | 'chrome' | 'firefox' | 'safari'): string[] {
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

function getLinuxBrowserCandidates(kind: 'edge' | 'chrome' | 'firefox' | 'safari'): string[] {
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

function fileExists(filePath: string): boolean {
  return Boolean(filePath) && fs.existsSync(filePath);
}

function launchBrowser(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
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

function getMissingBrowserMessage(kind: Exclude<ExternalBrowserKind, 'system'>): string {
  if (kind === 'custom') {
    return 'SideBrowser could not find the configured custom browser path. Update linkView.externalBrowser.customPath.';
  }

  if (kind === 'safari' && os.platform() !== 'darwin') {
    return 'Safari launch is only supported on macOS. Choose another browser or use a custom path.';
  }

  return `SideBrowser could not find a local ${kind} executable. Choose another browser or configure linkView.externalBrowser.customPath.`;
}
