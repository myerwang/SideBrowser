import * as vscode from 'vscode';
import { registerNewLinkFileCommand } from './newLinkFile';
import { registerOpenExternalCommand } from './openExternal';
import { registerOpenLinkViewCommand } from './openLinkView';
import { registerOpenLinkViewUrlCommand } from './openLinkViewUrl';
import { registerRefreshLinkViewCommand } from './refreshLinkView';
import { registerSetupAiPromptCommand } from './setupAiPrompt';
import { LinkViewPanelManager } from '../panel/LinkViewPanelManager';

export function registerLinkViewCommands(
  context: vscode.ExtensionContext,
  panelManager: LinkViewPanelManager
): void {
  registerOpenLinkViewCommand(context, panelManager);
  registerOpenLinkViewUrlCommand(context, panelManager);
  registerRefreshLinkViewCommand(context, panelManager);
  registerOpenExternalCommand(context, panelManager);
  registerNewLinkFileCommand(context);
  registerSetupAiPromptCommand(context);
}



