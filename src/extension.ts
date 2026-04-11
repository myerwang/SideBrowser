import { ExternalOpenBridge } from './bridge/ExternalOpenBridge';
import { LinkViewUriHandler } from './bridge/LinkViewUriHandler';
import * as vscode from 'vscode';
import { registerLinkViewCommands } from './commands';
import { LinkViewPanelManager } from './panel/LinkViewPanelManager';
import { LinkViewLogger } from './utils/logger';

export function activate(context: vscode.ExtensionContext): void {
  const logger = new LinkViewLogger();
  const panelManager = new LinkViewPanelManager(logger);
  const externalOpenBridge = new ExternalOpenBridge(panelManager, logger);
  const uriHandler = new LinkViewUriHandler(panelManager, logger);

  context.subscriptions.push(logger);
  context.subscriptions.push(panelManager);
  context.subscriptions.push(externalOpenBridge);
  context.subscriptions.push(uriHandler);
  registerLinkViewCommands(context, panelManager);
  uriHandler.register();
  void externalOpenBridge.start();
}

export function deactivate(): void {}
