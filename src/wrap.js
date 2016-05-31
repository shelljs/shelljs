var ShellString = require('./ShellString');

// Wrap a command to do some args processing.
function wrap(state, utils, fullname, func, optsMap, {
    unix = true, globIdx = 1, retShellString = true, parseOptions = true,
  }) {
    return function wrapped(...args) {
        var ret = null;
        state.currentCmd = fullname;
        state.error = null;
        state.errorCode = 0;

        try {
          if (config.verbose) console.error(cmd, ...args);
          if (unix) {
            if (args.length === 0 || typeof args[0] !== 'string' || args[0].length <= 1 || args[0][0] !== '-') args.unshift(''); // add dummy option if needed

            // This is a simple version of flatten
            args = args.reduce((accum, cur) => Array.isArray(cur) ? accum.concat(cur) : [...accum, cur], []);

            // TODO: We loop over the arguments multiple times. It might be faster to do it only once.
            // Convert ShellString to regular strings
            args = args.map(arg => (arg instanceof Object && arg.constructor.name === 'String') ? arg.toString() : arg);

            // ~ Expansion
            args = args.map(arg => (typeof arg === 'string' && (arg.slice(0, 2) === '~/' || arg === '~')) ? arg.replace(/^~/, utils.homedir) : arg);

            // Globbing
            if (globIdx !== -1) args = args.slice(0, globIdx).concat(utils.expand(args.slice(globIdx)));

            // parseOptions
            if (parseOptions) args[0] = utils.parseOptions(args[0], optsMap);

            // Execute it
            try {
              ret = func(...args);
            } catch (e) { // Handle utils.error earlyExit
              if (e.msg === 'earlyExit') ret = e.retValue;
              else throw e;
            }

            // ShellStringify the output
            if (retShellString) ret = new ShellString(ret, state.error, state.errorCode);
          } else {
            return func(...args);
          }
        } catch (e) {
          if (!state.error) {
            // If state.error hasn't been set, then it's an error thrown by Node, not us - likely a bug.
            // TODO: I'm not sure if we should be swollowing the error here.
            console.error('shell.js: internal error');
            console.error(e.stack || e);
            process.exit(1);
          }
          if (config.fatal) throw e;
        }
        state.currentCmd = 'shell.js';
        return ret;
      } // wrapped
  } // wrap

