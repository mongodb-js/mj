var fs = require('fs');
var async = require('async');
var glob = require('glob');
var rimraf = require('rimraf');
var Joi = require('joi');
var taskmgr = require('../lib/taskmgr');
var spawn = require('child_process').spawn;
var path = require('path');
var debug = require('debug')('mj:check');

// Checks for required files
var checkRequiredFilesExist = function(args, done) {
  debug('checking required files with args', args);
  var dir = path.resolve(args['<directory>']);

  var tasks = [
    'README*',
    'LICENSE',
    '.travis.yml',
    '.gitignore'
  ].map(function requireFileExists(pattern) {
    return function(cb) {
      glob(pattern, {
        cwd: dir
      }, function(err, files) {
        debug('resolved %s for `%s`', files, pattern);
        if (err) {
          return cb(err);
        }
        if (files.length === 0) {
          return done(new Error('missing required file matching ' + pattern));
        }
        if (files.length > 1) {
          return done(new Error('more than one file matched ' + pattern));
        }

        fs.exists(files[0], function(exists) {
          if (!exists) {
            return done(new Error('missing required file matching ' + files[0]));
          }
          return cb(null, files[0]);
        });
      });
    };
  });
  async.parallel(tasks, done);
};

// Check package.json conforms
var checkPackage = function(args, done) {
  var dir = path.resolve(args['<directory>']);
  var pkg = require(path.join(dir, 'package.json'));
  var schema = Joi.object().keys({
    name: Joi.string().min(1).max(30).regex(/^[a-zA-Z0-9][a-zA-Z0-9\.\-_]*$/).required(),
    version: Joi.string().regex(/^[0-9]+\.[0-9]+[0-9+a-zA-Z\.\-]+$/).required(),
    description: Joi.string().max(80).required(),
    license: Joi.string().max(20).required(),
    homepage: Joi.string().uri({
      scheme: ['http', 'https']
    }).required(),
    main: Joi.string().optional(),
    repository: Joi.object().keys({
      type: Joi.string().valid('git').required(),
      url: Joi.string().uri({
        scheme: ['git', 'https']
      }).regex(/mongodb-js\/[a-zA-Z0-9\.\-_]+/).required()
    }),
    bin: Joi.object().optional(),
    scripts: Joi.object().optional(),
    bugs: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
    author: Joi.string().required(),
    dependencies: Joi.object().required(),
    devDependencies: Joi.object().required()
  });
  Joi.validate(pkg, schema, {
    abortEarly: false,
    allowUnknown: true
  }, done);
};

// If I clone this repo and run `npm install && npm test` does it work?
// If there is an `npm start`, run that as well and make sure it stays
// up for 5 seconds and doesn't return an error.
var checkFirstRun = function(args, done) {
  function run(cmd) {
    return function(cb) {
      debug('testing `%s`', cmd);
      var parts = cmd.split(' ');
      var bin = parts.shift();
      var args = parts;
      var completed = false;

      var child = spawn(bin, args, {
        cwd: args['<directory>']
      })
        .on('error', function(err) {
          completed = true;
          done(new Error(cmd + ' failed: ' + err.message));
        });

      child.stderr.pipe(process.stderr);

      if (cmd === 'npm start') {
        setTimeout(function() {
          if (completed) {
            return;
          }

          completed = true;
          child.kill('SIGKILL');
          done();
        }, 5000);
      }

      child.on('close', function(code) {
        if (completed) {
          return;
        }

        completed = true;

        if (code === 0) {
          done();
          return;
        }

        cb(new Error(cmd + ' failed'));
      });
    };
  }
  debug('checking first run');


  var dir = path.resolve(args['<directory>']);

  var pkg = require(path.join(dir, 'package.json'));

  debug('clearing local node_modules to make sure install works');

  rimraf(dir + '/node_modules/**/*', function(err) {
    if (err) {
      return done(err);
    }
    var tasks = [
      run('npm install'),
      run('npm test')
    ];

    if (pkg.scripts.start) {
      tasks.push(run('npm start'));
    }

    async.series(tasks, function(err, results) {
      if (err) {
        return done(err);
      }
      done(null, results);
    });
  });
};

module.exports = function(args, done) {
  // defaults
  args['<directory>'] = args['<directory>'] || '.';

  debug('global options', args);

  var tasks = {
    'required files present': checkRequiredFilesExist.bind(null, args),
    'package.json complete': checkPackage.bind(null, args),
    'tests pass': checkFirstRun.bind(null, args)
  };

  var options = {
    name: 'check',
    verbose: args['--verbose'],
    spinner: true
  };

  taskmgr(tasks, options, done);
};
