'use strict';

const PLUGIN_ID_KEY = '___shelljs_plugin_id___';
const DEFAULT_ERROR_CODE = 1;

let $ = null;
const used_plugins = [];
const plugins = [{ // $
  id: 0,
  name: '',
  fullname: '',
  val: null, // This gets set in init().
  wrapped: null,
  target: null,
  callable: false,
}];

const state = {
  stderr: '',
  code: 0,
  currentCmd: 'shell.js',
  tempDir: null,
};
module.exports.state = state;

const pipeCommands = [];
module.exports.pipeCommands = pipeCommands;

const ensureInit = () => {
  if (!$) throw new Error('Please call plugin.init($) first!');
};

const platform = os.type().match(/^Win/) ? 'win' : 'unix';
const utils = {
  platform: platform,
  isWindows: platform === 'win',
  isUnix: platform === 'unix',

  // Return the home directory platform-agnostically, with consideration for old versions of node.
  get homedir() {
    if (os.homedir) return os.homedir();
    return process.env[utils.isWindows ? 'USERPROFILE' : 'HOME'];
  },

  plugin(target, fullname, val = null, optsMap = {}, opts = {}) {
    ensureInit();
    if (typeof getPluginID(target) !== 'number') throw new Error('util.plugin target wasn\'t `$` or `$.something`');
    if (val === null) val = {}; // Non-callable commands.
    if (getPluginID(val)) console.log('[shelljs/plugin] Warning: utils.plugin was called twice with the same func.');
    const id = setPluginID(val, plugins.length);
    target = plugins[getPluginID(target)];
    const name = fullname.split('.').pop();

    let wrapped = null;
    if (typeof val === 'function') {
      // For non-unix commands, you can omit the optsMap
      if (optsMap.unix === false && arguments.length === 4) {
        opts = optsMap;
        optsMap = false;
      }
      // FIXME: This will have commands be piped as their shortnames (ex. $.foo.bar.baz will be avaliable as new ShellString().baz()).
      if (opts.pipe) pipeCommands.push({ name, func: val });
      wrapped = wrap(state, utils, fullname, val, optsMap, opts);
    }

    const plugin = {
      id, name, fullname, val, target, wrapped, callable: typeof val === 'function',
    };

    Object.defineProperty(target.val, name, {
      value: typeof val === 'function' ? wrapped : val,
      enumerable: true
    });
    plugins[id] = plugin;

    return func;
  },

  expand(list) {
    ensureInit();
    if (!Array.isArray(list)) throw new TypeError('`list` must be an array!');
    const expanded = [];
    list.forEach(function(listEl) {
      if (typeof listEl !== 'string') {
        expanded.push(listEl);
      } else {
        const ret = glob.sync(listEl, $.config.globOptions);
        // if glob fails, interpret the string literally
        expanded = expanded.concat(ret.length > 0 ? ret : [listEl]);
      }
    });
    return expanded;
  },

  readFromPipe(that) {
    return that instanceof String ? that.toString() : '';
  },

  log(...args) {
    ensureInit();
    if (!$.config.silent) console.log(...args);
  }

  error(msg, code, continue_) {
    ensureInit();
    if (typeof code === 'boolean') {
      continue_ = code;
      code = DEFAULT_ERROR_CODE;
    }
    if (typeof code !== 'number') code = DEFAULT_ERROR_CODE;
    if (state.code === 0) state.code = code;
    state.stderr += msg + '\n';

    if ($.config.fatal) throw new Error(log_entry);
    if (msg.length) utils.log(log_entry);
    if (!continue_) throw {
      msg: 'earlyExit',
      retValue: (new ShellString('', state.stderr, state.code))
    };
  },
  // Returns {'alice': true, 'bob': false} when passed a string and dictionary as follows:
  //   parseOptions('-a', {'a':'alice', 'b':'bob'});
  // Returns {'reference': 'string-value', 'bob': false} when passed two dictionaries of the form:
  //   parseOptions({'-r': 'string-value'}, {'r':'reference', 'b':'bob'});
  parseOptions(opt, map) {
    if (!opt) throw new Error('shelljs: parseOptions: no map given');

    // Everything defaults to false
    var options = {};
    for (var letter in map) {
      if (map[letter][0] !== '!') options[map[letter]] = false;
    }

    if (!opt) return options; // defaults

    var optionName;
    if (typeof opt === 'string') {
      if (opt[0] !== '-') return options;

      // e.g. chars = ['R', 'f', 'u']
      var chars = opt.slice(1).split('');

      chars.forEach(function(c) {
        if (c in map) {
          optionName = map[c];
          if (optionName[0] === '!') {
            options[optionName.slice(1)] = false;
          } else {
            options[optionName] = true;
          }
        } else {
          utils.error('Option not recognized: ' + c);
        }
      });
    } else if (typeof opt === 'object') {
      for (var key in opt) {
        // '-r', '-f' or 'r', 'f'
        var c = key.length === 2 ? key[1] : key[0];
        if (c in map) {
          optionName = map[c];
          options[optionName] = opt[key];
        } else {
          utils.error('Option not recognized: ' + c);
        }
      }
    } else {
      utils.error('options must be string or key-value pairs');
    }
    return options;
  }
}
module.exports.utils = utils;

function setPluginID(plugin, id) {
  Object.defineProperty(plugin, PLUGIN_ID_KEY, {
    value: id
  });
  return id;
}

const getPluginID = plugin => plugin[PLUGIN_ID_KEY];

function use(plugin) {
  ensureInit();
  if (used_plugins.indexOf(plugin) > -1) return; // Don't load the plugin twice.
  used_plugins.push(plugin);

  plugin($, utils);
}
module.exports.use = use;

function init($_) {
  $ = $_
  plugins[0].val = $;
  setPluginID($, 0);

  return use;
}

module.exports.init = init;

