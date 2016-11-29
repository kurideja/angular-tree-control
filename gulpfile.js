var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('scripts', ['templateCache'], function() {
  return gulp.src(['./src/*.module.js', './.tmp/**/*.js', './src/!(*module)*.js'])
    .pipe(concat('angular-tree-control.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('templateCache', function () {
  var templateCache = require('gulp-angular-templatecache');
  return gulp.src('src/**/*.html')
    .pipe(templateCache('treeControl.templates.module.js',
      {
        root: 'src/',
        module: 'treeControl.templates'
      }
    ))
    .pipe(gulp.dest('./.tmp/'));
});
