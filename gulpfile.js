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
    'models/**/*.js',
    'app/api/**/*.js',
    'lib/**/*.js',
    'routes/**/*.js',
    'scripts/**/*.js',
    'frontend/app/**/*.js',
    'frontend/app/**/*.es6'
  ]);
});

gulp.task('copy-models-frontend', function() {
  gulp.src('./models/**/*.ts')
    .pipe(gulp.dest('./frontend/app/models'));
});

gulp.task('watch-frontend', function() {
  gulp.watch([
    'frontend/**/*.ts',
    '!frontend/app/models/*.ts',
  ], ['tsc-frontend']);
});

gulp.task('tsc-frontend-es6', ['copy-models-frontend'], function() {
  var tsProject = ts.createProject(path.join(__dirname, 'frontend', 'tsconfig.json'));
  return gulp.src([
      'frontend/**/*.ts'
    ], {
      base: './'
    })
    .pipe(ts(tsProject))
    .pipe(rename(function(path) {
      path.extname = '.es6';
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('tsc-frontend-babel', ['tsc-frontend-es6'], function() {
  return gulp.src([
      'frontend/**/*.es6'
    ], {
      base: './'
    })
    .pipe(babel({
      "presets": ["es2015"],
      "plugins": ["transform-es2015-modules-systemjs"]
    }))
    .pipe(rename(function(path) {
      path.extname = '.js';
    }))
    .pipe(gulp.dest('.'));
});


gulp.task('tsc-frontend', ['copy-models-frontend'], function() {
  var tsProject = ts.createProject(path.join(__dirname, 'frontend', 'tsconfig.json'));
  return gulp.src([
      'frontend/**/*.ts'
    ], {
      base: './'
    })
    .pipe(ts(tsProject))
    .pipe(babel({
      "presets": ["es2015"],
      "plugins": ["transform-es2015-modules-systemjs"]
    }))
    .pipe(rename(function(path) {
      path.extname = '.js';
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('tsc', function() {
  var tsProject = ts.createProject(path.join(__dirname, 'tsconfig.json'));
  return gulp.src([
      'models/**/*.ts',
      'app/**/*.ts',
      'lib/**/*.ts',
      'routes/**/*.ts',
      'scripts/**/*.ts',
    ], {
      base: './'
    })
    .pipe(ts(tsProject))
    .pipe(babel({
      "presets": ["es2015"]
    }))
    .pipe(rename(function(path) {
      path.extname = '.js';
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['tsc', 'tsc-frontend']);
