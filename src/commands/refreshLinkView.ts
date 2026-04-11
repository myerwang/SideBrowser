import * as vscode from 'vscode';
import { LinkViewPanelManager } from '../panel/LinkViewPanelManager';
import { isSupportedPreviewFileUri } from '../utils/linkFile';

export function registerRefreshLinkViewCommand(
  context: vscode.ExtensionContext,
  panelManager: LinkViewPanelManager
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('linkView.refresh', async (target?: unknown) => {
      const linkUri = resolveRefreshTarget(target, panelManager);
      if (!linkUri) {
        return;
      }

      await panelManager.refresh(linkUri);
    })
  );
}

function resolveRefreshTarget(
  target: unknown,
  panelManager: LinkViewPanelManager
): vscode.Uri | undefined {
  const explicitUri = getExplicitUri(target);
  if (explicitUri) {
    return explicitUri;
  }

  const activeEditorUri = vscode.window.activeTextEditor?.document.uri;
  if (activeEditorUri && isSupportedPreviewFileUri(activeEditorUri)) {
    return activeEditorUri;
  }

  const activePanelUri = panelManager.getActiveLinkUri();
  if (activePanelUri) {
    return activePanelUri;
  }

  vscode.window.showErrorMessage(
    'No SideBrowser target found. Select a .link file, web file, Markdown file, PDF, image, media file, notebook, folder, or focus an existing SideBrowser tab.'
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
