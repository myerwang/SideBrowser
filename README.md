# SideBrowser

<p align="center">
  <img src="./preview.png" alt="SideBrowser preview" width="960" />
</p>

**English** | [中文](#中文) | [日本語](#日本語)

---

## English

> Open test pages beside your code — in the same VS Code window.

SideBrowser is a VS Code extension built for **AI-assisted frontend development**. It lets you preview `localhost`, `127.0.0.1`, local `.html` files, and `.link` targets inside a side panel — no window switching needed.

### AI Prompt — Make It Permanent

The core value of SideBrowser is that your AI assistant **automatically** opens dev-server URLs in a side panel. To enable this, the AI needs a prompt rule — and you only need to set it up **once**.

#### One-Command Setup (Recommended)

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) → type **"SideBrowser: Setup AI Prompt"** → select language and AI tools.

The command auto-creates the correct rule file for each AI tool in your workspace:

| AI Tool | File Created | Persistence |
|---------|-------------|-------------|
| **GitHub Copilot** | `.github/copilot-instructions.md` | Auto-loaded per workspace |
| **Cline** | `.clinerules/sidebrowser.md` | Auto-loaded per workspace |
| **Cursor** | `.cursor/rules/sidebrowser.mdc` | `alwaysApply: true` frontmatter |
| **Windsurf** | `.windsurf/rules/sidebrowser.md` | Auto-loaded per workspace |
| **Continue** | `.continue/rules/sidebrowser.md` | Auto-loaded per workspace |
| **Gemini CLI** | `.gemini/settings.json` | `systemInstruction` field |

> **Tip:** Commit these rule files to Git so every team member gets the same setup.

#### Manual Setup

If you prefer to set up the prompt manually, paste the following into your AI assistant's system prompt or rules file:

```text
This VS Code window has the SideBrowser extension installed.
Whenever you start a local dev server (npm run dev, npx serve, python -m http.server, etc.)
and obtain a local URL, you MUST immediately open that URL in SideBrowser within the SAME step.
Do NOT wait for me to ask. Do NOT open a separate browser window or a new VS Code window.

How to open (macOS/Linux):
  code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=<percent-encoded-URL>"

How to open (Windows):
  code.cmd --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=<percent-encoded-URL>"

Workflow (single step):
1. Start the dev server.
2. Read the local URL from the server output (e.g. http://localhost:5173).
3. Immediately run the code/code.cmd command above with that URL.

Examples:
- Vite  → code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"
- Express → code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A3000"
- HTML file → code --open-url "vscode://YohjiUbun.sidebrowser/openPath?path=%2Fabsolute%2Fpath%2Fto%2Ffile.html"
```

<details>
<summary>Where to paste (by AI tool)</summary>

| AI Tool | Location |
|---------|----------|
| **GitHub Copilot** | `.github/copilot-instructions.md` |
| **Cline** | `.clinerules/sidebrowser.md` or Settings → Custom Instructions |
| **Cursor** | `.cursor/rules/sidebrowser.mdc` (add `alwaysApply: true` frontmatter) |
| **Windsurf** | `.windsurf/rules/sidebrowser.md` or Customizations panel |
| **Continue** | `.continue/rules/sidebrowser.md` |
| **Gemini CLI** | `.gemini/settings.json` → `"systemInstruction"` field |
| **Gemini Code Assist** | VS Code Settings → Gemini Code Assist → Rules |
| **Other** | Paste into system prompt / custom instructions |

</details>

### Commands

| Command | Description |
|---------|------------|
| `SideBrowser: Open in SideBrowser` | Right-click a file in Explorer to open it in the side panel |
| `SideBrowser: Open URL in SideBrowser` | Open any URL via the command palette |
| `SideBrowser: Refresh SideBrowser` | Reload the current page |
| `SideBrowser: Open in External Browser` | Open the current page in your system browser |
| `SideBrowser: Setup AI Prompt` | Install AI prompt rules for all major AI coding assistants |
| `SideBrowser: New Link File` | Create a new `.link` file to bookmark a URL |

### URI Handler

External tools (including AI agents) can open pages programmatically:

| Action | URI Pattern |
|--------|------------|
| Open URL | `vscode://YohjiUbun.sidebrowser/openUrl?url=<percent-encoded-URL>` |
| Open local file | `vscode://YohjiUbun.sidebrowser/openPath?path=<percent-encoded-absolute-path>` |

```bash
# macOS / Linux
code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"

# Windows
code.cmd --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"
```

### Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `linkView.externalBrowser.kind` | string | `system` | Browser for "Open in External Browser": `system` / `edge` / `chrome` / `firefox` / `safari` / `custom` |
| `linkView.externalBrowser.customPath` | string | `""` | Executable path when kind is `custom` |
| `linkView.externalBrowser.customArgs` | string[] | `[]` | Extra arguments for the custom browser |

---

## 中文

> 在同一个 VS Code 窗口中，将测试页面打开在代码旁边。

SideBrowser 是一个专为 **AI 辅助前端开发** 设计的 VS Code 扩展。它可以在侧边面板中预览 `localhost`、`127.0.0.1`、本地 `.html` 文件和 `.link` 目标，无需切换窗口。

### AI 提示词 — 一次设置，永久生效

SideBrowser 的核心价值在于让 AI 助手在启动开发服务器后 **自动** 在侧边面板打开页面。要启用此功能，AI 需要一条提示词规则 — 你只需设置 **一次**。

#### 一键安装（推荐）

按 `Ctrl+Shift+P`（macOS 为 `Cmd+Shift+P`）→ 输入 **"SideBrowser: Setup AI Prompt"** → 选择语言和 AI 工具。

该命令会自动在你的工作区中创建对应 AI 工具的规则文件：

| AI 工具 | 创建的文件 | 持久化方式 |
|---------|-----------|-----------|
| **GitHub Copilot** | `.github/copilot-instructions.md` | 工作区自动加载 |
| **Cline** | `.clinerules/sidebrowser.md` | 工作区自动加载 |
| **Cursor** | `.cursor/rules/sidebrowser.mdc` | `alwaysApply: true` 前置声明 |
| **Windsurf** | `.windsurf/rules/sidebrowser.md` | 工作区自动加载 |
| **Continue** | `.continue/rules/sidebrowser.md` | 工作区自动加载 |
| **Gemini CLI** | `.gemini/settings.json` | `systemInstruction` 字段 |

> **提示：** 将这些规则文件提交到 Git，团队成员 clone 后即自动生效。

#### 手动设置

如果你更喜欢手动操作，将以下提示词粘贴到 AI 助手的系统提示或规则文件中：

```text
当前 VS Code 窗口已安装 SideBrowser 扩展。
当你启动本地开发服务器（npm run dev、npx serve、python -m http.server 等）并获得本地 URL 后，
必须在同一步骤内立即用 SideBrowser 打开该 URL。
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
- Vite  → code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"
- Express → code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A3000"
- HTML 文件 → code --open-url "vscode://YohjiUbun.sidebrowser/openPath?path=%2Fabsolute%2Fpath%2Fto%2Ffile.html"
```

<details>
<summary>粘贴位置（按 AI 工具）</summary>

| AI 工具 | 粘贴位置 |
|---------|---------|
| **GitHub Copilot** | `.github/copilot-instructions.md` |
| **Cline** | `.clinerules/sidebrowser.md` 或设置 → 自定义指令 |
| **Cursor** | `.cursor/rules/sidebrowser.mdc`（添加 `alwaysApply: true` 前置声明） |
| **Windsurf** | `.windsurf/rules/sidebrowser.md` 或自定义面板 |
| **Continue** | `.continue/rules/sidebrowser.md` |
| **Gemini CLI** | `.gemini/settings.json` → `"systemInstruction"` 字段 |
| **Gemini Code Assist** | VS Code 设置 → Gemini Code Assist → Rules |
| **其他** | 粘贴到系统提示词 / 自定义指令中 |

</details>

### 命令

| 命令 | 说明 |
|------|------|
| `SideBrowser: Open in SideBrowser` | 在资源管理器中右键文件，在侧边面板打开 |
| `SideBrowser: Open URL in SideBrowser` | 通过命令面板打开任意 URL |
| `SideBrowser: Refresh SideBrowser` | 刷新当前页面 |
| `SideBrowser: Open in External Browser` | 在系统浏览器中打开当前页面 |
| `SideBrowser: Setup AI Prompt` | 为主流 AI 编码助手安装提示词规则 |
| `SideBrowser: New Link File` | 创建 `.link` 文件以收藏 URL |

### URI Handler

外部工具（包括 AI 代理）可以通过编程方式打开页面：

| 操作 | URI 格式 |
|------|---------|
| 打开 URL | `vscode://YohjiUbun.sidebrowser/openUrl?url=<百分号编码的URL>` |
| 打开本地文件 | `vscode://YohjiUbun.sidebrowser/openPath?path=<百分号编码的绝对路径>` |

```bash
# macOS / Linux
code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"

# Windows
code.cmd --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"
```

### 配置项

| 设置项 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| `linkView.externalBrowser.kind` | string | `system` | "在外部浏览器中打开"使用的浏览器：`system` / `edge` / `chrome` / `firefox` / `safari` / `custom` |
| `linkView.externalBrowser.customPath` | string | `""` | kind 为 `custom` 时的浏览器可执行文件路径 |
| `linkView.externalBrowser.customArgs` | string[] | `[]` | 自定义浏览器的额外启动参数 |

---

## 日本語

> コードの隣にテストページを開く — 同じ VS Code ウィンドウ内で。

SideBrowser は **AI アシスト付きフロントエンド開発** 向けの VS Code 拡張機能です。`localhost`、`127.0.0.1`、ローカル `.html` ファイル、`.link` ターゲットをサイドパネルでプレビューでき、ウィンドウの切り替えが不要になります。

### AI プロンプト — 一度設定すれば永続的に有効

SideBrowser の核心的な価値は、AI アシスタントが開発サーバー起動後に **自動的に** サイドパネルで URL を開くことです。この機能を有効にするには、AI にプロンプトルールが必要です — 設定は **一度だけ** です。

#### ワンコマンドセットアップ（推奨）

`Ctrl+Shift+P`（macOS は `Cmd+Shift+P`）→ **"SideBrowser: Setup AI Prompt"** と入力 → 言語と AI ツールを選択。

コマンドがワークスペース内に各 AI ツール用のルールファイルを自動作成します：

| AI ツール | 作成されるファイル | 永続化方式 |
|----------|-----------------|-----------|
| **GitHub Copilot** | `.github/copilot-instructions.md` | ワークスペース自動読込 |
| **Cline** | `.clinerules/sidebrowser.md` | ワークスペース自動読込 |
| **Cursor** | `.cursor/rules/sidebrowser.mdc` | `alwaysApply: true` フロントマター |
| **Windsurf** | `.windsurf/rules/sidebrowser.md` | ワークスペース自動読込 |
| **Continue** | `.continue/rules/sidebrowser.md` | ワークスペース自動読込 |
| **Gemini CLI** | `.gemini/settings.json` | `systemInstruction` フィールド |

> **ヒント：** これらのルールファイルを Git にコミットすれば、チームメンバーも clone 後すぐに同じ設定が有効になります。

#### 手動セットアップ

手動で設定したい場合は、以下のプロンプトを AI アシスタントのシステムプロンプトまたはルールファイルに貼り付けてください：

```text
この VS Code ウィンドウには SideBrowser 拡張がインストールされています。
ローカル開発サーバー（npm run dev、npx serve、python -m http.server など）を起動してローカル URL を取得したら、
同じステップ内で即座に SideBrowser でその URL を開いてください。
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
- Vite  → code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"
- Express → code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A3000"
- HTML → code --open-url "vscode://YohjiUbun.sidebrowser/openPath?path=%2Fabsolute%2Fpath%2Fto%2Ffile.html"
```

<details>
<summary>貼り付け先（AI ツール別）</summary>

| AI ツール | 貼り付け先 |
|----------|-----------|
| **GitHub Copilot** | `.github/copilot-instructions.md` |
| **Cline** | `.clinerules/sidebrowser.md` または設定 → カスタム指示 |
| **Cursor** | `.cursor/rules/sidebrowser.mdc`（`alwaysApply: true` フロントマターを追加） |
| **Windsurf** | `.windsurf/rules/sidebrowser.md` またはカスタマイズパネル |
| **Continue** | `.continue/rules/sidebrowser.md` |
| **Gemini CLI** | `.gemini/settings.json` → `"systemInstruction"` フィールド |
| **Gemini Code Assist** | VS Code 設定 → Gemini Code Assist → Rules |
| **その他** | システムプロンプト / カスタム指示に貼り付け |

</details>

### コマンド

| コマンド | 説明 |
|---------|------|
| `SideBrowser: Open in SideBrowser` | エクスプローラーでファイルを右クリックしてサイドパネルで開く |
| `SideBrowser: Open URL in SideBrowser` | コマンドパレットから任意の URL を開く |
| `SideBrowser: Refresh SideBrowser` | 現在のページをリロード |
| `SideBrowser: Open in External Browser` | 現在のページをシステムブラウザで開く |
| `SideBrowser: Setup AI Prompt` | 主要な AI コーディングアシスタント用のプロンプトルールをインストール |
| `SideBrowser: New Link File` | URL をブックマークする `.link` ファイルを作成 |

### URI ハンドラー

外部ツール（AI エージェントを含む）がプログラム的にページを開けます：

| 操作 | URI パターン |
|------|------------|
| URL を開く | `vscode://YohjiUbun.sidebrowser/openUrl?url=<パーセントエンコードされたURL>` |
| ローカルファイルを開く | `vscode://YohjiUbun.sidebrowser/openPath?path=<パーセントエンコードされた絶対パス>` |

```bash
# macOS / Linux
code --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"

# Windows
code.cmd --open-url "vscode://YohjiUbun.sidebrowser/openUrl?url=http%3A%2F%2Flocalhost%3A5173%2F"
```

### 設定

| 設定項目 | 型 | デフォルト | 説明 |
|---------|------|---------|------|
| `linkView.externalBrowser.kind` | string | `system` | 「外部ブラウザで開く」で使用するブラウザ：`system` / `edge` / `chrome` / `firefox` / `safari` / `custom` |
| `linkView.externalBrowser.customPath` | string | `""` | kind が `custom` の場合のブラウザ実行ファイルパス |
| `linkView.externalBrowser.customArgs` | string[] | `[]` | カスタムブラウザの追加引数 |

---

## License

[MIT](./LICENSE)
