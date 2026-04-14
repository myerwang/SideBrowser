import { runBridgeTests } from './unit/bridge.test';
import { runEmbeddingTests } from './unit/embedding.test';
import { runLinkFileTests } from './unit/linkFile.test';
import { runUrlTests } from './unit/url.test';

function runSuite(name: string, runner: () => void): void {
  try {
    runner();
    console.log(`[pass] ${name}`);
  } catch (error) {
    console.error(`[fail] ${name}`);
    throw error;
  }
}

runSuite('bridge path isolation', runBridgeTests);
runSuite('embedding detection', runEmbeddingTests);
runSuite('link file parsing', runLinkFileTests);
runSuite('URL validation', runUrlTests);

console.log('All unit tests passed.');
