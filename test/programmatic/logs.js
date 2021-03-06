
process.env.NODE_ENV = 'test';
//process.env.DEBUG='pm2:*';

var PM2    = require('../..');
var should = require('should');
var fs     = require('fs');
var path   = require('path');

describe('Max memory restart programmatic', function() {

  var proc1 = null;
  var procs = [];

  var pm2 = new PM2.custom({
    independent : true,
    cwd : __dirname + '/../fixtures'
  });

  before(function(done) {
    this.timeout(5000);

    pm2.connect(function() {
      console.log('connected');
      pm2.delete('all', function() {
        done();
      });
    });
  });

  after(function(done) {
    pm2.destroy(done);
  });

  afterEach(function(done) {
    pm2.delete('all', done);
  });


  describe('Log merging', function() {
    it('should process HAS post fixed logs with id (merge_logs: false)', function(done) {
      pm2.start({
        script: './echo.js',
        error_file : 'error-echo.log',
        out_file   : 'out-echo.log'
      }, function(err, procs) {
        should(err).be.null();

        var out_file = procs[0].pm2_env.pm_out_log_path;
        var err_file = procs[0].pm2_env.pm_err_log_path;

        out_file.should.containEql('out-echo-0.log');
        err_file.should.containEql('error-echo-0.log');

        setTimeout(function() {
          fs.readFileSync(out_file).toString().should.containEql('echo.js');
          fs.readFileSync(err_file).toString().should.containEql('echo.js-error');
          done();
        }, 500);
      });
    });

    it('should process HAS NOT post fixed logs with id (merge_logs: true)', function(done) {
      pm2.start({
        script: './echo.js',
        error_file : 'error-echo.log',
        out_file   : 'out-echo.log',
        merge_logs : true
      }, function(err, procs) {
        should(err).be.null();

        var out_file = procs[0].pm2_env.pm_out_log_path;
        var err_file = procs[0].pm2_env.pm_err_log_path;

        out_file.should.containEql('out-echo.log');
        err_file.should.containEql('error-echo.log');

        setTimeout(function() {
          fs.readFileSync(out_file).toString().should.containEql('echo.js');
          fs.readFileSync(err_file).toString().should.containEql('echo.js-error');
          done();
        }, 500);
      });
    });

    it('should process HAS NOT post fixed logs with id and MERGED FILE (merge_logs: true)', function(done) {
      pm2.start({
        script: './echo.js',
        error_file : 'error-echo.log',
        out_file   : 'out-echo.log',
        log_file   : 'merged.log',
        merge_logs : true
      }, function(err, procs) {
        should(err).be.null();

        var out_file = procs[0].pm2_env.pm_out_log_path;
        var err_file = procs[0].pm2_env.pm_err_log_path;
        var log_file = procs[0].pm2_env.pm_log_path;

        out_file.should.containEql('out-echo.log');
        err_file.should.containEql('error-echo.log');
        log_file.should.containEql('merged.log');

        setTimeout(function() {
          fs.readFileSync(out_file).toString().should.containEql('echo.js');
          fs.readFileSync(err_file).toString().should.containEql('echo.js-error');
          fs.readFileSync(log_file).toString().should.containEql('echo.js-error');
          fs.readFileSync(log_file).toString().should.containEql('echo.js');
          done();
        }, 500);
      });
    });

  });

  describe('Log timestamp', function() {
    it('should every file be timestamped', function(done) {
      pm2.start({
        script          : './echo.js',
        error_file      : 'error-echo.log',
        out_file        : 'out-echo.log',
        log_file        : 'merged.log',
        merge_logs      : true,
        log_date_format : 'YYYY-MM-DD HH:mm Z'
      }, function(err, procs) {
        should(err).be.null();

        var out_file = procs[0].pm2_env.pm_out_log_path;
        var err_file = procs[0].pm2_env.pm_err_log_path;
        var log_file = procs[0].pm2_env.pm_log_path;

        out_file.should.containEql('out-echo.log');
        err_file.should.containEql('error-echo.log');
        log_file.should.containEql('merged.log');

        setTimeout(function() {
          fs.readFileSync(out_file).toString().should.containEql('20');
          fs.readFileSync(err_file).toString().should.containEql('20');
          fs.readFileSync(log_file).toString().should.containEql('20');
          done();
        }, 500);
      });
    });

  });


});
