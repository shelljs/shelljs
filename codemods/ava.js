/**
 * Convert our custom test setup to AVA.
 *
 * This was my (@ariporad) first codemod, so feedback is welcome.
 *
 * Known Issues:
 * - Sometimes, the trailing comment of the first line of a test is lost.
 * - `assert.deepStrictEqual`/`assert.notDeepStrictEqual` aren't supported.
 * - the `error` paramater of assert.doesNotThrow is not supported.
 */
const TEST_START_REGEX = /(\/\/\s*\n\/\/\s*(?:In)?valids\s*\n\/\/\s*\n[^\/])/i;
const TEST_START_TOKEN = `/* @@!! TESTS START HERE ${Math.random()} !!@@ foo! */\n`;

const TEST_TITLE_REGEX = /(\n\s*\n)\/\/\s*(.*)\n([^\/])/g;

const TITLELESS_TEST_REGEX = /(\n\s*\n)([^\/])/g;
let noTestTitleCount = 0;

// assert: ava
const ASSERT_MAPPINGS = {
  equal: 'is',
  notEqual: 'not',
  fail: 'fail',
  ifError: 'ifError',
  notDeepEqual: 'notDeepEqual',
  notEqual: 'not',
  ok: 'truthy',
  throws: 'throws',
  deepEqual: 'deepEqual',
  doesNotThrow: 'notThrows',
};

// Previously, we would run shell.exit(123) to indicate a successful run. We no longer do this.
export function _removeExit123(j, tests) {
  return tests.find(j.ExpressionStatement, {
    expression: {
      type: 'CallExpression',
      arguments: [{
        type: 'Literal',
        value: 123,
      }],
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'shell', // TODO: detect import name
        },
        property: {
          type: 'Identifier',
          name: 'exit',
        },
      },
    },
  })
  .remove();
};

export function _findAsserts(j, tests, name) {
  return tests
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: {
          type: 'Identifier',
          name: 'assert', // TODO: detect name dynamically.
        },
        property: {
          type: 'Identifier',
          name: name,
        }
      }
    });
};

export function _convertAssertToAVA(j, tests, oldName, newName) {
  return _findAsserts(j, tests, oldName)
    .replaceWith(path => {
      // assert.equal uses ==, while t.is uses ===. So we try to guess if we need to convert a
      // ShellString to a normal string.
      if (oldName === 'equal' || oldName === 'notEqual') {
        if (
          path.node.arguments[1].type === 'Literal' &&
          typeof path.node.arguments[1].value === 'string' &&
          path.node.arguments[0].type === 'Identifier' &&
          path.node.arguments[0].name === 'result'
        ) {
          path.node.arguments[0] = j.callExpression(
            j.memberExpression(path.node.arguments[0], j.identifier('toString'), false),
            []
          );
        }
      }
      return j.callExpression(
        j.memberExpression(j.identifier('t'), j.identifier(newName), false),
        path.node.arguments
      );
    });
}

export function _convertTestCommentsToAVA(j, tests) {
  tests
    .find(j.Program)
  	.replaceWith(path => {
      const testBodies = [[]];
      path.node.body.forEach(node => {
        let maybeTestComment;
        if (node.comments && node.comments.length > 0) {
          let possibleTestComments = node.comments.filter(comment => comment.leading);
          maybeTestComment = possibleTestComments.pop();
        }
  	  	if (
          maybeTestComment &&
          maybeTestComment.value.slice(0, 8) === ' @@TEST(' &&
          maybeTestComment.value.slice(-1) === ')'
        ) {
          const idx = node.comments.indexOf(maybeTestComment);
          node.comments.splice(idx, idx + 1);
          const commentsForParent = node.comments.filter(comment => comment.leading);
          node.comments = node.comments.filter(comment => !comment.leading);
          testBodies.push([maybeTestComment.value, commentsForParent]);
        }
        testBodies[testBodies.length - 1].push(node);
      });
      const beforeTheFirstTest = testBodies.shift(); // Discard all the things before the first test starts.
      const testDeclarations = [];
      testBodies.forEach(body => {
        let [name, comments, ...statements] = body;
        const expr = (
          j.expressionStatement(
            j.callExpression(j.identifier('test'), [
              j.literal(name.trim().slice(7, -1)),
              j.arrowFunctionExpression([j.identifier('t')], j.blockStatement(statements))
            ])
          )
        );
        expr.comments = comments;
        testDeclarations.push(expr);
      });
      return j.program([...beforeTheFirstTest, ...testDeclarations]);
  	});
};

export function _removeUnusedVariables(j, preamble) {
  // WARNING: SUPER HACKY DEAD VARIABLE ELIMINATION. This really should be built into path.scope.
  // We've go to do this because tests will frequently define one or two variables at the top and
  // recycle them throughout the file to avoid scope conflicts. Since everything is now in it's own
  // function, we don't have to worry about that. So we define any missing variable and delete any
  // dead definition.
  const preambleUsedVariables = new Set();
  preamble
    .find(j.Identifier)
    .forEach(path => {
      if (path.parent.node.type === 'AssignmentExpression' || path.parent.node.type === 'VariableDeclarator') return;
      preambleUsedVariables.add(path.node.name);
    });

  preamble
    .find(j.VariableDeclarator)
    .forEach(path => {
      if (!preambleUsedVariables.has(path.node.id.name)) {
        path.prune();
      }
    });
}

export function _convertSpecialAsserts(j, tests) {
  // We have to special-case these, as they don't exist in AVA.
  _findAsserts(j, tests, 'strictEqual')
    .replaceWith(path => j.callExpression(
      j.memberExpression(j.identifier('t'), j.identifier('true'), false),
      [
        j.binaryExpression('===', path.node.arguments[0], path.node.arguments[1]),
        ...path.node.arguments.slice(2)
      ]
    ));

  _findAsserts(j, tests, 'notStrictEqual')
    .replaceWith(path => j.callExpression(
      j.memberExpression(j.identifier('t'), j.identifier('false'), false),
      [
        j.binaryExpression('===', path.node.arguments[0], path.node.arguments[1]),
        ...path.node.arguments.slice(2)
      ]
    ));
}

// Since each test now has it's own scope, tests can't recycle variables. So we just add a
// declaration for any variable that doesn't exist.
// TODO: this could be smarter, right now it will swallow undefined errors.
export function _defineUndefinedVariables(j, tests) {
  tests
    .find(j.ExpressionStatement, {
      expression: {
        type: 'AssignmentExpression',
      },
    })
    .replaceWith(path => {
      if (
        path.node.expression.left.type !== 'Identifier' ||
        path.scope.lookup(path.node.expression.left.name) !== null
      ) return path.node;
      const varDec = j.variableDeclaration('var', [
        j.variableDeclarator(path.node.expression.left, path.node.expression.right)
      ]);
      varDec.comments = path.node.comments;
      return varDec;
    });
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const {expression, statement, statements} = j.template;
  let { source } = file;

  // We actually parse the source in two parts: the actual tests, and the "preamble" (the part
  // before the tests). The split is the first // Valids or // Invalids comment.
  let [preamble, tests] = source
    .replace(TEST_START_REGEX, TEST_START_TOKEN + '\n$1')
    .split(TEST_START_TOKEN);

  //
  // Preamble
  //

  const imports = [
    // Always import AVA
    j.importDeclaration([j.importDefaultSpecifier(j.identifier('test'))], j.literal('ava'))
  ];

  preamble = j(preamble)

  // We're going to convert all the requires to imports. We do this because we can (AVA auto-babels
  // the tests), and because we need to filter out some requires anyway.
  preamble
    .find(j.VariableDeclarator, {
      init: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'require',
        },
      },
    })
    .forEach(path => {
      const importAs = path.node.id;
      const importFrom = path.node.init.arguments[0];
      if (importFrom.value === 'assert') return; // We don't need assert anymore.
      imports.push(
        j.importDeclaration([j.importDefaultSpecifier(importAs)], importFrom)
      );
    })
    .remove();

  // Lots of test files will define a bunch of variables to recycle at the top, then use them
  // throughout. So we're going to get rid of the initial definitions, and we'll define them once
  // per test in the function scope.
  // This must come after we collect all the imports.
  _removeUnusedVariables(j, preamble);


  // Now, everything left in the preamble is really the 'before' hook, so wrap it in that.
  preamble
    .find(j.Program)
    .forEach(path => {
      path.node.body = [
        j.expressionStatement(
          j.callExpression(
            j.memberExpression(j.identifier('test'), j.identifier('before'), false),
            [j.arrowFunctionExpression([j.identifier('t')], j.blockStatement(path.node.body))]
          )
        )
      ];
    });

  // And finally add the imports to the beginning.
  preamble
    .find(j.Program)
    .get(0)
    .node.body.unshift(...imports);

  //
  // Tests
  //

  // This is very hacky, but there's no other way. Currently, tests are seperated by a newline, and
  // some (but not all) have a leading comment with a title. So what we do is add filler titles to
  // any test without one, then add marker comments to seperate the tests. We do this with Regexes

  // Add filler titles to titleless tests
  tests = tests.replace(TITLELESS_TEST_REGEX, (_, $1, $2) => {
    return `${$1}// No Test Title #${++noTestTitleCount}\n${$2}`;
  });

  // Now add a marker comment before each test case.
  // This will convert this:
  // ```javascript
  // // test something
  // assert(blah);
  // assert(bleh);
  //
  // // test something else
  // assert(foo);
  // assert(bar);
  // ```
  // into:
  //
  // ```javascript
  // // @@TEST(test something)
  // assert(blah);
  // assert(bleh);
  //
  // // @@TEST(test something else)
  // assert(foo);
  // assert(bar);
  // ```
  //
  // Which is clear enough to detect in the AST.
  tests = tests.replace(TEST_TITLE_REGEX, `$1// @@TEST($2)\n$3`);

  // Now, finally, parse it
  tests = j(tests)

  // Now get rid of the 123 exit code.
  // This has to come first, or you'll get an empty test case at the end.
  _removeExit123(j, tests);

  // Convert all the test marker comments to actual AVA test cases.
  _convertTestCommentsToAVA(j, tests);

  // Convert all the assertions to AVA assertions.
  Object.keys(ASSERT_MAPPINGS).forEach(assert => {
    _convertAssertToAVA(j, tests, assert, ASSERT_MAPPINGS[assert])
  });

  // These have to be special-cased.
  _convertSpecialAsserts(j, tests);


  // Since each test now has it's own scope, tests can't recycle variables. So we just add a
  // declaration for any variable that doesn't exist.
  _defineUndefinedVariables(j, tests);

  // Now convert everything back to a string
  return preamble.toSource({ quote: 'single' }) + tests.toSource({ quote: 'single' });
};

