# Contributing

## Filing a bug report

We love to receive bug reports (we're always trying to make ShellJS more
stable). If you've found a bug, please follow these steps:

 - Search for any issues that may have been created already. We often receive
   duplicates, and cutting down on this is helpful. If someone else has already
   reported it, please ping that issue thread.
 - Let us know your version of NodeJS (`node -v`), your version of ShellJS (from
   `package.json`), your OS, and any other useful information.
 - Give an example ShellJS command to reproduce the error.

## Pull requests

PRs are welcome! However, we ask that you follow a few guidelines:

 - Please add tests for all changes/new features.
 - Make sure your code passes `npm test`. Please check the CI (both Appveyor and
   Travis). If you can't figure out why something doesn't work, feel free to ask
   for help.
 - Make changes to the documentation *within the source files*, not in the
   README. Then update the README by running `node scripts/generate-docs.js`.
 - Please keep your PR up to date (either via rebase or by pressing the "update
   branch" button on Github).
