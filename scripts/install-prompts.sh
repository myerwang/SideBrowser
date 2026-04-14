#!/usr/bin/env bash
#
# install-prompts.sh — Install SideBrowser AI prompts for all supported AI assistants
#
# Usage:
#   ./install-prompts.sh                         # English, all targets
#   ./install-prompts.sh --lang zh               # Chinese
#   ./install-prompts.sh --lang ja --targets copilot,cline
#   ./install-prompts.sh --workspace /path/to/project --targets cursor

set -euo pipefail

WORKSPACE="$(pwd)"
LANG_OPT="en"
TARGETS="all"

# ─── Parse args ──────────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --workspace) WORKSPACE="$2"; shift 2 ;;
    --lang)      LANG_OPT="$2"; shift 2 ;;
    --targets)   TARGETS="$2";  shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--workspace <path>] [--lang en|zh|ja] [--targets copilot,cline,cursor,windsurf,continue,codex,gemini|all]"
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ─── Prompt content ──────────────────────────────────────────────────────────

PROMPT_EN=$(cat <<'EOF'
# SideBrowser — Auto-open Rule

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
  code --open-url "vscode://YohjiUbun.sidebrowser/openPath?path=%2Fabsolute%2Fpath%2Fto%2Ffile.html"
EOF
)

PROMPT_ZH=$(cat <<'EOF'
# SideBrowser — 自动打开规则

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
  code --open-url "vscode://YohjiUbun.sidebrowser/openPath?path=%2Fabsolute%2Fpath%2Fto%2Ffile.html"
EOF
)

PROMPT_JA=$(cat <<'EOF'
# SideBrowser — 自動オープンルール

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
  code --open-url "vscode://YohjiUbun.sidebrowser/openPath?path=%2Fabsolute%2Fpath%2Fto%2Ffile.html"
EOF
)

# ─── Select prompt ───────────────────────────────────────────────────────────

case "$LANG_OPT" in
  zh) PROMPT="$PROMPT_ZH" ;;
  ja) PROMPT="$PROMPT_JA" ;;
  *)  PROMPT="$PROMPT_EN" ;;
esac

# ─── Determine targets ──────────────────────────────────────────────────────

ALL_TARGETS="copilot cline cursor windsurf continue codex gemini"
if [[ "$TARGETS" == "all" ]]; then
  SELECTED=($ALL_TARGETS)
else
  IFS=',' read -ra SELECTED <<< "$TARGETS"
fi

INSTALLED=()
SKIPPED=()

# ─── Helper ──────────────────────────────────────────────────────────────────

write_prompt_file() {
  local rel="$1"
  local content="$2"
  local full="$WORKSPACE/$rel"
  mkdir -p "$(dirname "$full")"
  printf '%s\n' "$content" > "$full"
}

# ─── Install targets ────────────────────────────────────────────────────────

for target in "${SELECTED[@]}"; do
  target=$(echo "$target" | tr -d ' ' | tr '[:upper:]' '[:lower:]')

  case "$target" in
    copilot)
      FILE=".github/copilot-instructions.md"
      FULL="$WORKSPACE/$FILE"
      if [[ -f "$FULL" ]] && grep -q "SideBrowser" "$FULL"; then
        SKIPPED+=("Copilot (already contains SideBrowser rules)")
      elif [[ -f "$FULL" ]]; then
        printf '\n\n%s\n' "$PROMPT" >> "$FULL"
        INSTALLED+=("Copilot  -> $FILE (appended)")
      else
        write_prompt_file "$FILE" "$PROMPT"
        INSTALLED+=("Copilot  -> $FILE (created)")
      fi
      ;;

    cline)
      FILE=".clinerules/sidebrowser.md"
      write_prompt_file "$FILE" "$PROMPT"
      INSTALLED+=("Cline    -> $FILE")
      ;;

    cursor)
      HEADER="---
description: SideBrowser auto-open rule — open dev server URLs in SideBrowser
globs:
alwaysApply: true
---"
      FILE=".cursor/rules/sidebrowser.mdc"
      write_prompt_file "$FILE" "$HEADER

$PROMPT"
      INSTALLED+=("Cursor   -> $FILE")
      ;;

    windsurf)
      FILE=".windsurf/rules/sidebrowser.md"
      write_prompt_file "$FILE" "$PROMPT"
      INSTALLED+=("Windsurf -> $FILE")
      ;;

    continue)
      FILE=".continue/rules/sidebrowser.md"
      write_prompt_file "$FILE" "$PROMPT"
      INSTALLED+=("Continue -> $FILE")
      ;;

    codex)
      FILE="AGENTS.md"
      FULL="$WORKSPACE/$FILE"
      if [[ -f "$FULL" ]] && grep -q "SideBrowser" "$FULL"; then
        SKIPPED+=("Codex (already contains SideBrowser rules)")
      elif [[ -f "$FULL" ]]; then
        printf '\n\n%s\n' "$PROMPT" >> "$FULL"
        INSTALLED+=("Codex    -> $FILE (appended)")
      else
        write_prompt_file "$FILE" "$PROMPT"
        INSTALLED+=("Codex    -> $FILE (created)")
      fi
      ;;

    gemini)
      DIR="$WORKSPACE/.gemini"
      FILE="$DIR/settings.json"
      mkdir -p "$DIR"
      if [[ -f "$FILE" ]] && grep -q "SideBrowser" "$FILE"; then
        SKIPPED+=("Gemini CLI (already contains SideBrowser rules)")
      elif [[ -f "$FILE" ]]; then
        SKIPPED+=("Gemini CLI (existing settings.json — please add manually)")
      else
        # Escape prompt for JSON
        ESCAPED=$(printf '%s' "$PROMPT" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")
        printf '{\n  "systemInstruction": %s\n}\n' "$ESCAPED" > "$FILE"
        INSTALLED+=("Gemini   -> .gemini/settings.json (created)")
      fi
      ;;

    *)
      echo "Unknown target: $target"
      ;;
  esac
done

# ─── Summary ────────────────────────────────────────────────────────────────

echo ""
echo "========================================"
echo "  SideBrowser Prompt Installer"
echo "  Language: $LANG_OPT | Workspace: $WORKSPACE"
echo "========================================"
echo ""

if [[ ${#INSTALLED[@]} -gt 0 ]]; then
  echo "  Installed:"
  for item in "${INSTALLED[@]}"; do
    echo "    [+] $item"
  done
fi

if [[ ${#SKIPPED[@]} -gt 0 ]]; then
  echo ""
  echo "  Skipped:"
  for item in "${SKIPPED[@]}"; do
    echo "    [-] $item"
  done
fi

echo ""
echo "  Done! Your AI assistant will now auto-open dev URLs in SideBrowser."
echo ""
