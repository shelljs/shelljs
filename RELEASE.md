# Release steps

1. Ensure master passes CI tests
1. Bump version:
  - `$ npm version <major|minor|patch>`

    >`major` - breaking API changes  
    >`minor` - backwards-compatible features  
    >`patch` - backwards-compatible bug fixes  
1. Update README manually if the changes are not documented in-code. Run
  `scripts/generate-docs.js` just to be safe
1. Update CHANGELOG.md
  - `$ npm run changelog`
  - `$ git push`
1. Push the bump commit, version tags, and publish
  - `$ git push`
  - `$ git push --tags`
  - `$ npm publish`
1. Generate the documentup website by visiting
  [http://documentup.com/shelljs/shelljs/__recompile] in your browser
