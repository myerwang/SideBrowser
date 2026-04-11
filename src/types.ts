import * as vscode from 'vscode';
import type { EmbeddingCheckResult } from './utils/embedding';

export interface ManagedLinkViewPanel {
  baseReason?: string;
  baseWarning?: string;
  currentUrl: string;
  diagnosticLog: string[];
  lastErrorInfo?: string;
  readonly panel: vscode.WebviewPanel;
  readonly sourceUri: vscode.Uri;
}

export interface PanelSnapshot {
  readonly currentUrl: string;
  readonly previewSurface?:
    | 'linkview-webview'
    | 'native-browser'
    | 'markdown-preview'
    | 'pdf-preview'
    | 'image-preview'
    | 'media-preview'
    | 'notebook-preview';
  readonly sourceUri: vscode.Uri;
}

export interface WebviewRenderModel {
  readonly embedding: EmbeddingCheckResult;
  readonly url: string;
}

export type LinkViewWebviewMessage =
  | {
      readonly type: 'refresh';
    }
  | {
      readonly type: 'openExternal';
      readonly url?: string;
    }
  | {
      readonly type: 'copyUrl';
      readonly url?: string;
    }
  | {
      readonly text: string;
      readonly type: 'copyErrorInfo';
    }
  | {
      readonly level: 'info' | 'warn' | 'error';
      readonly message: string;
      readonly type: 'log';
    };

export interface LinkViewHostMessage {
  readonly text: string;
  readonly type: 'status';
}
