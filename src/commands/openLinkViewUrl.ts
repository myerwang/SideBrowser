import * as vscode from 'vscode';
import { LinkViewPanelManager } from '../panel/LinkViewPanelManager';
import { validateHttpUrl } from '../utils/url';

export function registerOpenLinkViewUrlCommand(
  context: vscode.ExtensionContext,
  panelManager: LinkViewPanelManager
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('linkView.openUrl', async (target?: unknown) => {
      const url = await resolveUrl(target);
      if (!url) {
        return;
      }

      await panelManager.open(vscode.Uri.parse(url));
    })
  );
}

async function resolveUrl(target?: unknown): Promise<string | undefined> {
  const explicitUrl = getExplicitUrl(target);
  if (explicitUrl) {
    return explicitUrl;
  }

  const input = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: 'https://example.com',
    prompt: 'Enter an http:// or https:// URL to open in SideBrowser',
    validateInput(value) {
      if (!value.trim()) {
        return 'Enter a URL.';
      }

      const validation = validateHttpUrl(value.trim());
      return validation.ok ? undefined : validation.message;
    }
  });

  if (!input) {
    return undefined;
  }

  return getValidatedUrl(input.trim());
}

function getExplicitUrl(target?: unknown): string | undefined {
  if (typeof target === 'string') {
    return getValidatedUrl(target);
  }

  if (Array.isArray(target)) {
    for (const item of target) {
      const resolved = getExplicitUrl(item);
      if (resolved) {
        return resolved;
      }
    }
  }

  if (isUrlCarrier(target)) {
    return getValidatedUrl(target.url);
  }

  return undefined;
}

function isUrlCarrier(value: unknown): value is { readonly url: string } {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'url' in value &&
      typeof (value as { readonly url?: unknown }).url === 'string'
  );
}

function getValidatedUrl(value: string): string | undefined {
  const validation = validateHttpUrl(value.trim());
  if (validation.ok) {
    return validation.url;
  }

  void vscode.window.showErrorMessage(`SideBrowser: ${validation.message}`);
  return undefined;
}
