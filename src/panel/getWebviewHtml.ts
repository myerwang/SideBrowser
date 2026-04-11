import * as path from 'path';
import * as vscode from 'vscode';
import type { WebviewRenderModel } from '../types';

export function getWebviewHtml(
  webview: vscode.Webview,
  fileUri: vscode.Uri,
  model: WebviewRenderModel
): string {
  const nonce = getNonce();
  const fileName = path.basename(fileUri.path);
  const { embedding, url } = model;
  const blockedByHeaders = !embedding.canEmbed;
  const isLocalhost = isLikelyLocalhost(url);
  const stateJson = JSON.stringify({
    blockedByHeaders,
    blockedBy: embedding.blockedBy ?? '',
    blockedReason: embedding.reason ?? '',
    fileName,
    isLocalhost,
    url,
    warning: embedding.warning ?? ''
  }).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; frame-src http: https:;"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SideBrowser</title>
    <style nonce="${nonce}">
      :root {
        color-scheme: light dark;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        height: 100%;
        background: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        font-family: var(--vscode-font-family);
      }

      body {
        display: flex;
        flex-direction: column;
      }

      .toolbar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: 12px;
        align-items: center;
        padding: 10px 12px;
        border-bottom: 1px solid var(--vscode-panel-border);
        background:
          linear-gradient(
            180deg,
            color-mix(in srgb, var(--vscode-editor-background) 92%, var(--vscode-button-background) 8%),
            var(--vscode-editor-background)
          );
      }

      .title {
        font-weight: 600;
        white-space: nowrap;
      }

      .url {
        min-width: 0;
        padding: 7px 10px;
        border: 1px solid var(--vscode-input-border, transparent);
        border-radius: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        cursor: copy;
      }

      .actions {
        display: inline-flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      button {
        border: 1px solid transparent;
        border-radius: 6px;
        padding: 6px 12px;
        cursor: pointer;
        color: var(--vscode-button-foreground);
        background: var(--vscode-button-background);
      }

      button:hover {
        background: var(--vscode-button-hoverBackground);
      }

      button.secondary {
        color: var(--vscode-button-secondaryForeground);
        background: var(--vscode-button-secondaryBackground);
      }

      button.secondary:hover {
        background: var(--vscode-button-secondaryHoverBackground);
      }

      .status {
        min-height: 22px;
        padding: 6px 12px 0;
        color: var(--vscode-descriptionForeground);
        font-size: 12px;
      }

      .content {
        position: relative;
        flex: 1;
        min-height: 0;
        background:
          radial-gradient(circle at top left, color-mix(in srgb, var(--vscode-textLink-foreground) 12%, transparent), transparent 28%),
          var(--vscode-editor-background);
      }

      iframe {
        width: 100%;
        height: 100%;
        border: 0;
        background: #ffffff;
      }

      .loading,
      .blocked {
        position: absolute;
        inset: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 14px;
        background: color-mix(in srgb, var(--vscode-editor-background) 90%, var(--vscode-button-background) 10%);
        backdrop-filter: blur(8px);
      }

      .loading[hidden],
      .blocked[hidden] {
        display: none;
      }

      .panel-card {
        position: relative;
        max-width: 720px;
        text-align: center;
      }

      .blocked-card {
        padding-top: 22px;
      }

      .panel-card h2 {
        margin: 0 0 12px;
        font-size: 22px;
      }

      .panel-card p {
        margin: 0 0 10px;
        line-height: 1.5;
      }

      .panel-card .hint {
        color: var(--vscode-descriptionForeground);
      }

      .spinner {
        width: 28px;
        height: 28px;
        margin: 0 auto 16px;
        border-radius: 999px;
        border: 3px solid color-mix(in srgb, var(--vscode-button-background) 22%, transparent);
        border-top-color: var(--vscode-button-background);
        animation: spin 0.8s linear infinite;
      }

      .panel-actions {
        display: inline-flex;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .panel-copy-error {
        position: absolute;
        top: 0;
        right: 0;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 780px) {
        .toolbar {
          grid-template-columns: 1fr;
        }

        .actions {
          justify-content: flex-start;
        }
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <div class="title">SideBrowser</div>
      <div class="url" id="current-url" title="Click to copy URL">${escapeHtml(url)}</div>
      <div class="actions">
        <button id="refresh">Refresh</button>
        <button id="open-external" class="secondary">Open Externally</button>
        <button id="copy-url" class="secondary">Copy URL</button>
      </div>
    </div>

    <div class="status" id="status-message">Previewing ${escapeHtml(fileName)}</div>

    <div class="content">
      <div class="loading" id="loading">
        <div class="panel-card">
          <div class="spinner" aria-hidden="true"></div>
          <h2>Loading preview...</h2>
          <p>SideBrowser is opening the target page inside the editor.</p>
          <p class="hint">${isLocalhost ? 'Waiting for your local development server to respond.' : 'Some remote sites may block iframe embedding by design.'}</p>
        </div>
      </div>

      <div class="blocked" id="blocked" ${blockedByHeaders ? '' : 'hidden'}>
        <div class="panel-card blocked-card">
          <button id="blocked-copy-error" class="secondary panel-copy-error">Copy Error Info</button>
          <h2>无法在 SideBrowser 中嵌入该页面</h2>
          <p>可能原因：目标站点禁止 iframe 嵌入，或页面仍在启动中。</p>
          <p class="hint" id="blocked-reason">常见限制来自 X-Frame-Options 或 Content-Security-Policy 的 frame-ancestors 规则。</p>
          <div class="panel-actions">
            <button id="blocked-open">Open Externally</button>
            <button id="blocked-refresh" class="secondary">Retry</button>
          </div>
        </div>
      </div>

      ${blockedByHeaders ? '' : `<iframe id="preview-frame" src="${escapeHtml(url)}"></iframe>`}
    </div>

    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      const state = ${stateJson};
      const loading = document.getElementById('loading');
      const blocked = document.getElementById('blocked');
      const iframe = document.getElementById('preview-frame');
      const status = document.getElementById('status-message');
      const blockedReason = document.getElementById('blocked-reason');
      const blockedCopyError = document.getElementById('blocked-copy-error');
      const urlText = document.getElementById('current-url');
      const diagnostics = [];
      /** @type {number | undefined} */
      let watchdog = undefined;

      function postLog(level, message) {
        vscode.postMessage({ type: 'log', level, message });
      }

      function setStatus(text) {
        status.textContent = text;
      }

      function formatDiagnosticValue(value) {
        if (value instanceof Error) {
          return value.stack || value.message;
        }

        if (typeof value === 'string') {
          return value;
        }

        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      }

      function addDiagnostic(level, message) {
        diagnostics.push('[' + new Date().toISOString() + '] ' + level.toUpperCase() + ': ' + message);
        if (diagnostics.length > 40) {
          diagnostics.shift();
        }
        postLog(level, message);
      }

      function hookConsole() {
        ['log', 'warn', 'error'].forEach((method) => {
          const original = console[method].bind(console);
          console[method] = (...args) => {
            original(...args);
            addDiagnostic(method === 'log' ? 'info' : method, args.map(formatDiagnosticValue).join(' '));
          };
        });
      }

      function getBlockedIntro() {
        if (state.blockedBy === 'x-frame-options') {
          return '目标站点明确返回了 X-Frame-Options，浏览器会拒绝在 iframe 中显示它。';
        }

        if (state.blockedBy === 'csp-frame-ancestors') {
          return '目标站点的 Content-Security-Policy 限制了 frame-ancestors，SideBrowser 无法在编辑器内嵌入它。';
        }

        return state.isLocalhost
          ? '本地页面可能还没有启动完成，或者预览加载超时。'
          : '目标页面可能禁止 iframe 嵌入，或者这次加载超时了。';
      }

      function getBlockedActionHint() {
        if (state.blockedBy) {
          return '这类限制只能通过调整目标站点响应头解决，或者改用外部浏览器打开。';
        }

        return state.isLocalhost
          ? '确认本地开发服务器已经启动后，可以再试一次。'
          : '可以重试一次；如果仍然失败，建议改用外部浏览器打开。';
      }

      function syncBlockedCopy() {
        const title = document.querySelector('.blocked .panel-card h2');
        const intro = document.querySelector('.blocked .panel-card p');
        const hint = document.getElementById('blocked-reason');
        const retryButton = document.getElementById('blocked-refresh');

        if (title) {
          title.textContent = state.blockedBy ? '目标站点禁止 iframe 嵌入' : '无法在 SideBrowser 中嵌入该页面';
        }

        if (intro) {
          intro.textContent = getBlockedIntro();
        }

        if (hint) {
          hint.textContent = state.blockedReason || getBlockedActionHint();
        }

        if (retryButton) {
          retryButton.hidden = Boolean(state.blockedBy);
        }
      }

      function buildErrorInfo() {
        const parts = [
          'SideBrowser Webview Error',
          'File: ' + state.fileName,
          'URL: ' + state.url
        ];

        if (state.blockedReason) {
          parts.push('Reason: ' + state.blockedReason);
        }

        if (state.warning) {
          parts.push('Warning: ' + state.warning);
        }

        if (!state.blockedReason && blockedReason && blockedReason.textContent) {
          parts.push('Details: ' + blockedReason.textContent);
        }

        if (diagnostics.length > 0) {
          parts.push('Console Diagnostics:');
          parts.push(...diagnostics);
        }

        return parts.join('\\n');
      }

      function hideBlocked() {
        blocked.hidden = true;
      }

      function showLoading() {
        if (state.blockedByHeaders) {
          loading.hidden = true;
          blocked.hidden = false;
          syncBlockedCopy();
          setStatus('Embedding blocked by target headers. Open externally to continue.');
          addDiagnostic('warn', 'Embedding blocked before load: ' + (state.blockedReason || 'unknown header restriction'));
          return;
        }

        loading.hidden = false;
        hideBlocked();
        setStatus(state.warning || (state.isLocalhost ? 'Refreshing local preview ' + state.url : 'Refreshing ' + state.url));
        addDiagnostic('info', 'Loading preview started.');
        window.clearTimeout(watchdog);
        watchdog = window.setTimeout(() => {
          loading.hidden = true;
          blocked.hidden = false;
          syncBlockedCopy();
          setStatus(
            state.isLocalhost
              ? 'The preview is taking too long. Make sure the local dev server is running.'
              : 'Embedding looks blocked or the target is taking too long to respond.'
          );
          addDiagnostic('warn', 'Preview timed out or was blocked after 8 seconds.');
        }, 8000);
      }

      function finishLoading() {
        loading.hidden = true;
        hideBlocked();
        window.clearTimeout(watchdog);
        setStatus('Showing ' + state.url);
        addDiagnostic('info', 'Iframe load event fired.');
      }

      function requestCopy() {
        vscode.postMessage({ type: 'copyUrl', url: state.url });
      }

      document.getElementById('refresh').addEventListener('click', () => {
        showLoading();
        vscode.postMessage({ type: 'refresh' });
      });

      document.getElementById('open-external').addEventListener('click', () => {
        vscode.postMessage({ type: 'openExternal', url: state.url });
      });

      document.getElementById('copy-url').addEventListener('click', requestCopy);
      document.getElementById('blocked-open').addEventListener('click', () => {
        vscode.postMessage({ type: 'openExternal', url: state.url });
      });
      document.getElementById('blocked-refresh').addEventListener('click', () => {
        showLoading();
        vscode.postMessage({ type: 'refresh' });
      });
      blockedCopyError.addEventListener('click', () => {
        vscode.postMessage({ type: 'copyErrorInfo', text: buildErrorInfo() });
      });
      urlText.addEventListener('click', requestCopy);

      if (iframe) {
        iframe.addEventListener('load', () => {
          finishLoading();
        });
        iframe.addEventListener('error', () => {
          blocked.hidden = false;
          loading.hidden = true;
          syncBlockedCopy();
          blockedReason.textContent = state.blockedReason || 'The iframe reported a loading error.';
          setStatus('The preview reported an iframe loading error.');
          addDiagnostic('error', 'Iframe error event fired.');
        });
      }

      window.addEventListener('message', (event) => {
        const message = event.data;
        if (message?.type === 'status' && typeof message.text === 'string') {
          setStatus(message.text);
        }
      });

      window.addEventListener('error', (event) => {
        addDiagnostic('error', 'Webview script error: ' + (event.message || 'unknown error'));
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason && event.reason.message ? event.reason.message : String(event.reason);
        addDiagnostic('error', 'Unhandled promise rejection: ' + reason);
      });

      hookConsole();
      showLoading();
      syncBlockedCopy();
    </script>
  </body>
</html>`;
}

function getNonce(): string {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let index = 0; index < 32; index += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isLikelyLocalhost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '0.0.0.0'
    );
  } catch {
    return false;
  }
}
