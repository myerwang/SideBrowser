import * as vscode from 'vscode';

type LogLevel = 'info' | 'warn' | 'error';

export class LinkViewLogger implements vscode.Disposable {
  private readonly outputChannel: vscode.OutputChannel;

  public constructor() {
    this.outputChannel = vscode.window.createOutputChannel('SideBrowser');
  }

  public info(message: string): void {
    this.write('info', message);
  }

  public warn(message: string): void {
    this.write('warn', message);
  }

  public error(message: string): void {
    this.write('error', message);
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }

  private write(level: LogLevel, message: string): void {
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
    this.outputChannel.appendLine(line);

    switch (level) {
      case 'info':
        console.log(`[SideBrowser] ${message}`);
        return;
      case 'warn':
        console.warn(`[SideBrowser] ${message}`);
        return;
      case 'error':
        console.error(`[SideBrowser] ${message}`);
        return;
    }
  }
}
