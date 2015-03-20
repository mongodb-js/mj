'use strict';

var fs = require('fs'),
  async = require('async'),
  glob = require('glob'),
  rimraf = require('rimraf'),
  Joi = require('joi'),
  spawn = require('child_process').spawn,
  clui = require('clui'),
  clic = require('cli-color'),
  symbols = require('../util/symbols'),
  debug = require('debug')('mj:check');

// Checks for required files
var checkRequiredFilesExist = function(argv, done) {
  debug('checking required files', argv);
  var dir = argv['<directory>'];

  var tasks = [
    'README*',
    'LICENSE',
    '.travis.yml',
    '.gitignore',
  ].map(function requireFileExists(pattern) {
    return function(cb) {
      glob(pattern, {
        cwd: dir
      }, function(err, files) {
          debug('resolved %s for `%s`', files, pattern);
          if (err) return cb(err);
          if (files.length === 0) {
            return done(new Error('missing required file matching ' + pattern));
          }
          if (files.length > 1) {
            return done(new Error('more than one file matched ' + pattern));
          }

          fs.exists(files[0], function(exists) {
            if (!exists) return done(new Error('missing required file matching ' + files[0]));
            return cb(null, files[0]);
          });
        });
    };
  });
  async.parallel(tasks, done);
};

// Check package.json conforms
var checkPackage = function(argv, done) {
  var dir = argv['<directory>'],
    pkg;

  try {
    pkg = require(dir + '/package.json');
  } catch (e) {
    return process.nextTick(done.bind(null, e));
  }

  var schema = Joi.object().keys({
    name: Joi.string().min(1).max(30).regex(/^[a-zA-Z0-9][a-zA-Z0-9\.\-_]*$/).required(),
    version: Joi.string().regex(/^[0-9]+\.[0-9]+[0-9+a-zA-Z\.\-]+$/).required(),
    description: Joi.string().max(80).required(),
    license: Joi.string().alphanum().max(10).required(),
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
    bugs: Joi.object().required(),
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
// If there is an `npm start`, run that as well and make sure it stays up
// for at least 5 seconds.
var checkFirstRun = function(argv, done) {
  function run(cmd) {
    return function(cb) {
      debug('testing `%s`', cmd);
      var parts = cmd.split(' '),
        bin = parts.shift(),
        args = parts,
        completed = false;

      var child = spawn(bin, args, {
        cwd: argv['<directory>']
      })
        .on('error', function(err) {
          completed = true;
          console.error(err);
          done(new Error(cmd + ' failed'));
        });

      child.stderr.pipe(process.stderr);

      if (cmd === 'npm start') {
        setTimeout(function() {
          if (completed) return;

          completed = true;
          child.kill('SIGKILL');
          done();
        }, 5000);
      }

      child.on('close', function(code) {
        if (completed) return;

        completed = true;

        if (code === 0) return done();

        cb(new Error(cmd + ' failed'));
      });
    };
  }
  debug('checking first run');

  var pkg,
    dir = argv['<directory>'];

  try {
    pkg = require(dir + '/package.json');
  } catch (e) {
    return process.nextTick(done.bind(null, e));
  }

  debug('clearing local node_modules to make sure install works');

  rimraf(dir + '/node_modules/**/*', function(err) {
    if (err) return done(err);
    var tasks = [
      run('npm install'),
      run('npm test')
    ];

    if (pkg.scripts.start) {
      tasks.push(run('npm start'));
    }

    async.series(tasks, function(err, results) {
      if (err) return done(err);
      done(null, results);
    });

  });
};

module.exports = function(argv, done) {

  var spinner = new clui.Spinner('checking...');
  spinner.start();

  async.series({
    'required files present': checkRequiredFilesExist.bind(null, argv),
    'package.json complete': checkPackage.bind(null, argv),
    'tests pass': checkFirstRun.bind(null, argv)
  }, function(err, res) {
      spinner.stop();
      if (err) {
        console.log(' ', clic.red(symbols.err), ' check failed:', err.message);
        return done(err);
      }
      if (argv['--verbose']) {
        Object.keys(res).forEach(function(test) {
          console.log(' ', clic.green(symbols.ok), test);
        });
      } else {
        console.log(' ', clic.green(symbols.ok), ' check ok');
      }
    });

};
