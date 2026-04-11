import assert from 'node:assert/strict';
import {
  isLinkFilePath,
  isSupportedImageFilePath,
  isSupportedMarkdownFilePath,
  isSupportedMediaFilePath,
  isSupportedNotebookFilePath,
  isSupportedPdfFilePath,
  isSupportedWebFilePath,
  parseLinkFileContent,
  pickDefaultLinkFileName,
  pickDefaultPreviewFileName
} from '../../src/utils/linkFile';

export function runLinkFileTests(): void {
  const result = parseLinkFileContent('\uFEFF  \n  http://localhost:3000  \n\n', 'sample.link');
  assert.equal(result.url, 'http://localhost:3000/');
  assert.equal(result.raw, 'http://localhost:3000');

  const firstLineResult = parseLinkFileContent(
    '\nhttps://example.com\nhttps://ignored.example.com\n',
    'sample.link'
  );
  assert.equal(firstLineResult.url, 'https://example.com/');

  assert.throws(() => parseLinkFileContent(' \n\t\n', 'empty.link'), /empty/);

  assert.equal(isLinkFilePath('preview.link'), true);
  assert.equal(isLinkFilePath('preview.txt'), false);
  assert.equal(isSupportedWebFilePath('preview.html'), true);
  assert.equal(isSupportedWebFilePath('preview.HTM'), true);
  assert.equal(isSupportedWebFilePath('preview.md'), false);
  assert.equal(isSupportedMarkdownFilePath('README.md'), true);
  assert.equal(isSupportedMarkdownFilePath('guide.markdown'), true);
  assert.equal(isSupportedMarkdownFilePath('guide.txt'), false);
  assert.equal(isSupportedPdfFilePath('book.pdf'), true);
  assert.equal(isSupportedPdfFilePath('book.PDF'), true);
  assert.equal(isSupportedPdfFilePath('book.png'), false);
  assert.equal(isSupportedImageFilePath('cover.png'), true);
  assert.equal(isSupportedImageFilePath('cover.SVG'), true);
  assert.equal(isSupportedImageFilePath('cover.mp4'), false);
  assert.equal(isSupportedMediaFilePath('clip.mp4'), true);
  assert.equal(isSupportedMediaFilePath('clip.MP3'), true);
  assert.equal(isSupportedMediaFilePath('clip.png'), false);
  assert.equal(isSupportedNotebookFilePath('analysis.ipynb'), true);
  assert.equal(isSupportedNotebookFilePath('analysis.md'), false);

  assert.equal(
    pickDefaultLinkFileName(['README.md', 'preview.link', 'app.js']),
    'preview.link'
  );
  assert.equal(pickDefaultLinkFileName(['README.md', 'demo.link']), 'demo.link');
  assert.equal(
    pickDefaultLinkFileName(['first.link', 'second.link', 'README.md']),
    undefined
  );

  assert.equal(
    pickDefaultPreviewFileName(['README.md', 'Index.html', 'app.js']),
    'Index.html'
  );
  assert.equal(pickDefaultPreviewFileName(['README.md', 'app.js']), undefined);
}
