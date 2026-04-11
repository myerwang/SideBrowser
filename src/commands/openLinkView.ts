import * as vscode from 'vscode';
import { LinkViewPanelManager } from '../panel/LinkViewPanelManager';
import { isSupportedPreviewFileUri } from '../utils/linkFile';

export function registerOpenLinkViewCommand(
  context: vscode.ExtensionContext,
  panelManager: LinkViewPanelManager
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('linkView.open', async (target?: unknown) => {
      const linkUri = resolveOpenTarget(target);
      if (!linkUri) {
        return;
      }

      await panelManager.open(linkUri);
    })
  );
}

function resolveOpenTarget(target?: unknown): vscode.Uri | undefined {
  const explicitUri = getExplicitUri(target);
  if (explicitUri) {
    return explicitUri;
  }

  const activeEditorUri = vscode.window.activeTextEditor?.document.uri;
  if (activeEditorUri) {
    return ensurePreviewFileUri(activeEditorUri);
  }

  vscode.window.showErrorMessage(
    'SideBrowser needs a .link file, web file, Markdown file, PDF, image, media file, notebook, or a folder from the Explorer.'
  );
  return undefined;
}

function getExplicitUri(target?: unknown): vscode.Uri | undefined {
  if (target instanceof vscode.Uri) {
    return target;
  }

  if (Array.isArray(target)) {
    return target.find((item): item is vscode.Uri => item instanceof vscode.Uri);
  }

  return undefined;
}

function ensurePreviewFileUri(uri: vscode.Uri): vscode.Uri | undefined {
  if (isSupportedPreviewFileUri(uri)) {
    return uri;
  }

  vscode.window.showErrorMessage(
    'SideBrowser can open .link, Markdown, PDF, image, media, notebook, and common web files such as .html or .htm.'
  );
  return undefined;
}
