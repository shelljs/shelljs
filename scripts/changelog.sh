#!/usr/bin/env bash

# Creates a changelog for the current build and puts it in the root
# Commits the changelog if it updated
# Does not push commit

run() {
  echo "...generating changelog (be patient)"

  curl -X POST -s "github-changelog-api.herokuapp.com/shelljs/shelljs" > CHANGELOG.md

  local changelog_was_updated=false
  for file in $(git ls-files --exclude-standard --modified --others); do
    [[ ${file} == "CHANGELOG.md" ]] && changelog_was_updated=true
  done

  if ${changelog_was_updated}; then
    echo "...committing updated changelog"
    local current_user=$(git config user.name || echo "unknown")
    git add CHANGELOG.md
    git commit -m "docs(changelog): updated by $current_user"
    echo "Done.  You can now 'git push' the updated changelog."
  else
    echo "CHANGELOG.md already up-to-date."
  fi
}

run
