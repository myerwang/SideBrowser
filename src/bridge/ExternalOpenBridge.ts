import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { LinkViewPanelManager } from '../panel/LinkViewPanelManager';
import { validateHttpUrl } from '../utils/url';
import { LinkViewLogger } from '../utils/logger';

type ExternalOpenRequest =
  | {
      readonly action: 'openPath';
      readonly id: string;
      readonly path: string;
    }
  | {
      readonly action: 'openUrl';
      readonly id: string;
      readonly url: string;
    };

interface BridgeStatus {
  readonly action?: ExternalOpenRequest['action'];
  readonly lastRequestId?: string;
  readonly message?: string;
  readonly state: 'error' | 'ready' | 'success';
  readonly target?: string;
  readonly timestamp: string;
}

export class ExternalOpenBridge implements vscode.Disposable {
  private static readonly bridgeDir = path.join(os.tmpdir(), 'linkview-bridge');
  private static readonly requestFile = path.join(ExternalOpenBridge.bridgeDir, 'request.json');
  private static readonly statusFile = path.join(ExternalOpenBridge.bridgeDir, 'status.json');

  private disposed = false;
  private lastHandledRequestId: string | undefined;
  private pollTimer: NodeJS.Timeout | undefined;
  private polling = false;

  public constructor(
    private readonly panelManager: LinkViewPanelManager,
    private readonly logger: LinkViewLogger
  ) {}

  public async start(): Promise<void> {
    await fs.mkdir(ExternalOpenBridge.bridgeDir, { recursive: true });
    await this.writeStatus({
      message: 'Bridge is ready.',
      state: 'ready',
      timestamp: new Date().toISOString()
    });

    this.pollTimer = setInterval(() => {
      void this.poll();
    }, 500);
  }

  public dispose(): void {
    this.disposed = true;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  public static getRequestFilePath(): string {
    return ExternalOpenBridge.requestFile;
  }

  public static getStatusFilePath(): string {
    return ExternalOpenBridge.statusFile;
  }

  private async poll(): Promise<void> {
    if (this.disposed || this.polling) {
      return;
    }

    this.polling = true;
    try {
      const request = await this.readRequest();
      if (!request || request.id === this.lastHandledRequestId) {
        return;
      }

      this.lastHandledRequestId = request.id;
      await this.handleRequest(request);
      await this.deleteRequestFile();
    } finally {
      this.polling = false;
    }
  }

  private async readRequest(): Promise<ExternalOpenRequest | undefined> {
    try {
      const raw = await fs.readFile(ExternalOpenBridge.requestFile, 'utf8');
      const parsed = JSON.parse(raw) as Partial<ExternalOpenRequest>;
      if (!parsed || typeof parsed.id !== 'string' || typeof parsed.action !== 'string') {
        return undefined;
      }

      if (parsed.action === 'openUrl' && typeof parsed.url === 'string') {
        return {
          action: 'openUrl',
          id: parsed.id,
          url: parsed.url
        };
      }

      if (parsed.action === 'openPath' && typeof parsed.path === 'string') {
        return {
          action: 'openPath',
          id: parsed.id,
          path: parsed.path
        };
      }

      return undefined;
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError?.code === 'ENOENT') {
        return undefined;
      }

      this.logger.error(`SideBrowser bridge failed to read request: ${this.getErrorMessage(error)}`);
      await this.writeStatus({
        message: this.getErrorMessage(error),
        state: 'error',
        timestamp: new Date().toISOString()
      });
      return undefined;
    }
  }

  private async handleRequest(request: ExternalOpenRequest): Promise<void> {
    try {
      switch (request.action) {
        case 'openUrl': {
          const validation = validateHttpUrl(request.url);
          if (!validation.ok) {
            throw new Error(validation.message);
          }

          await this.panelManager.open(vscode.Uri.parse(validation.url));
          this.logger.info(`SideBrowser bridge opened URL: ${validation.url}`);
          await this.writeStatus({
            action: request.action,
            lastRequestId: request.id,
            message: 'Opened URL in SideBrowser.',
            state: 'success',
            target: validation.url,
            timestamp: new Date().toISOString()
          });
          return;
        }
        case 'openPath': {
          const normalizedPath = path.normalize(request.path);
          await this.panelManager.open(vscode.Uri.file(normalizedPath));
          this.logger.info(`SideBrowser bridge opened path: ${normalizedPath}`);
          await this.writeStatus({
            action: request.action,
            lastRequestId: request.id,
            message: 'Opened path in SideBrowser.',
            state: 'success',
            target: normalizedPath,
            timestamp: new Date().toISOString()
          });
          return;
        }
      }
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(`SideBrowser bridge request failed: ${message}`);
      await this.writeStatus({
        action: request.action,
        lastRequestId: request.id,
        message,
        state: 'error',
        target: request.action === 'openUrl' ? request.url : request.path,
        timestamp: new Date().toISOString()
      });
    }
  }

  private async deleteRequestFile(): Promise<void> {
    try {
      await fs.unlink(ExternalOpenBridge.requestFile);
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError?.code !== 'ENOENT') {
        this.logger.warn(`SideBrowser bridge could not delete request file: ${this.getErrorMessage(error)}`);
      }
    }
  }

  private async writeStatus(status: BridgeStatus): Promise<void> {
    await fs.writeFile(
      ExternalOpenBridge.statusFile,
      `${JSON.stringify(status, null, 2)}\n`,
      'utf8'
    );
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown bridge error.';
  }
}
