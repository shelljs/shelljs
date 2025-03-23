# Release steps

1. Ensure main branch passes CI tests
2. Bump version, create tags, push, and release:
  - `$ npm run <release:major|release:minor|release:patch>`
  - `major` - breaking API changes
  - `minor` - backwards-compatible features
  - `patch` - backwards-compatible bug fixes
3. Update `CHANGELOG.md`
  - `$ npm run changelog`
  - Manually verify that the changelog makes sense
  - `$ git push`
4. Update https://github.com/shelljs/shelljs/releases to create a new release
   from the latest git tag
