import * as path from 'path';
import * as vscode from 'vscode';

// ─── Prompt templates ───────────────────────────────────────────────────────

const PROMPTS: Record<string, string> = {
  en: `# SideBrowser — Auto-open Rule

This VS Code window has the SideBrowser extension installed.
Whenever you start a local dev server (npm run dev, npx serve, python -m http.server, etc.) and obtain a local URL, you MUST immediately open that URL in SideBrowser within the SAME step.
Do NOT wait for me to ask you to open it. Do NOT open a separate browser window or a new VS Code window.

How to open (macOS/Linux):
  code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=<percent-encoded-URL>"

How to open (Windows):
  code.cmd --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=<percent-encoded-URL>"

Workflow (single step):
1. Start the dev server.
2. Read the local URL from the server output (e.g. http://localhost:5173).
3. Immediately run the code/code.cmd command above with that URL.

Examples:
- After Vite prints "Local: http://localhost:5173/"
  code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"
- After Express prints "listening on 3000"
  code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A3000"
- Open a local HTML file directly
  code --open-url "vscode://YohjiUbun.sidebrowser/openPath?path=%2Fabsolute%2Fpath%2Fto%2Ffile.html"`,

  zh: `# SideBrowser — 自动打开规则

当前 VS Code 窗口已安装 SideBrowser 扩展。
当你启动本地开发服务器（npm run dev、npx serve、python -m http.server 等）并获得本地 URL 后，必须在同一步骤内立即用 SideBrowser 打开该 URL。
不要等我来要求你打开。不要另外打开系统浏览器。不要新开 VS Code 窗口。

打开方式 (macOS/Linux)：
  code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=<百分号编码后的URL>"

打开方式 (Windows)：
  code.cmd --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=<百分号编码后的URL>"

工作流（一步完成）：
1. 启动开发服务器。
2. 从服务器输出中读取本地 URL（例如 http://localhost:5173）。
3. 立即执行上面的 code/code.cmd 命令，把该 URL 传入。

示例：
- Vite 打印出 "Local: http://localhost:5173/" 之后
  code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"
- Express 打印出 "listening on 3000" 之后
  code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A3000"
- 直接打开本地 HTML 文件
  code --open-url "vscode://YohjiUbun.sidebrowser/openPath?path=%2Fabsolute%2Fpath%2Fto%2Ffile.html"`,

  ja: `# SideBrowser — 自動オープンルール

この VS Code ウィンドウには SideBrowser 拡張がインストールされています。
ローカル開発サーバー（npm run dev、npx serve、python -m http.server など）を起動してローカル URL を取得したら、同じステップ内で即座に SideBrowser でその URL を開いてください。
私に指示されるのを待たないでください。外部ブラウザを開かないでください。新しい VS Code ウィンドウも開かないでください。

開き方 (macOS/Linux):
  code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=<パーセントエンコードされたURL>"

開き方 (Windows):
  code.cmd --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=<パーセントエンコードされたURL>"

ワークフロー（ワンステップ）:
1. 開発サーバーを起動する。
2. サーバー出力からローカル URL を読み取る（例: http://localhost:5173）。
3. 上記の code/code.cmd コマンドをその URL で即座に実行する。

例:
- Vite が "Local: http://localhost:5173/" と出力した後
  code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"
- Express が "listening on 3000" と出力した後
  code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A3000"
- ローカル HTML ファイルを直接開く
  code --open-url "vscode://YohjiUbun.sidebrowser/openPath?path=%2Fabsolute%2Fpath%2Fto%2Ffile.html"`
};

// ─── AI tool definitions ────────────────────────────────────────────────────

interface AiTarget {
  label: string;
  description: string;
  id: string;
  /** Relative path from workspace root to the rule file. */
  relPath: string;
  /** If true, wrap prompt with Cursor .mdc frontmatter. */
  cursorFrontmatter?: boolean;
  /** If true, store as JSON in .gemini/settings.json. */
  geminiJson?: boolean;
  /** If true, append to existing file instead of overwriting it. */
  appendIfExists?: boolean;
}

const AI_TARGETS: AiTarget[] = [
  {
    label: 'GitHub Copilot',
    description: '.github/copilot-instructions.md',
    id: 'copilot',
    relPath: '.github/copilot-instructions.md'
  },
  {
    label: 'Cline',
    description: '.clinerules/sidebrowser.md',
    id: 'cline',
    relPath: '.clinerules/sidebrowser.md'
  },
  {
    label: 'Cursor',
    description: '.cursor/rules/sidebrowser.mdc',
    id: 'cursor',
    relPath: '.cursor/rules/sidebrowser.mdc',
    cursorFrontmatter: true
  },
  {
    label: 'Windsurf',
    description: '.windsurf/rules/sidebrowser.md',
    id: 'windsurf',
    relPath: '.windsurf/rules/sidebrowser.md'
  },
  {
    label: 'Continue',
    description: '.continue/rules/sidebrowser.md',
    id: 'continue',
    relPath: '.continue/rules/sidebrowser.md'
  },
  {
    label: 'Codex',
    description: 'AGENTS.md',
    id: 'codex',
    relPath: 'AGENTS.md',
    appendIfExists: true
  },
  {
    label: 'Gemini CLI',
    description: '.gemini/settings.json',
    id: 'gemini',
    relPath: '.gemini/settings.json',
    geminiJson: true
  }
];

const CURSOR_FRONTMATTER = `---
description: SideBrowser auto-open rule
globs:
alwaysApply: true
---

`;

// ─── Command registration ───────────────────────────────────────────────────

export function registerSetupAiPromptCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('linkView.setupAiPrompt', async () => {
      await setupAiPrompt();
    })
  );
}

// ─── Main flow ──────────────────────────────────────────────────────────────

async function setupAiPrompt(): Promise<void> {
  // 1. Check workspace
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    void vscode.window.showErrorMessage('SideBrowser: Please open a workspace folder first.');
    return;
  }

  // 2. Pick language
  const langPick = await vscode.window.showQuickPick(
    [
      { label: 'English', id: 'en' },
      { label: '中文', id: 'zh' },
      { label: '日本語', id: 'ja' }
    ],
    {
      placeHolder: 'Select prompt language / 选择提示词语言 / プロンプト言語を選択',
      title: 'SideBrowser: Setup AI Prompt'
    }
  );
  if (!langPick) { return; }

  // 3. Pick AI tools (multi-select)
  const toolPicks = await vscode.window.showQuickPick(
    AI_TARGETS.map(t => ({
      label: t.label,
      description: t.description,
      picked: true,
      id: t.id
    })),
    {
      placeHolder: 'Select AI tools to install prompt for (multi-select)',
      title: 'SideBrowser: Setup AI Prompt',
      canPickMany: true
    }
  );
  if (!toolPicks || toolPicks.length === 0) { return; }

  const prompt = PROMPTS[langPick.id];
  const rootUri = workspaceFolder.uri;
  const installed: string[] = [];
  const skipped: string[] = [];

  for (const pick of toolPicks) {
    const target = AI_TARGETS.find(t => t.id === pick.id);
    if (!target) { continue; }

    try {
      if (target.geminiJson) {
        await installGeminiPrompt(rootUri, target, prompt, installed, skipped);
      } else {
        await installFilePrompt(rootUri, target, prompt, installed, skipped);
      }
    } catch (err) {
      skipped.push(`${target.label} (error: ${err instanceof Error ? err.message : String(err)})`);
    }
  }

  // 4. Show summary
  const summary = buildSummary(installed, skipped);
  if (installed.length > 0) {
    void vscode.window.showInformationMessage(summary);
  } else {
    void vscode.window.showWarningMessage(summary);
  }
}

// ─── Installers ─────────────────────────────────────────────────────────────

async function installFilePrompt(
  rootUri: vscode.Uri,
  target: AiTarget,
  prompt: string,
  installed: string[],
  skipped: string[]
): Promise<void> {
  const fileUri = vscode.Uri.joinPath(rootUri, target.relPath);
  const content = target.cursorFrontmatter
    ? CURSOR_FRONTMATTER + prompt
    : prompt;

  if (await fileExists(fileUri)) {
    const existing = await readFileText(fileUri);
    if (existing.includes('SideBrowser')) {
      skipped.push(`${target.label} (already configured)`);
      return;
    }

    if (target.appendIfExists || target.id === 'copilot') {
      const merged = existing + '\n\n' + content;
      await writeFileText(fileUri, merged);
      installed.push(`${target.label} → ${target.relPath} (appended)`);
      return;
    }
  }

  await writeFileText(fileUri, content);
  installed.push(`${target.label} → ${target.relPath}`);
}

async function installGeminiPrompt(
  rootUri: vscode.Uri,
  target: AiTarget,
  prompt: string,
  installed: string[],
  skipped: string[]
): Promise<void> {
  const fileUri = vscode.Uri.joinPath(rootUri, target.relPath);

  if (await fileExists(fileUri)) {
    const existing = await readFileText(fileUri);
    if (existing.includes('SideBrowser')) {
      skipped.push(`${target.label} (already configured)`);
      return;
    }
    // Try to merge into existing JSON
    try {
      const json = JSON.parse(existing);
      if (json.systemInstruction) {
        json.systemInstruction += '\n\n' + prompt;
      } else {
        json.systemInstruction = prompt;
      }
      await writeFileText(fileUri, JSON.stringify(json, null, 2));
      installed.push(`${target.label} → ${target.relPath} (merged)`);
    } catch {
      skipped.push(`${target.label} (could not parse existing settings.json)`);
    }
    return;
  }

  const json = JSON.stringify({ systemInstruction: prompt }, null, 2);
  await writeFileText(fileUri, json);
  installed.push(`${target.label} → ${target.relPath}`);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fileExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

async function readFileText(uri: vscode.Uri): Promise<string> {
  const bytes = await vscode.workspace.fs.readFile(uri);
  return Buffer.from(bytes).toString('utf-8');
}

async function writeFileText(uri: vscode.Uri, content: string): Promise<void> {
  await ensureParentDirectory(uri);
  const bytes = Buffer.from(content, 'utf-8');
  await vscode.workspace.fs.writeFile(uri, bytes);
}

async function ensureParentDirectory(fileUri: vscode.Uri): Promise<void> {
  const parentPath = path.posix.dirname(fileUri.path);
  if (!parentPath || parentPath === fileUri.path) {
    return;
  }

  await vscode.workspace.fs.createDirectory(fileUri.with({ path: parentPath }));
}

function buildSummary(installed: string[], skipped: string[]): string {
  const parts: string[] = [];
  if (installed.length > 0) {
    parts.push(`Installed: ${installed.join(', ')}`);
  }
  if (skipped.length > 0) {
    parts.push(`Skipped: ${skipped.join(', ')}`);
  }
  return `SideBrowser AI Prompt: ${parts.join(' | ')}`;
}
