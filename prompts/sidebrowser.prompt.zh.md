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
