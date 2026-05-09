import * as vscode from 'vscode';

export function getExplicitUri(target?: unknown): vscode.Uri | undefined {
  if (target instanceof vscode.Uri) {
    return target;
  }

  if (Array.isArray(target)) {
    return target.find((item): item is vscode.Uri => item instanceof vscode.Uri);
  }

  return undefined;
}
