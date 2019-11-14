#!/usr/bin/env node

var assert = require('assert');
var path = require('path');

var yaml = require('js-yaml');

var shell = require('..');

// This is the authoritative list of supported node versions.
var MIN_NODE_VERSION = 6;
var MAX_NODE_VERSION = 13;

function checkReadme(minNodeVersion) {
  var start = '<!-- start minVersion -->';
  var stop = '<!-- stop minVersion -->';
  var formattedMinVersion = '`v' + minNodeVersion + '`';
  var expectedReadmeRegex = new RegExp(
      start + '\\s*' + formattedMinVersion + '\\s*' + stop, ''
  );
  var readme = path.join(__dirname, '..', 'README.md');
  var match = shell.grep(expectedReadmeRegex, readme);
  if (!match.toString()) {
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

function checkTravis(minNodeVersion, maxNodeVersion, travisYaml) {
  var expectedTravisVersions = range(minNodeVersion, maxNodeVersion);
  var msg = 'Check Travis node_js versions';
  assertDeepEquals(travisYaml.node_js, expectedTravisVersions, msg);
}

function checkAppveyor(minNodeVersion, maxNodeVersion, appveyorYaml) {
  var expectedAppveyorVersions = range(minNodeVersion, maxNodeVersion)
      .map(function (num) {
        return { nodejs_version: num.toString() };
      })
      .reverse(); // Arbitrarily, we store appveyor in reverse order.
  var msg = 'Check Appveyor environment.matrix versions';
  assertDeepEquals(appveyorYaml.environment.matrix, expectedAppveyorVersions,
      msg);
}

try {
  checkReadme(MIN_NODE_VERSION);

  var package = require('../package.json');
  checkEngines(MIN_NODE_VERSION, package);

  var travisFileName = path.join(__dirname, '..', '.travis.yml');
  var travisYaml = yaml.safeLoad(shell.cat(travisFileName));
  checkTravis(MIN_NODE_VERSION, MAX_NODE_VERSION, travisYaml);

  var appveyorFileName = path.join(__dirname, '..', 'appveyor.yml');
  var appveyorYaml = yaml.safeLoad(shell.cat(appveyorFileName));
  checkAppveyor(MIN_NODE_VERSION, MAX_NODE_VERSION, appveyorYaml);
} catch (e) {
  console.error('Please check the files which declare our Node version');
  console.error('support, as something is out-of-sync. This script failed');
  console.error('specificaly because:');
  throw e;
}
