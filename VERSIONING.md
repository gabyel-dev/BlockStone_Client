# Client Versioning

This repository uses Semantic Versioning: MAJOR.MINOR.PATCH.

## Release commands

Run these in the client repository root:

- npm run version:patch
- npm run version:minor
- npm run version:major
- npm run version:set -- 2.3.0

These commands update version in package.json and package-lock.json, create a commit, and create a tag.

## CI trigger

Push the generated tag to trigger release validation workflow:

- git push origin main
- git push --tags

Workflow path in this repo:

- .github/workflows/release.yml
