import * as vscode from 'vscode';
import { LinkViewPanelManager } from '../panel/LinkViewPanelManager';
import { LinkViewLogger } from '../utils/logger';
import { validateHttpUrl } from '../utils/url';

export class LinkViewUriHandler implements vscode.UriHandler, vscode.Disposable {
  private registration: vscode.Disposable | undefined;

  public constructor(
    private readonly panelManager: LinkViewPanelManager,
    private readonly logger: LinkViewLogger
  ) {}

  public register(): void {
    this.registration = vscode.window.registerUriHandler(this);
  }

  public dispose(): void {
    this.registration?.dispose();
    this.registration = undefined;
  }

  public async handleUri(uri: vscode.Uri): Promise<void> {
    try {
      const action = uri.path.replace(/^\/+/, '');
      const params = new URLSearchParams(uri.query);

      switch (action) {
        case 'openUrl':
        case 'open-url': {
          const candidate = params.get('url') ?? '';
          const validation = validateHttpUrl(candidate);
          if (!validation.ok) {
            throw new Error(validation.message);
          }

          await this.panelManager.open(vscode.Uri.parse(validation.url));
          this.logger.info(`URI handler opened URL: ${validation.url}`);
          return;
        }
        case 'openPath':
        case 'open-path': {
          const candidate = params.get('path');
          if (!candidate) {
            throw new Error('Missing "path" query parameter.');
          }

          await this.panelManager.open(vscode.Uri.file(candidate));
          this.logger.info(`URI handler opened path: ${candidate}`);
          return;
        }
        default:
          throw new Error(`Unsupported SideBrowser URI action: ${action || '(empty)'}.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown SideBrowser URI error.';
      this.logger.error(`URI handler failed: ${message}`);
      void vscode.window.showErrorMessage(`SideBrowser URI error: ${message}`);
    }
  }
}
