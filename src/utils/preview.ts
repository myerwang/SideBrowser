import * as vscode from 'vscode';

export type LinkViewPreviewMode = 'nativeBrowser' | 'webview';
export type LinkViewPreviewFallbackMode = 'externalBrowser' | 'webview';

export function getPreviewMode(): LinkViewPreviewMode {
  const config = vscode.workspace.getConfiguration('linkView');
  return config.get<LinkViewPreviewMode>('previewMode', 'nativeBrowser');
}

export function getPreviewFallbackMode(): LinkViewPreviewFallbackMode {
  const config = vscode.workspace.getConfiguration('linkView');
  return config.get<LinkViewPreviewFallbackMode>('previewFallbackMode', 'externalBrowser');
}

export async function openUrlInLocalBrowserKernel(url: string): Promise<void> {
  const target = vscode.Uri.parse(url);

  await vscode.commands.executeCommand('simpleBrowser.api.open', target, {
    preserveFocus: false,
    viewColumn: vscode.ViewColumn.Active
  });
}

export async function openFileInDefaultEditor(fileUri: vscode.Uri): Promise<void> {
  await vscode.commands.executeCommand('vscode.open', fileUri, {
    preserveFocus: false,
    viewColumn: vscode.ViewColumn.Active
  });
}
