const { src, dest, series, parallel } = require('gulp');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const terser = require('gulp-terser');

// html tasks
function htmlTask() {
  return src('src/*.html')
  .pipe(dest('dist'));
}

//script tasks
function scriptTask() {
  return src('src/js/*.js')
  .pipe(terser())
  .pipe(concat('all.js'))
  .pipe(dest('dist/js'));
}

//style tasks
function styleTask() {
  return src('src/css/*.css')
  .pipe(concat('all.css'))
  .pipe(postcss([cssnano()]))
  .pipe(dest('dist/css'));
}

exports.default = series(htmlTask, parallel(scriptTask, styleTask));