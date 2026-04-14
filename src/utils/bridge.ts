import * as os from 'node:os';
import * as path from 'node:path';

export interface ExternalBridgePaths {
  readonly instanceDir: string;
  readonly requestFile: string;
  readonly rootDir: string;
  readonly statusFile: string;
}

export function getExternalBridgePaths(
  processId = process.pid,
  tempDir = os.tmpdir()
): ExternalBridgePaths {
  const rootDir = path.join(tempDir, 'linkview-bridge');
  const instanceDir = path.join(rootDir, String(processId));

  return {
    instanceDir,
    requestFile: path.join(instanceDir, 'request.json'),
    rootDir,
    statusFile: path.join(instanceDir, 'status.json')
  };
}
