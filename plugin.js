'use strict';

const PLUGIN_ID_KEY = '___shelljs_plugin_id___';
const DEFAULT_ERROR_CODE = 1;

function setPluginID(plugin, id) {
  Object.defineProperty(plugin, PLUGIN_ID_KEY, {
    value: id
  });
  return id;
}

const getPluginID = plugin => plugin[PLUGIN_ID_KEY];

module.exports = function setupShellPlugins($) {
  const used_plugins = [];
  const plugins = [{ // $
    id: 0,
    name: '',
    fullname: '',
    func: $,
    target: null
  }];
  setPluginID($, 0);

  const state = {
    error: null,
    errorCode: 0,
    currentCmd: 'shell.js',
    tempDir: null,
  };
  $.config = {
    silent: false,
    fatal: false,
    verbose: false,
    noglob: false,
    globOptions: false,
    maxdepth: false,
  };


  const utils = {
    platform: os.type().match(/^Win/) ? 'win' : 'unix',
    plugin(target, fullname, func) {
        if (typeof getPluginID(target) !== 'number') throw new Error('util.plugin target wasn\'t `$` or `$.something`');
        if (getPluginID(func)) console.log('[shelljs/plugin] Warning: utils.plugin was called twice with the same func.');
        const id = setPluginID(func, plugins.length);
        target = plugins[getPluginID(target)];
        const name = fullname.split('.').pop();
        const plugin = {
          id, name, fullname, func, target
        };
        Object.defineProperty(target.func, name, {
          value: func,
          enumerable: true
        });
        plugins[id] = plugin;
        return func;
      },

      expand(list) {
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
        if (!$.config.silent) console.log(...args);
      }

      error(msg, code, continue_) {
        if (typeof code === 'boolean') {
          continue_ = code;
          code = DEFAULT_ERROR_CODE;
        }
        if (typeof code !== 'number') code = DEFAULT_ERROR_CODE;
        if (state.errorCode === 0) state.errorCode = code;
        if (state.error === null) state.error = '';
        state.error += state.currentCmd + ': ' + msg + '\n';

        if ($.config.fatal) throw new Error(log_entry);
        if (msg.length) utils.log(log_entry);
        if (!continue_) throw {
          msg: 'earlyExit',
          retValue: (new ShellString('', state.error, state.errorCode))
        };
      }
  }

  function use(plugin) {
    if (used_plugins.indexOf(plugin) > -1) return; // Don't load the plugin twice.
    used_plugins.push(plugin);

    plugin($, utils);
  }

  return use;
}

