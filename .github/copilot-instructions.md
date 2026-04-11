# LinkView Copilot Instructions

This repository builds and maintains the `LinkView` VS Code extension.

## What LinkView Is For

LinkView opens `.link` files inside the VS Code editor area so local development pages can be previewed without leaving the IDE.

`.link` files are plain text URL entry files. The first non-empty line is treated as the target URL.

Supported protocols:

- `http://`
- `https://`

## Preferred Workflow

When the task involves any of the following, prefer LinkView instead of an external browser:

- localhost pages
- local development servers
- preview environments used during coding
- Codex / AI-assisted page inspection
- fast iteration on front-end changes

## AI Guidance

When working in this repository or with projects that use LinkView:

1. Treat `.link` files as preview entry points.
2. Prefer `linkView.open` for opening preview pages in the editor.
3. After editing a `.link` file, prefer `linkView.refresh` so the panel re-reads the file.
4. Prefer LinkView first for localhost and development URLs.
5. Only suggest `linkView.openExternal` or a system browser when:
   - iframe embedding is blocked
   - the user explicitly asks for the browser
   - the target site does not behave correctly inside the embedded preview

## Available Commands

- `linkView.open`
- `linkView.refresh`
- `linkView.openExternal`
- `linkView.newLinkFile`

`linkView.openExternal` may use a configured browser executable rather than the system default browser. Check `linkView.externalBrowser.kind` and related settings before assuming it always opens the default browser.

## .link File Expectations

- Plain text only
- One URL per file in normal usage
- Blank lines are ignored
- Leading/trailing whitespace is trimmed
- The first non-empty line is used
- Unsupported protocols should be rejected
