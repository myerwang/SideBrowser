import assert from 'node:assert/strict';
import { inspectEmbeddingHeaders } from '../../src/utils/embedding';

export function runEmbeddingTests(): void {
  const deniedHeaders = new Headers({
    'x-frame-options': 'deny'
  });
  const deniedResult = inspectEmbeddingHeaders(deniedHeaders);
  assert.ok(deniedResult);
  assert.equal(deniedResult?.canEmbed, false);
  assert.equal(deniedResult?.blockedBy, 'x-frame-options');
  assert.match(deniedResult?.reason ?? '', /X-Frame-Options: deny/i);

  const cspHeaders = new Headers({
    'content-security-policy': "default-src 'self'; frame-ancestors 'self' https://example.com"
  });
  const cspResult = inspectEmbeddingHeaders(cspHeaders);
  assert.ok(cspResult);
  assert.equal(cspResult?.canEmbed, false);
  assert.equal(cspResult?.blockedBy, 'csp-frame-ancestors');
  assert.match(cspResult?.reason ?? '', /frame-ancestors 'self' https:\/\/example\.com/i);

  const allowedHeaders = new Headers({
    'content-security-policy': "default-src 'self'; frame-ancestors *"
  });
  assert.equal(inspectEmbeddingHeaders(allowedHeaders), undefined);
}
