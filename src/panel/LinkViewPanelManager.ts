import * as path from 'path';
import * as vscode from 'vscode';
import { openUrlInConfiguredBrowser } from '../utils/browser';
import { inspectEmbeddingSupport } from '../utils/embedding';
import { resolvePreviewSource } from '../utils/linkFile';
import { LinkViewLogger } from '../utils/logger';
import {
  getPreviewFallbackMode,
  getPreviewMode,
  openFileInDefaultEditor,
  openUrlInLocalBrowserKernel
} from '../utils/preview';
import { isFileUrl } from '../utils/url';
import { getWebviewHtml } from './getWebviewHtml';
import {
  type LinkViewHostMessage,
  type LinkViewWebviewMessage,
  type ManagedLinkViewPanel,
  type PanelSnapshot
} from '../types';

export class LinkViewPanelManager implements vscode.Disposable {
  public static readonly viewType = 'linkView.preview';

  private readonly panels = new Map<string, ManagedLinkViewPanel>();
  private activePanelKey: string | undefined;
  private lastPreview: PanelSnapshot | undefined;

  public constructor(private readonly logger: LinkViewLogger) {}

  public async open(fileUri: vscode.Uri): Promise<void> {
    this.logger.info(`Open requested for ${fileUri.toString()}`);
    await this.showOrCreatePanel(fileUri, true);
  }

  public async refresh(fileUri: vscode.Uri): Promise<void> {
    this.logger.info(`Refresh requested for ${fileUri.toString()}`);
    await this.showOrCreatePanel(fileUri, true);
  }

  public async openExternalFromSource(fileUri: vscode.Uri): Promise<void> {
    try {
      const source = await resolvePreviewSource(fileUri);
      this.logger.info(`Opening source ${fileUri.toString()} externally as ${source.url}`);
      await this.openExternalUrl(source.url);
    } catch (error) {
      this.showError(error);
    }
  }

  public getActiveLinkUri(): vscode.Uri | undefined {
    return this.getActivePanelSnapshot()?.sourceUri;
  }

  public getActivePanelSnapshot(): PanelSnapshot | undefined {
    if (this.activePanelKey) {
      const state = this.panels.get(this.activePanelKey);
      if (state) {
        return {
          currentUrl: state.currentUrl,
          previewSurface: 'linkview-webview',
          sourceUri: state.sourceUri
        };
      }
    }

    return this.lastPreview;
  }

  public dispose(): void {
    for (const state of [...this.panels.values()]) {
      state.panel.dispose();
    }

    this.panels.clear();
    this.activePanelKey = undefined;
  }

  private async showOrCreatePanel(fileUri: vscode.Uri, reveal: boolean): Promise<void> {
    try {
      const source = await resolvePreviewSource(fileUri);
      const sourceUri = source.sourceUri;
      const snapshotSourceUri = fileUri;
      const url = source.url;

      switch (source.kind) {
        case 'markdown':
          this.lastPreview = {
            currentUrl: url,
            previewSurface: 'markdown-preview',
            sourceUri: snapshotSourceUri
          };
          await this.openMarkdownPreview(sourceUri);
          return;
        case 'pdf':
          this.lastPreview = {
            currentUrl: url,
            previewSurface: 'pdf-preview',
            sourceUri: snapshotSourceUri
          };
          await this.openFilePreview(sourceUri, 'PDF preview');
          return;
        case 'image':
          this.lastPreview = {
            currentUrl: url,
            previewSurface: 'image-preview',
            sourceUri: snapshotSourceUri
          };
          await this.openFilePreview(sourceUri, 'image preview');
          return;
        case 'media':
          this.lastPreview = {
            currentUrl: url,
            previewSurface: 'media-preview',
            sourceUri: snapshotSourceUri
          };
          await this.openFilePreview(sourceUri, 'media preview');
          return;
        case 'notebook':
          this.lastPreview = {
            currentUrl: url,
            previewSurface: 'notebook-preview',
            sourceUri: snapshotSourceUri
          };
          await this.openFilePreview(sourceUri, 'notebook preview');
          return;
        case 'browser':
        default:
          this.lastPreview = {
            currentUrl: url,
            previewSurface: 'native-browser',
            sourceUri: snapshotSourceUri
          };
          break;
      }

      if (getPreviewMode() === 'nativeBrowser') {
        try {
          await this.openInLocalBrowserKernel(fileUri, url);
          return;
        } catch (error) {
          const fallbackWarning = this.getNativePreviewFallbackWarning(error);
          this.logger.warn(fallbackWarning);

          if (isFileUrl(url)) {
            await this.openFilePreview(vscode.Uri.parse(url), 'HTML preview');
            void vscode.window.showWarningMessage(
              'SideBrowser could not open the local browser preview, so it opened the local file with the built-in preview instead.'
            );
            return;
          }

          if (getPreviewFallbackMode() === 'externalBrowser') {
            try {
              await this.openInConfiguredExternalBrowser(url);
              this.activePanelKey = undefined;
              void vscode.window.showWarningMessage(
                'SideBrowser could not open the local browser preview, so it opened the page in your configured external browser instead.'
              );
              return;
            } catch (browserError) {
              const externalFallbackWarning = `${fallbackWarning} SideBrowser also could not launch the configured external browser. ${this.getErrorMessage(browserError)}`;
              this.logger.warn(externalFallbackWarning);
              await this.showOrCreateWebviewPanel(fileUri, url, reveal, externalFallbackWarning);
              return;
            }
          }

          await this.showOrCreateWebviewPanel(fileUri, url, reveal, fallbackWarning);
          return;
        }
      }

      if (isFileUrl(url)) {
        try {
          await this.openInLocalBrowserKernel(vscode.Uri.parse(url), url);
          return;
        } catch (error) {
          const fallbackWarning = this.getNativePreviewFallbackWarning(error);
          this.logger.warn(fallbackWarning);
          await this.openFilePreview(vscode.Uri.parse(url), 'HTML preview');
          void vscode.window.showWarningMessage(
            'SideBrowser webview mode does not embed local file URLs directly, so it opened the local file with the built-in preview instead.'
          );
          return;
        }
      }

      await this.showOrCreateWebviewPanel(fileUri, url, reveal);
    } catch (error) {
      this.showError(error);
    }
  }

  private async openMarkdownPreview(fileUri: vscode.Uri): Promise<void> {
    await vscode.commands.executeCommand('markdown.showPreview', fileUri);
    this.activePanelKey = undefined;
    this.logger.info(`Opened ${fileUri.toString()} in the VS Code Markdown preview.`);
  }

  private async openFilePreview(fileUri: vscode.Uri, surfaceLabel: string): Promise<void> {
    await openFileInDefaultEditor(fileUri);
    this.activePanelKey = undefined;
    this.logger.info(`Opened ${fileUri.toString()} in the VS Code ${surfaceLabel}.`);
  }

  private async openInLocalBrowserKernel(fileUri: vscode.Uri, url: string): Promise<void> {
    await openUrlInLocalBrowserKernel(url);
    this.activePanelKey = undefined;
    this.logger.info(`Opened ${fileUri.toString()} -> ${url} in the local browser kernel.`);
  }

  private async showOrCreateWebviewPanel(
    fileUri: vscode.Uri,
    url: string,
    reveal: boolean,
    fallbackWarning?: string
  ): Promise<void> {
    const embedding = await inspectEmbeddingSupport(url);
    const warning = [fallbackWarning, embedding.warning].filter(Boolean).join(' ').trim() || undefined;
    const resolvedEmbedding = warning ? { ...embedding, warning } : embedding;
    const key = this.toKey(fileUri);
    const existing = this.panels.get(key);
    const errorInfo = this.buildErrorInfo(fileUri, url, resolvedEmbedding.reason, warning);

    this.logger.info(
      `Prepared SideBrowser webview for ${fileUri.toString()} -> ${url} (canEmbed=${resolvedEmbedding.canEmbed})`
    );
    if (resolvedEmbedding.reason) {
      this.logger.warn(`Embedding blocked for ${url}: ${resolvedEmbedding.reason}`);
    }
    if (warning) {
      this.logger.warn(`Embedding warning for ${url}: ${warning}`);
    }

    if (existing) {
      existing.baseReason = resolvedEmbedding.reason;
      existing.baseWarning = warning;
      existing.currentUrl = url;
      existing.diagnosticLog = [];
      existing.lastErrorInfo = errorInfo;
      existing.panel.title = this.getPanelTitle(fileUri);
      existing.panel.webview.html = getWebviewHtml(existing.panel.webview, fileUri, {
        embedding: resolvedEmbedding,
        url
      });
      if (reveal) {
        existing.panel.reveal(vscode.ViewColumn.Active, false);
      }
      this.activePanelKey = key;
      this.lastPreview = {
        currentUrl: url,
        previewSurface: 'linkview-webview',
        sourceUri: fileUri
      };
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      LinkViewPanelManager.viewType,
      this.getPanelTitle(fileUri),
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    const state: ManagedLinkViewPanel = {
      baseReason: resolvedEmbedding.reason,
      baseWarning: warning,
      sourceUri: fileUri,
      panel,
      currentUrl: url,
      diagnosticLog: [],
      lastErrorInfo: errorInfo
    };

    this.panels.set(key, state);
    this.activePanelKey = key;

    panel.onDidDispose(() => {
      this.panels.delete(key);
      if (this.activePanelKey === key) {
        this.activePanelKey = undefined;
      }
    });

    panel.onDidChangeViewState((event) => {
      if (event.webviewPanel.active) {
        this.activePanelKey = key;
        this.lastPreview = {
          currentUrl: state.currentUrl,
          previewSurface: 'linkview-webview',
          sourceUri: state.sourceUri
        };
      }
    });

    panel.webview.onDidReceiveMessage((message: LinkViewWebviewMessage) => {
      void this.handleWebviewMessage(state, message);
    });

    panel.webview.html = getWebviewHtml(panel.webview, fileUri, {
      embedding: resolvedEmbedding,
      url
    });
  }

  private async handleWebviewMessage(
    state: ManagedLinkViewPanel,
    message: LinkViewWebviewMessage
  ): Promise<void> {
    switch (message.type) {
      case 'refresh':
        await this.refresh(state.sourceUri);
        return;
      case 'openExternal':
        await this.openExternalUrl(message.url ?? state.currentUrl);
        return;
      case 'copyUrl':
        await this.copyUrl(message.url ?? state.currentUrl, state.panel.webview);
        return;
      case 'copyErrorInfo':
        await this.copyErrorInfo(message.text || state.lastErrorInfo || '', state.panel.webview);
        return;
      case 'log':
        this.logFromWebview(message.level, state, message.message);
        return;
      default:
        return;
    }
  }

  private async copyUrl(url: string, webview: vscode.Webview): Promise<void> {
    try {
      await vscode.env.clipboard.writeText(url);
      const message: LinkViewHostMessage = {
        type: 'status',
        text: 'URL copied to clipboard.'
      };
      void webview.postMessage(message);
    } catch {
      const message: LinkViewHostMessage = {
        type: 'status',
        text: 'Unable to copy the URL automatically.'
      };
      void webview.postMessage(message);
    }
  }

  private async copyErrorInfo(text: string, webview: vscode.Webview): Promise<void> {
    try {
      await vscode.env.clipboard.writeText(text);
      const message: LinkViewHostMessage = {
        type: 'status',
        text: 'Error information copied to clipboard.'
      };
      void webview.postMessage(message);
    } catch {
      const message: LinkViewHostMessage = {
        type: 'status',
        text: 'Unable to copy the error information automatically.'
      };
      void webview.postMessage(message);
    }
  }

  public async openExternalUrl(url: string): Promise<void> {
    try {
      await this.openInConfiguredExternalBrowser(url);
    } catch (error) {
      this.showError(error);
    }
  }


  private getPanelTitle(fileUri: vscode.Uri): string {
    return `SideBrowser: ${path.basename(fileUri.path)}`;
  }

  private toKey(fileUri: vscode.Uri): string {
    return fileUri.toString();
  }

  private logFromWebview(
    level: 'info' | 'warn' | 'error',
    state: ManagedLinkViewPanel,
    message: string
  ): void {
    const prefix = `${path.basename(state.sourceUri.path)} -> ${state.currentUrl}`;
    this.recordDiagnostic(state, level, message);
    switch (level) {
      case 'info':
        this.logger.info(`[webview] ${prefix} | ${message}`);
        return;
      case 'warn':
        this.logger.warn(`[webview] ${prefix} | ${message}`);
        return;
      case 'error':
        this.logger.error(`[webview] ${prefix} | ${message}`);
        return;
    }
  }

  private buildErrorInfo(
    fileUri: vscode.Uri,
    url: string,
    reason?: string,
    warning?: string,
    diagnostics: string[] = []
  ): string {
    return [
      `SideBrowser Source: ${fileUri.fsPath || fileUri.toString()}`,
      `URL: ${url}`,
      reason ? `Reason: ${reason}` : undefined,
      warning ? `Warning: ${warning}` : undefined,
      diagnostics.length > 0 ? 'Console Diagnostics:' : undefined,
      ...diagnostics
    ]
      .filter((line): line is string => Boolean(line))
      .join('\n');
  }


  private recordDiagnostic(
    state: ManagedLinkViewPanel,
    level: 'info' | 'warn' | 'error',
    message: string
  ): void {
    const entry = `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`;
    state.diagnosticLog = [...state.diagnosticLog.slice(-39), entry];
    state.lastErrorInfo = this.buildErrorInfo(
      state.sourceUri,
      state.currentUrl,
      state.baseReason,
      state.baseWarning,
      state.diagnosticLog
    );
  }

  private getNativePreviewFallbackWarning(error: unknown): string {
    const detail = this.getErrorMessage(error);
    return `Unable to open the local browser-kernel preview. ${detail}`;
  }

  private getPreviewSurfaceLabel(surface: PanelSnapshot['previewSurface']): string {
    switch (surface) {
      case 'linkview-webview':
        return 'SideBrowser Webview';
      case 'markdown-preview':
        return 'VS Code Markdown Preview';
      case 'pdf-preview':
        return 'VS Code Default PDF Editor';
      case 'image-preview':
        return 'VS Code Image Preview';
      case 'media-preview':
        return 'VS Code Media Preview';
      case 'notebook-preview':
        return 'VS Code Notebook Editor';
      case 'native-browser':
      default:
        return 'VS Code Browser Preview';
    }
  }

  private async openInConfiguredExternalBrowser(url: string): Promise<void> {
    this.logger.info(`Opening URL externally: ${url}`);
    await openUrlInConfiguredBrowser(url);
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown preview failure.';
  }

  private showError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Unknown SideBrowser error.';
    this.logger.error(message);
    void vscode.window.showErrorMessage(message);
  }
}

