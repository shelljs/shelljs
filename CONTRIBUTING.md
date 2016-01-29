# Contributing
---

PRs are welcome! However, we ask that you follow a few guidelines:
- Please make sure to add tests for anything you add or change.
- Make sure your code passes both tests and linting, ***INCLUDING APPVEYOR AND TRAVIS*** (You can run the tests with `npm run test`).
- Any changes you make should be documented in-code via comments, and then the documentation should be generated via `node scripts/generate-docs.js`.

And we'd really appreciate it (although it's not necessarily mandatory) if you:
- Squash all your commits unless it's a fairly large PR or you have a good reason.
- If you've been working on your PR for a while, please rebase your changes off master.
