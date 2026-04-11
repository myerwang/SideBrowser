import * as path from 'path';
import * as vscode from 'vscode';

const DEFAULT_LINK_TEMPLATE = 'http://localhost:3000\n';

export function registerNewLinkFileCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('linkView.newLinkFile', async (target?: unknown) => {
      await createNewLinkFile(target);
    })
  );
}

async function createNewLinkFile(target?: unknown): Promise<void> {
  const targetFolder = await resolveTargetFolder(target);
  const untitledUri = buildUntitledLinkUri(targetFolder);
  const document = await vscode.workspace.openTextDocument(untitledUri);
  const editor = await vscode.window.showTextDocument(document, {
    preview: false
  });

  if (document.getText().length === 0) {
    await editor.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(0, 0), DEFAULT_LINK_TEMPLATE);
    });
  }

  await vscode.languages.setTextDocumentLanguage(document, 'linkview-link');

  const action = await vscode.window.showInformationMessage(
    'SideBrowser created a new template. Save it as a .link file when you are ready.',
    'Save As...'
  );

  if (action === 'Save As...') {
    await vscode.commands.executeCommand('workbench.action.files.saveAs');
  }
}

async function resolveTargetFolder(target?: unknown): Promise<vscode.Uri | undefined> {
  const resource = target instanceof vscode.Uri ? target : undefined;
  if (resource) {
    if (resource.scheme === 'file') {
      try {
        const stat = await vscode.workspace.fs.stat(resource);
        if (stat.type & vscode.FileType.Directory) {
          return resource;
        }
      } catch {
        return vscode.Uri.file(path.dirname(resource.fsPath));
      }

      return vscode.Uri.file(path.dirname(resource.fsPath));
    }

    return resource;
  }

  return vscode.workspace.workspaceFolders?.[0]?.uri;
}

function buildUntitledLinkUri(targetFolder?: vscode.Uri): vscode.Uri {
  if (targetFolder?.scheme === 'file') {
    return vscode.Uri.file(path.join(targetFolder.fsPath, 'new.link')).with({
      scheme: 'untitled'
    });
  }

  return vscode.Uri.parse('untitled:preview.link');
}
