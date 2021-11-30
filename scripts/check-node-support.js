#!/usr/bin/env node

var assert = require('assert');
var path = require('path');

var yaml = require('js-yaml');

var shell = require('..');

// This is the authoritative list of supported node versions.
var MIN_NODE_VERSION = 8;
var MAX_NODE_VERSION = 14;

function checkReadme(minNodeVersion) {
  var start = '<!-- start minVersion -->';
  var stop = '<!-- stop minVersion -->';
  var formattedMinVersion = '`v' + minNodeVersion + '`';
  var expectedReadmeRegex = new RegExp(
      start + '\\s*' + formattedMinVersion + '\\s*' + stop, ''
  );
  var readme = path.join(__dirname, '..', 'README.md');
  var match = shell.grep(expectedReadmeRegex, readme);
  if (!match.toString().trim()) {
    var msg = 'Update README to specify the min supported version. Look for "'
        + start + '"';
    throw new Error(msg);
  }
}

function checkEngines(minNodeVersion, package) {
  var expectedEnginesNode = '>=' + minNodeVersion;
  if (package.engines.node !== expectedEnginesNode) {
    var msg = 'Update package.json to fix the "engines" attribute';
    throw new Error(msg);
  }
}

function assertDeepEquals(arr1, arr2, msg) {
  try {
    assert.deepStrictEqual(arr1, arr2);
  } catch (e) {
    throw new Error(msg + '\n' + e);
  }
}

function range(start, stop) {
  var ret = [];
  for (var i = start; i <= stop; i++) {
    ret.push(i);
  }
  return ret;
}

function checkGithubActions(minNodeVersion, maxNodeVersion, githubActionsYaml) {
  var expectedVersions = range(minNodeVersion, maxNodeVersion);
  var msg = 'Check GitHub Actions node_js versions';
  assertDeepEquals(githubActionsYaml.jobs.test.strategy.matrix['node-version'],
      expectedVersions, msg);
}

try {
  checkReadme(MIN_NODE_VERSION);

  var package = require('../package.json');
  checkEngines(MIN_NODE_VERSION, package);

  var githubActionsFileName = path.join(__dirname, '..', '.github', 'workflows',
      'main.yml');
  var githubActionsYaml = yaml.safeLoad(shell.cat(githubActionsFileName));
  checkGithubActions(MIN_NODE_VERSION, MAX_NODE_VERSION, githubActionsYaml);

  console.log('All files look good (this project supports v'
      + MIN_NODE_VERSION + '-v' + MAX_NODE_VERSION + ')!');
} catch (e) {
  console.error('Please check the files which declare our Node version');
  console.error('support, as something is out-of-sync. This script failed');
  console.error('specificaly because:');
  throw e;
}
