import * as path from 'path';
import { validateHttpUrl } from './url';

import type * as vscode from 'vscode';

export interface ResolvedPreviewSource {
  readonly kind: 'browser' | 'markdown' | 'pdf' | 'image' | 'media' | 'notebook';
  readonly label: string;
  readonly sourceUri: vscode.Uri;
  readonly url: string;
}

const SUPPORTED_WEB_FILE_EXTENSIONS = new Set(['.html', '.htm', '.xhtml', '.shtml']);
const SUPPORTED_MARKDOWN_FILE_EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.mkd']);
const SUPPORTED_PDF_FILE_EXTENSIONS = new Set(['.pdf']);
const SUPPORTED_IMAGE_FILE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.bmp',
  '.webp',
  '.svg',
  '.ico',
  '.avif',
  '.tif',
  '.tiff'
]);
const SUPPORTED_MEDIA_FILE_EXTENSIONS = new Set([
  '.mp3',
  '.wav',
  '.ogg',
  '.flac',
  '.m4a',
  '.aac',
  '.mp4',
  '.webm',
  '.ogv',
  '.mov'
]);
const SUPPORTED_NOTEBOOK_FILE_EXTENSIONS = new Set(['.ipynb']);
const DEFAULT_FOLDER_LINK_FILES = [
  'preview.link',
  'index.link',
  'default.link',
  'home.link'
] as const;
const DEFAULT_FOLDER_ENTRY_FILES = [
  'index.html',
  'index.htm',
  'default.html',
  'default.htm',
  'home.html',
  'home.htm'
] as const;

export async function readLinkFileUrl(fileUri: vscode.Uri): Promise<string> {
  const rawContent = await readLinkFileContent(fileUri);
  return parseLinkFileContent(rawContent, getLabel(fileUri)).url;
}

export async function resolvePreviewSource(targetUri: vscode.Uri): Promise<ResolvedPreviewSource> {
  if (targetUri.scheme === 'http' || targetUri.scheme === 'https') {
    return {
      kind: 'browser',
      label: targetUri.toString(true),
      sourceUri: targetUri,
      url: targetUri.toString(true)
    };
  }

  if (isLinkFileUri(targetUri)) {
    return {
      kind: 'browser',
      label: getLabel(targetUri),
      sourceUri: targetUri,
      url: await readLinkFileUrl(targetUri)
    };
  }

  const vscode = await import('vscode');
  const stat = await vscode.workspace.fs.stat(targetUri);

  if ((stat.type & vscode.FileType.Directory) !== 0) {
    return resolveFolderPreviewSource(targetUri);
  }

  if (isSupportedMarkdownFileUri(targetUri)) {
    return {
      kind: 'markdown',
      label: getLabel(targetUri),
      sourceUri: targetUri,
      url: targetUri.toString(true)
    };
  }

  if (isSupportedPdfFileUri(targetUri)) {
    return {
      kind: 'pdf',
      label: getLabel(targetUri),
      sourceUri: targetUri,
      url: targetUri.toString(true)
    };
  }

  if (isSupportedImageFileUri(targetUri)) {
    return {
      kind: 'image',
      label: getLabel(targetUri),
      sourceUri: targetUri,
      url: targetUri.toString(true)
    };
  }

  if (isSupportedMediaFileUri(targetUri)) {
    return {
      kind: 'media',
      label: getLabel(targetUri),
      sourceUri: targetUri,
      url: targetUri.toString(true)
    };
  }

  if (isSupportedNotebookFileUri(targetUri)) {
    return {
      kind: 'notebook',
      label: getLabel(targetUri),
      sourceUri: targetUri,
      url: targetUri.toString(true)
    };
  }

  if (isSupportedWebFileUri(targetUri)) {
    return {
      kind: 'browser',
      label: getLabel(targetUri),
      sourceUri: targetUri,
      url: targetUri.toString(true)
    };
  }

  throw new Error(
    `SideBrowser can open .link files, Markdown files (${[...SUPPORTED_MARKDOWN_FILE_EXTENSIONS].join(', ')}), PDF files (${[...SUPPORTED_PDF_FILE_EXTENSIONS].join(', ')}), image files (${[...SUPPORTED_IMAGE_FILE_EXTENSIONS].join(', ')}), media files (${[...SUPPORTED_MEDIA_FILE_EXTENSIONS].join(', ')}), notebook files (${[...SUPPORTED_NOTEBOOK_FILE_EXTENSIONS].join(', ')}), common web files (${[...SUPPORTED_WEB_FILE_EXTENSIONS].join(', ')}), or folders containing a .link file or default HTML entry.`
  );
}

export function parseLinkFileContent(
  content: string,
  label = 'file'
): {
  readonly raw: string;
  readonly url: string;
} {
  const sanitizedContent = content.replace(/^\uFEFF/, '');
  const nonEmptyLines = sanitizedContent
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (nonEmptyLines.length === 0) {
    throw new Error(`SideBrowser: ${label} is empty. Add a http:// or https:// URL.`);
  }

  const candidate = nonEmptyLines[0];
  const validation = validateHttpUrl(candidate);
  if (!validation.ok) {
    throw new Error(`SideBrowser: ${label} ${validation.message}`);
  }

  return {
    raw: candidate,
    url: validation.url
  };
}

export function isLinkFileUri(uri: { readonly path: string }): boolean {
  return isLinkFilePath(uri.path);
}

export function isLinkFilePath(filePath: string): boolean {
  return path.extname(filePath).toLowerCase() === '.link';
}

export function isSupportedWebFileUri(uri: { readonly path: string }): boolean {
  return isSupportedWebFilePath(uri.path);
}

export function isSupportedWebFilePath(filePath: string): boolean {
  return SUPPORTED_WEB_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function isSupportedMarkdownFileUri(uri: { readonly path: string }): boolean {
  return isSupportedMarkdownFilePath(uri.path);
}

export function isSupportedMarkdownFilePath(filePath: string): boolean {
  return SUPPORTED_MARKDOWN_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function isSupportedPdfFileUri(uri: { readonly path: string }): boolean {
  return isSupportedPdfFilePath(uri.path);
}

export function isSupportedPdfFilePath(filePath: string): boolean {
  return SUPPORTED_PDF_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function isSupportedImageFileUri(uri: { readonly path: string }): boolean {
  return isSupportedImageFilePath(uri.path);
}

export function isSupportedImageFilePath(filePath: string): boolean {
  return SUPPORTED_IMAGE_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function isSupportedMediaFileUri(uri: { readonly path: string }): boolean {
  return isSupportedMediaFilePath(uri.path);
}

export function isSupportedMediaFilePath(filePath: string): boolean {
  return SUPPORTED_MEDIA_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function isSupportedNotebookFileUri(uri: { readonly path: string }): boolean {
  return isSupportedNotebookFilePath(uri.path);
}

export function isSupportedNotebookFilePath(filePath: string): boolean {
  return SUPPORTED_NOTEBOOK_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function isSupportedPreviewFileUri(uri: { readonly path: string }): boolean {
  return (
    isLinkFileUri(uri) ||
    isSupportedWebFileUri(uri) ||
    isSupportedMarkdownFileUri(uri) ||
    isSupportedPdfFileUri(uri) ||
    isSupportedImageFileUri(uri) ||
    isSupportedMediaFileUri(uri) ||
    isSupportedNotebookFileUri(uri)
  );
}

export function pickDefaultPreviewFileName(candidateNames: readonly string[]): string | undefined {
  const normalizedCandidates = new Map(
    candidateNames.map((name) => [name.toLowerCase(), name] as const)
  );

  for (const fileName of DEFAULT_FOLDER_ENTRY_FILES) {
    const match = normalizedCandidates.get(fileName);
    if (match) {
      return match;
    }
  }

  return undefined;
}

export function pickDefaultLinkFileName(candidateNames: readonly string[]): string | undefined {
  const normalizedCandidates = new Map(
    candidateNames.map((name) => [name.toLowerCase(), name] as const)
  );

  for (const fileName of DEFAULT_FOLDER_LINK_FILES) {
    const match = normalizedCandidates.get(fileName);
    if (match) {
      return match;
    }
  }

  const linkFiles = candidateNames.filter((name) => isLinkFilePath(name));
  if (linkFiles.length === 1) {
    return linkFiles[0];
  }

  return undefined;
}

async function readLinkFileContent(fileUri: vscode.Uri): Promise<string> {
  const vscode = await import('vscode');
  const openDocument = vscode.workspace.textDocuments.find(
    (document) => document.uri.toString() === fileUri.toString()
  );

  if (openDocument) {
    return openDocument.getText();
  }

  const bytes = await vscode.workspace.fs.readFile(fileUri);
  return Buffer.from(bytes).toString('utf8');
}

function getLabel(fileUri: vscode.Uri): string {
  const baseName = path.basename(fileUri.path);
  return baseName || fileUri.toString();
}

async function resolveFolderPreviewSource(folderUri: vscode.Uri): Promise<ResolvedPreviewSource> {
  const vscode = await import('vscode');
  const entries = await vscode.workspace.fs.readDirectory(folderUri);
  const candidateNames = entries
    .filter((entry) => (entry[1] & vscode.FileType.File) !== 0)
    .map((entry) => entry[0]);
  const linkEntry = pickDefaultLinkFileName(candidateNames);

  if (linkEntry) {
    const entryUri = getChildUri(folderUri, linkEntry);
    return {
      kind: 'browser',
      label: `${getLabel(folderUri)} (${linkEntry})`,
      sourceUri: folderUri,
      url: await readLinkFileUrl(entryUri)
    };
  }

  const defaultEntry = pickDefaultPreviewFileName(candidateNames);

  if (!defaultEntry) {
    throw new Error(
      `SideBrowser: ${getLabel(folderUri)} does not contain a preview .link file or a default HTML entry. Add a .link file such as preview.link, or one of: ${DEFAULT_FOLDER_ENTRY_FILES.join(', ')}.`
    );
  }

  const entryUri = getChildUri(folderUri, defaultEntry);

  return {
    kind: 'browser',
    label: `${getLabel(folderUri)} (${defaultEntry})`,
    sourceUri: folderUri,
    url: entryUri.toString(true)
  };
}

function getChildUri(folderUri: vscode.Uri, childName: string): vscode.Uri {
  return folderUri.with({
    path: `${folderUri.path.replace(/\/$/, '')}/${childName}`
  });
}
