<#
.SYNOPSIS
  Install SideBrowser AI prompts into your workspace for all supported AI coding assistants.

.DESCRIPTION
  This script creates the necessary rule/instruction files so that your AI assistant
  will persistently auto-open dev-server URLs in SideBrowser. Supports:
    - GitHub Copilot   (.github/copilot-instructions.md)
    - Cline            (.clinerules/sidebrowser.md)
    - Cursor           (.cursor/rules/sidebrowser.mdc)
    - Windsurf         (.windsurf/rules/sidebrowser.md)
    - Continue         (.continue/rules/sidebrowser.md)
    - Codex            (AGENTS.md)
    - Gemini CLI       (.gemini/settings.json — style/rules append)

.PARAMETER WorkspacePath
  Root directory of the target workspace. Defaults to the current directory.

.PARAMETER Lang
  Language for the prompt content: 'en', 'zh', or 'ja'. Default: 'en'.

.PARAMETER Targets
  Comma-separated list of targets to install. Use 'all' to install all.
  Valid values: copilot, cline, cursor, windsurf, continue, codex, gemini, all.
  Default: 'all'.

.EXAMPLE
  .\install-prompts.ps1
  .\install-prompts.ps1 -Lang zh
  .\install-prompts.ps1 -Lang ja -Targets copilot,cline
  .\install-prompts.ps1 -WorkspacePath "C:\Projects\my-app" -Targets cursor
#>

param(
    [string]$WorkspacePath = (Get-Location).Path,
    [ValidateSet('en', 'zh', 'ja')]
    [string]$Lang = 'en',
    [string]$Targets = 'all'
)

# ─── Prompt Content ──────────────────────────────────────────────────────────

$PromptEN = @"
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
"@

$PromptZH = @"
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
"@

$PromptJA = @"
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
"@

# ─── Select prompt by language ───────────────────────────────────────────────

$Prompt = switch ($Lang) {
    'zh' { $PromptZH }
    'ja' { $PromptJA }
    default { $PromptEN }
}

# ─── Determine targets ───────────────────────────────────────────────────────

$AllTargets = @('copilot', 'cline', 'cursor', 'windsurf', 'continue', 'codex', 'gemini')
if ($Targets -eq 'all') {
    $SelectedTargets = $AllTargets
} else {
    $SelectedTargets = $Targets -split ',' | ForEach-Object { $_.Trim().ToLower() }
}

$Installed = @()
$Skipped   = @()

# ─── Helper: Write file with directory creation ──────────────────────────────

function Write-PromptFile {
    param([string]$RelPath, [string]$Content)
    $FullPath = Join-Path $WorkspacePath $RelPath
    $Dir = Split-Path $FullPath -Parent
    if (-not (Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
    }
    Set-Content -Path $FullPath -Value $Content -Encoding UTF8
    return $FullPath
}

# ─── GitHub Copilot ──────────────────────────────────────────────────────────

if ($SelectedTargets -contains 'copilot') {
    $CopilotPath = ".github/copilot-instructions.md"
    $FullPath = Join-Path $WorkspacePath $CopilotPath
    if (Test-Path $FullPath) {
        $Existing = Get-Content $FullPath -Raw -ErrorAction SilentlyContinue
        if ($Existing -match 'SideBrowser') {
            $Skipped += "Copilot (already contains SideBrowser rules)"
        } else {
            Add-Content -Path $FullPath -Value "`n`n$Prompt" -Encoding UTF8
            $Installed += "Copilot  -> $CopilotPath (appended)"
        }
    } else {
        Write-PromptFile $CopilotPath $Prompt | Out-Null
        $Installed += "Copilot  -> $CopilotPath (created)"
    }
}

# ─── Cline ───────────────────────────────────────────────────────────────────

if ($SelectedTargets -contains 'cline') {
    $ClinePath = ".clinerules/sidebrowser.md"
    $Result = Write-PromptFile $ClinePath $Prompt
    $Installed += "Cline    -> $ClinePath"
}

# ─── Cursor ──────────────────────────────────────────────────────────────────

if ($SelectedTargets -contains 'cursor') {
    # Cursor uses .mdc files with optional frontmatter
    $CursorContent = @"
---
description: SideBrowser auto-open rule — open dev server URLs in SideBrowser
globs:
alwaysApply: true
---

$Prompt
"@
    $CursorPath = ".cursor/rules/sidebrowser.mdc"
    Write-PromptFile $CursorPath $CursorContent | Out-Null
    $Installed += "Cursor   -> $CursorPath"
}

# ─── Windsurf ────────────────────────────────────────────────────────────────

if ($SelectedTargets -contains 'windsurf') {
    $WindsurfPath = ".windsurf/rules/sidebrowser.md"
    Write-PromptFile $WindsurfPath $Prompt | Out-Null
    $Installed += "Windsurf -> $WindsurfPath"
}

# ─── Continue ────────────────────────────────────────────────────────────────

if ($SelectedTargets -contains 'continue') {
    $ContinuePath = ".continue/rules/sidebrowser.md"
    Write-PromptFile $ContinuePath $Prompt | Out-Null
    $Installed += "Continue -> $ContinuePath"
}

# ─── Codex ───────────────────────────────────────────────────────────────────

if ($SelectedTargets -contains 'codex') {
    $CodexPath = "AGENTS.md"
    $FullPath = Join-Path $WorkspacePath $CodexPath
    if (Test-Path $FullPath) {
        $Existing = Get-Content $FullPath -Raw -ErrorAction SilentlyContinue
        if ($Existing -match 'SideBrowser') {
            $Skipped += "Codex (already contains SideBrowser rules)"
        } else {
            Add-Content -Path $FullPath -Value "`n`n$Prompt" -Encoding UTF8
            $Installed += "Codex    -> $CodexPath (appended)"
        }
    } else {
        Write-PromptFile $CodexPath $Prompt | Out-Null
        $Installed += "Codex    -> $CodexPath (created)"
    }
}

# ─── Gemini CLI ──────────────────────────────────────────────────────────────

if ($SelectedTargets -contains 'gemini') {
    $GeminiDir  = Join-Path $WorkspacePath ".gemini"
    $GeminiFile = Join-Path $GeminiDir "settings.json"
    if (-not (Test-Path $GeminiDir)) {
        New-Item -ItemType Directory -Path $GeminiDir -Force | Out-Null
    }

    # Flatten prompt to a single line for JSON
    $FlatPrompt = ($Prompt -replace "`r`n", "\n" -replace "`n", "\n")

    if (Test-Path $GeminiFile) {
        $Existing = Get-Content $GeminiFile -Raw -ErrorAction SilentlyContinue
        if ($Existing -match 'SideBrowser') {
            $Skipped += "Gemini CLI (already contains SideBrowser rules)"
        } else {
            # Try to merge into existing settings.json
            try {
                $json = $Existing | ConvertFrom-Json
                if (-not $json.systemInstruction) {
                    $json | Add-Member -NotePropertyName "systemInstruction" -NotePropertyValue $FlatPrompt
                } else {
                    $json.systemInstruction += "\n\n$FlatPrompt"
                }
                $json | ConvertTo-Json -Depth 10 | Set-Content $GeminiFile -Encoding UTF8
                $Installed += "Gemini   -> .gemini/settings.json (merged)"
            } catch {
                $Skipped += "Gemini CLI (failed to parse existing settings.json)"
            }
        }
    } else {
        $GeminiJson = @{
            systemInstruction = $FlatPrompt
        } | ConvertTo-Json -Depth 10
        Set-Content -Path $GeminiFile -Value $GeminiJson -Encoding UTF8
        $Installed += "Gemini   -> .gemini/settings.json (created)"
    }
}

# ─── Summary ─────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SideBrowser Prompt Installer" -ForegroundColor Cyan
Write-Host "  Language: $Lang | Workspace: $WorkspacePath" -ForegroundColor DarkGray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($Installed.Count -gt 0) {
    Write-Host "  Installed:" -ForegroundColor Green
    foreach ($item in $Installed) {
        Write-Host "    [+] $item" -ForegroundColor Green
    }
}

if ($Skipped.Count -gt 0) {
    Write-Host ""
    Write-Host "  Skipped:" -ForegroundColor Yellow
    foreach ($item in $Skipped) {
        Write-Host "    [-] $item" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "  Done! Your AI assistant will now auto-open dev URLs in SideBrowser." -ForegroundColor Cyan
Write-Host ""
