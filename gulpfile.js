var gulp = require('gulp');
var ts = require('gulp-typescript');
var babel = require('gulp-babel');
var rename = require('gulp-rename');
var del = require('del');
var symlink = require('gulp-sym');
var path = require('path');

gulp.task('clean', function() {
  return del([
    '**/*.js.map',
    'app/api/**/*.js',
    'lib/**/*.js',
    'routes/**/*.js',
    'scripts/**/*.js',
  ]);
});

gulp.task('tsc', function() {
  var tsProject = ts.createProject(__dirname + '/tsconfig.json');
  return gulp.src([
      'app/api/**/*.ts',
      'lib/**/*.ts',
      'routes/**/*.ts',
    ], {
      base: './'
    })
    .pipe(ts(tsProject))
    .pipe(babel({
      "presets": "es2015"
    }))
    .pipe(rename(function(path) {
      path.extname = '.js';
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('tsc-scripts', ['tsc'], function() {
  var tsProject = ts.createProject(path.resolve(__dirname, 'scripts/tsconfig.json'));
  return gulp.src([
      'scripts/**/*.ts',
    ], {
      base: './'
    })
    .pipe(ts(tsProject))
    .pipe(rename(function(path) {
      path.extname = '.js';
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['tsc', 'tsc-scripts']);
