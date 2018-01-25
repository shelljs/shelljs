# Contributing

## Filing a bug report

We love to receive bug reports (we're always trying to make ShellJS more
stable). If you've found a bug, please follow these steps:

 - Please try to cut down on duplicates. Please search for issues which have
   already been reported (remember to search closed issues).
 - Please see [`ISSUE_TEMPLATE.md`](.github/ISSUE_TEMPLATE.md) for more
   information.

## Pull requests

PRs are welcome! However, we ask that you follow a few guidelines:

 - Please add tests for all changes/new features.
 - Make sure your code passes `npm test`. Please check the CI (both Appveyor and
   Travis). If you can't figure out why something doesn't work, feel free to ask
   for help.
 - Make sure you conform to our style guidelines. You can run `npm run lint` to
   check style, and `npm run lint -- --fix` to automatically fix some issues.
 - Make documentation changes *within the source files*, not in the README.
   Update the README with `npm run gendocs`.
 - Please keep your PR up to date (either via rebase or by pressing the "update
   branch" button on Github).
