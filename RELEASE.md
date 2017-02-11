# Release steps

1. Ensure master passes CI tests
2. Bump version, create tags, push, and release:
  - `$ npm run <release:major|release:minor|release:patch>`
  - `major` - breaking API changes
  - `minor` - backwards-compatible features
  - `patch` - backwards-compatible bug fixes
3. Update `CHANGELOG.md`
  - `$ npm run changelog`
  - Manually verify that the changelog makes sense
  - `$ git push`
4. Generate the documentup website by visiting
  http://documentup.com/shelljs/shelljs/__recompile in your browser
