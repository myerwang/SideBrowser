import * as vscode from 'vscode';
import { LinkViewPanelManager } from '../panel/LinkViewPanelManager';
import { isSupportedPreviewFileUri } from '../utils/linkFile';

export function registerOpenExternalCommand(
  context: vscode.ExtensionContext,
  panelManager: LinkViewPanelManager
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('linkView.openExternal', async (target?: unknown) => {
      const explicitUri = getExplicitUri(target);
      if (explicitUri) {
        await panelManager.openExternalFromSource(explicitUri);
        return;
      }

      const activePanel = panelManager.getActivePanelSnapshot();
      if (activePanel) {
        await panelManager.openExternalUrl(activePanel.currentUrl);
        return;
      }

      const activeEditorUri = vscode.window.activeTextEditor?.document.uri;
      if (activeEditorUri && isSupportedPreviewFileUri(activeEditorUri)) {
        await panelManager.openExternalFromSource(activeEditorUri);
        return;
      }

      vscode.window.showErrorMessage(
        'No SideBrowser target found. Select a .link file, web file, Markdown file, PDF, image, media file, notebook, folder, or focus a SideBrowser tab.'
      );
    })
  );
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
