/**
 * The API scripts use for reading and writing
 * environment variables that provides a consistent
 * interface across platforms.

 * Provider's handle platform specific translation and
 * have all of the work involved so developers just don't
 * have to even know how annoying it is to deal with
 * environment variables on windows.
 */
var path = require('path');
var debug = require('debug')('mj:env:common');

/* eslint no-shadow:0 */

function Environment(provider) {
  this.provider = provider;
  this.PATH = {
    add: this.addTo.bind(this, 'PATH'),
    has: this.existsIn.bind(this, 'PATH'),
    remove: this.removeFrom.bind(this, 'PATH')
  };
}

// So your scripts can just be as simple as
// `env.addTo('PATH', done)` and it be mapped properly regardless
// of platform eg on windows, `env.addTo('PATH')` is properly
// aliased to the right key: `Path`.
Environment.prototype.key = function(name) {
  if (!this.provider.key) {
    throw new Error('Not implemented');
  }
  return this.provider.key(name);
};

// eg on windows, `Path` is set in the registry,
// but we want to update `process.env.PATH`.
Environment.prototype.getProcessKey = function(name) {
  if (name.toLowerCase() === 'path') {
    name = 'PATH';
  }
  return name;
};

Environment.prototype.set = function(name, value, fn) {
  if (!this.provider.set) {
    return process.nextTick(function() {
      fn(new Error('Not implemented'));
    });
  }
  var key = this.key(name);
  this.provider.set(key, value, function(err) {
    if (err) {
      return fn(err);
    }

    var key = this.getProcessKey(name);
    process.env[key] = value;
    debug('updated process.env for `%s` to `%s`', name, process.env[key]);
    process.nextTick(fn);
  }.bind(this));
};

Environment.prototype.get = function(name, fn) {
  if (!this.provider.get) {
    return process.nextTick(function() {
      fn(new Error('Not implemented'));
    });
  }
  var key = this.key(name);
  this.provider.get(key, fn);
};

Environment.prototype.values = function(name, fn) {
  this.get(name, function(err, value) {
    if (err) {
      return fn(err);
    }
    fn(null, value.split(path.delimiter));
  });
};

Environment.prototype.existsIn = function(name, src, fn) {
  this.values(name, function(err, paths) {
    if (err) {
      return fn(err);
    }
    fn(null, paths.indexOf(src) > -1);
  });
};

Environment.prototype.addTo = function(name, src, fn) {
  this.existsIn(name, src, function(err, yes) {
    if (err) {
      return fn(err);
    }

    if (yes) {
      debug('`%s` already in %s', src, name);
      return fn(null, false);
    }

    this.values(name, function(err, paths) {
      if (err) {
        return fn(err);
      }
      debug('Adding `%s` to %s', src, name);

      paths.unshift(src);
      var newValue = paths.join(path.delimiter);
      this.set(name, newValue, function(err) {
        if (err) {
          return fn(err);
        }
        debug('added successfully!');
        fn(null, true);
      });
    }.bind(this));
  }.bind(this));
};

Environment.prototype.removeFrom = function(name, src, fn) {
  this.existsIn(name, src, function(err, yes) {
    if (err) {
      return fn(err);
    }

    if (!yes) {
      debug('`%s` is not in %s', src, name);
      return fn(null, false);
    }

    this.values(name, function(err, paths) {
      if (err) {
        return fn(err);
      }
      debug('removing `%s` from %s', src, name);

      paths.splice(paths.indexOf(src), 1);

      var newValue = paths.join(';');
      this.set(name, newValue, function(err) {
        if (err) {
          return fn(err);
        }
        debug('removed successfully!');
        fn(null, true);
      });
    }.bind(this));
  }.bind(this));
};

module.exports = Environment;
