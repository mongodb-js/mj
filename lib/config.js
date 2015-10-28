var _ = require('lodash');
var path = require('path');
var format = require('util').format;
// var untildify = require('untildify');
var Model = require('ampersand-model');
var debug = require('debug')('mj:config');

var Config = Model.extend({
  props: {
    plaform: {
      type: 'string',
      values: [
        'windows',
        'osx',
        'linux'
      ]
    },
    /**
     * Which nodejs distribution are we using?
     */
    nodejs_distro: {
      type: 'string',
      default: 'node',
      values: [
        'io.js',
        'node'
      ]
    },
    /**
     * Which nodejs version are we using?
     */
    nodejs_version: {
      type: 'string',
      default: '4.2.1'
    },
    /**
     * Which npm version are we using?
     */
    npm_version: {
      type: 'string',
      default: '3.3.9'
    },
    /**
     * Which version of nodist do we use to
     * manage node.js on windows?
     */
    nodist_version: {
      type: 'string',
      default: '0.6.0'
    },
    /**
     * Which version of nvm do we use to
     * manage node.js on linux and osx?
     */
    nvm_version: {
      type: 'string',
      default: '0.29.0'
    },
    /**
     * Which npm version are we using?
     */
    electron_version: {
      type: 'string',
      default: '0.30.8'
    }
  /**
   * @todo (imlucas): Grab logic from `mongodb-js/runner/config.js`
   * so `mj` can change `this.directory` on the fly to take advantage
   * of directory caching on evergreen and travis.
   */
  // is_installed_globally: {
  //   type: 'boolean',
  //   default: true
  // }
  },
  derived: {
    /**
     * Where does mj put things?
     */
    directory: {
      deps: ['platform'],
      fn: function() {
        return process.cwd();
      // if (this.platform === 'windows') {
      //   return path.join('C:', '.mj');
      // }
      // return untildify('~/.mj');
      }
    },
    /**
     * values: ia32 (32bit) or x64 (64bit)
     */
    arch: {
      deps: ['platform'],
      fn: function() {
        if (this.platform === 'windows') {
          return 'ia32';
        }
        return 'x64';
      }
    },
    /**
     * Which tool do we use to install and manage
     * node.js? On windows: nodist. Linux and osx: nvm.
     */
    nodejs_manager: {
      deps: ['platform'],
      fn: function() {
        if (this.platform === 'windows') {
          return 'nodist';
        }
        return 'nvm';
      }
    },
    /**
     * What is the root directory nodist uses to manage node.js?
     *
     * @todo (imlucas): `env.set('NODIST_PREFIX', config.nodist_prefix)`
     */
    nodist_prefix: {
      deps: ['nodist_version', 'directory'],
      fn: function() {
        return path.join(this.directory, format('nodist-%s', this.nodist_version));
      }
    },
    /**
     * What is the URL to download the prebuilt version of nodist?
     */
    nodist_url: {
      deps: ['nodist_version'],
      fn: function() {
        return format('https://github.com/marcelklehr/nodist/archive/v%s.zip',
          this.nodist_version);
      }
    },
    /**
     * What is the arg we pass to `nodist use`?
     * @example
     *   nodist use iojsv2.3.4
     *   nodist use nodev4.2.1
     */
    nodist_use: {
      deps: ['nodejs_distro', 'nodejs_version'],
      fn: function() {
        return format('%sv%s',
          this.nodejs_distro.replace('.', ''),
          this.nodejs_version);
      }
    },
    /**
     * What is the directory `npm install -g <package>` places
     * executable scripts into?
     */
    bin_directory: {
      deps: [
        'directory',
        'platform',
        'nodist_prefix',
        'nvm_prefix'
      ],
      fn: function() {
        if (this.platform === 'windows') {
          return path.join(this.nodist_prefix, 'bin');
        }
        return path.join(this.directory, 'nvm', 'versions',
          this.nodejs_distro, this.nodejs_version, 'bin');
      }
    },
    /**
     * What is the arg we pass to `nvm use`?
     * @example
     *   nvm use iojs-v2.3.4
     *   nvm use 4.2.1
     *
     */
    nvm_use: {
      deps: ['nodejs_distro', 'nodejs_version'],
      fn: function() {
        if (this.nodejs_distro === 'node') {
          return this.nodejs_version;
        }

        return format('%s-v%s',
          this.nodejs_distro.replace('.', ''),
          this.nodejs_version);
      }
    },
    /**
     * What is the URL to download the nvm installer script?
     */
    nvm_url: {
      deps: ['nvm_version'],
      fn: function() {
        return format('https://raw.githubusercontent.com/creationix/nvm/v%s/install.sh',
          this.nvm_version);
      }
    }
  },
  serialize: function() {
    return Model.prototype.serialize.call(this, {
      derived: true
    });
  },
  initialize: function(attrs) {
    attrs = _.defaults(attrs || {}, {
      platform: process.platform
    });

    debug('normalizing platform', attrs.platform);

    var platform = attrs.platform
      .toLowerCase()
      .replace(/ /g, '');

    if (_.contains(['win32', 'windows'], platform)) {
      platform = 'windows';
    } else if (_.contains(['darwin', 'osx'], platform)) {
      platform = 'osx';
    } else if (_.contains(['linux', 'ubuntu'], platform)) {
      platform = 'linux';
    } else {
      throw new TypeError('Dont know how to parse for platform `'
        + platform + '`');
    }
    if (platform === 'windows') {
      this.platform = platform;
    } else {
      this.platform = platform;
    }
    attrs.platform = platform;
    debug('platform is `%s`', this.platform);
  }
});

var config = new Config({
  platform: process.platform
});
debug('initialized', JSON.stringify(config, null, 2));

module.exports = config;
module.exports.Config = Config;
