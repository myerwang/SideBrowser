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
