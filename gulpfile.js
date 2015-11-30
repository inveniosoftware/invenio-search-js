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

// run all the build tasks
gulp.task('build', ['clean.build'], function (done) {
  runSequence(
    'build.src', 'build.templates', done
  );
});

// build the javascript files
gulp.task('build.src', function() {
  gulp.src(sourceFiles)
    .pipe(plugins.plumber())
    .pipe(plugins.concat('invenio-search-js.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename('invenio-search-js.min.js'))
    .pipe(plugins.header(licences.javascript))
    .pipe(gulp.dest('./dist'));
});

// move the templates to dist
gulp.task('build.templates', function() {
  gulp.src(templates)
    .pipe(plugins.flatten())
    .pipe(gulp.dest('./dist/templates'));
});

/**
 * Genearate docs.
 */

// create the docs
gulp.task('docs', ['clean.docs'], function() {
  return gulp.src('./src/**/*.js')
    .pipe(plugins.jsdoc('./docs'));
});

/**
 * Tests
 */

// Run test once and exit
gulp.task('test', function (done) {
  runSequence('test.jshint', 'test.src', done);
});

// check jshint
gulp.task('test.jshint', function () {
  return gulp.src(lintFiles)
    .pipe(plugins.plumber())
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'));
});

// test sources
gulp.task('test.src', function (done) {
  karma.start({
    configFile: __dirname + '/karma-src.conf.js',
    singleRun: true
  }, done);
});

// coveralls
gulp.task('coveralls', function () {
  return gulp.src('coverage/**/lcov.info')
    .pipe(plugins.coveralls());
});


/**
 * Demo
 */

gulp.task('demo', function() {
  gulp.src(rootDirectory)
    .pipe(plugins.webserver({
      livereload: true,
      open: '/example/index.html'
  }));
});

/**
 * Clean tasks
 */

// Clean docs directory
gulp.task('clean.docs', function() {
  return del(['docs']);
});

// Clean build directory if exists
gulp.task('clean.build', function() {
  return del(['build']);
});

/**
 * Watch
 */

gulp.task('watch', function () {
  // Watch JavaScript files
  gulp.watch(sourceFiles, ['test']);
});

/**
 * Default taks
 */

gulp.task('default', function () {
  runSequence('test', 'watch');
});
