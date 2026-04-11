import assert from 'node:assert/strict';
import { validateHttpUrl } from '../../src/utils/url';

export function runUrlTests(): void {
  assert.equal(validateHttpUrl('http://localhost:3000').ok, true);
  assert.equal(validateHttpUrl('https://example.com').ok, true);

  const result = validateHttpUrl('ftp://example.com');
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.message, /unsupported protocol/i);
  }

  const malformedResult = validateHttpUrl('not a url');
  assert.equal(malformedResult.ok, false);
  if (!malformedResult.ok) {
    assert.match(malformedResult.message, /valid URL/i);
  }
}
