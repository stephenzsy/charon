var gulp = require('gulp');
var ts = require('gulp-typescript');
var babel = require('gulp-babel');
var rename = require('gulp-rename');

gulp.task('tsc', function() {
  var tsProject = ts.createProject(__dirname + '/tsconfig.json');
  return gulp.src([
      'lib/**/*.ts',
      'routes/**/*.ts',
    ], {
      base: './'
    })
    .pipe(ts(tsProject))
    .pipe(rename(function(path) {
      path.extname = '.babel';
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('tsc-frontend', function() {
  var tsProject = ts.createProject(__dirname + '/app/frontend/tsconfig.json');
  return gulp.src([
      'app/frontend/**/*.ts'
    ], {
      base: './app/frontend/'
    })
    .pipe(ts(tsProject))
    .pipe(gulp.dest('public/javascripts/app'));
});

gulp.task('babel', ['tsc'], function() {
  return gulp.src([
      'lib/**/*.babel',
      'routes/**/*.babel',
    ], {
      base: './'
    })
    .pipe(babel())
    .pipe(rename(function(path) {
      path.extname = '.js';
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['tsc', 'tsc-frontend', 'babel']);
