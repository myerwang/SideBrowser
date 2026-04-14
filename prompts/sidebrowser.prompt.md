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
