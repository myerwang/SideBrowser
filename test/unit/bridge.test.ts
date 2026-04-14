import assert from 'node:assert/strict';
import { getExternalBridgePaths } from '../../src/utils/bridge';

export function runBridgeTests(): void {
  const first = getExternalBridgePaths(101, '/tmp/sidebrowser-tests');
  const second = getExternalBridgePaths(202, '/tmp/sidebrowser-tests');

  assert.equal(first.rootDir, second.rootDir);
  assert.notEqual(first.instanceDir, second.instanceDir);
  assert.match(first.requestFile, /101[\\/]request\.json$/);
  assert.match(second.statusFile, /202[\\/]status\.json$/);
}
