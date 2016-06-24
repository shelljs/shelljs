# Release steps

1. Ensure master passes CI tests
2. `npm run gendocs`
3. Bump version, create tags, push, and release:
  - `$ npm run <release:major|release:minor|release:patch>`

    >`major` - breaking API changes
    >`minor` - backwards-compatible features
    >`patch` - backwards-compatible bug fixes
4. Update CHANGELOG.md
  - `$ npm run changelog`
  - `$ git push`
5. Generate the documentup website by visiting
  [http://documentup.com/shelljs/shelljs/__recompile] in your browser
