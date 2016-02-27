# Release steps

* Ensure master passes CI tests
* Bump version in package.json. Any breaking change or new feature should bump
  minor (or even major). Non-breaking changes or fixes can just bump patch.
* Update README manually if the changes are not documented in-code. Run
  `scripts/generate-docs.js` just to be safe
* Commit
* `$ git tag <version>` (see `git tag -l` for latest)
* `$ git push origin master --tags`
* `$ npm publish .`
* Generate the documentup website by visiting
  [http://documentup.com/shelljs/shelljs/__recompile] in your browser
