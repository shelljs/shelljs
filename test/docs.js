const test = require('ava');

const gendocs = require('../scripts/generate-docs');

test('Documentation generation', t => {
  if (gendocs.extractCurrentDocs() === gendocs.generateNewDocs()) {
    t.pass();
  } else {
    t.fail('README documentation is stale. Please run `npm run gendocs`.');
  }
});
