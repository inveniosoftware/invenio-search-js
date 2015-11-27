/*
 * This file is part of Invenio.
 * Copyright (C) 2015 CERN.
 *
 * Invenio is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * Invenio is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Invenio; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 *
 * In applying this license, CERN does not
 * waive the privileges and immunities granted to it by virtue of its status
 * as an Intergovernmental Organization or submit itself to any jurisdiction.
 */

var gulp = require('gulp');
var del = require('del');
var fs = require('fs');
var karma = require('karma').server;
var path = require('path');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

/**
 * File patterns
 **/

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src');

var sourceFiles = [

  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),

  // Then add all JavaScript files
  path.join(sourceDirectory, '/**/*.js'),

];

var templates = [
  path.join(sourceDirectory, '/**/templates/*.html')
];

// Get licenses
var licences = {
  'javascript': fs.readFileSync(path.join(rootDirectory, '.license'), 'utf8')
};

var lintFiles = [
  'gulpfile.js',
  // Karma configuration
  'karma-*.conf.js'
].concat(sourceFiles);

/**
 * Build
 */
gulp.task('build', function() {
  gulp.src(sourceFiles)
    .pipe(plugins.plumber())
    .pipe(plugins.concat('invenio-search-js.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename('invenio-search-js.min.js'))
    .pipe(plugins.header(licences.javascript))
    .pipe(gulp.dest('./dist'));
});

/**
 * Templates
 */
gulp.task('templates', function() {
  gulp.src(templates)
    .pipe(plugins.flatten())
    .pipe(gulp.dest('./dist/templates'));
});

/**
 * Prepare the example
 */
gulp.task('example', function() {
  gulp.src(path.join(rootDirectory, 'dist', '**', '*'))
    .pipe(gulp.dest(path.join(rootDirectory, 'example', 'lib')));
});

/**
 * Process
 */
gulp.task('process-all', ['clean'], function (done) {
  runSequence(
    'test', 'build', 'templates', 'docs', 'example', done
  );
});

/**
 * Watch task
 */
gulp.task('watch', function () {

  // Watch JavaScript files
  gulp.watch(sourceFiles, ['process-all']);
});

/**
 * Validate source JavaScript
 */
gulp.task('jshint', function () {
  return gulp.src(lintFiles)
    .pipe(plugins.plumber())
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'));
});

/**
 * Validate source JavaScript
 */
gulp.task('coveralls', function () {
  return gulp.src('coverage/**/lcov.info')
    .pipe(plugins.coveralls());
});


/**
 * Run test once and exit
 */
gulp.task('test-src', function (done) {
  karma.start({
    configFile: __dirname + '/karma-src.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-concatenated', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-concatenated.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-minified', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-minified.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  runSequence('jshint', 'test-src', done);
});

/**
 * Clean all target folders
 */
gulp.task('clean', function() {
  return del(['dist', 'docs', 'example/lib']);
});

/**
 * Genearate docs.
 */
gulp.task('docs', ['clean'], function() {
  return gulp.src('./src/**/*.js')
    .pipe(plugins.jsdoc('./docs'));
});

/**
 * Run the demo
 */
gulp.task('demo', function() {
  gulp.src(path.join(rootDirectory, 'example'))
    .pipe(plugins.webserver({
      livereload: true,
      open: true
  }));
});

gulp.task('default', function () {
  runSequence('process-all', 'watch');
});
