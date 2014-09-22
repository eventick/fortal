var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    sass        = require('gulp-sass'),
    compass     = require('gulp-compass'),
    minifyCSS   = require('gulp-minify-css'),
    uglify      = require('gulp-uglify'),
    jade        = require('gulp-jade'),
    livereload  = require('gulp-livereload'), // Livereload plugin needed: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
    tinylr      = require('tiny-lr'),
    express     = require('express'),
    app         = express(),
    marked      = require('marked'),
    path        = require('path'),
    rename      = require('gulp-rename'),
    browserify  = require('gulp-browserify'),
    plumber     = require('gulp-plumber'),
    server      = tinylr();

gulp.task('sass', function() {
  gulp.src('./src/stylesheets/*.sass')
    .pipe(plumber())
    .pipe(compass({
        css: 'dist/stylesheets',
        sass: 'src/stylesheets'
    }))
    .pipe(gulp.dest('test/stylesheets'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist/stylesheets'))
    .pipe(livereload(server))
})

gulp.task('js', function() {
  return gulp.src('src/scripts/main.js')
    .pipe(plumber())
    .pipe( browserify({
      debug: true
    }))
    .pipe( uglify() )
    .pipe( rename('app.js'))
    .pipe( gulp.dest('test/scripts/'))
    .pipe( livereload( server ));
});

gulp.task('images', function() {
  return gulp.src('./src/images/*')
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('templates', function() {
  return gulp.src('src/*.html')
    .pipe(plumber())
    .pipe( gulp.dest('dist/') )
    .pipe( livereload( server ));
});

gulp.task('express', function() {
  app.use(express.static(path.resolve('./test')));
  app.listen(5000);
  gutil.log('Listening on port: 5000');
});

gulp.task('watch', function () {
  server.listen(35790, function (err) {
    if (err) {
      return console.log(err);
    }

    gulp.watch('src/stylesheets/{,*/}*.sass',['sass']);

    gulp.watch('src/scripts/*.js',['js']);

    gulp.watch('src/*.html',['templates']);

  });
});

// Default Task
gulp.task('start', ['js','sass','templates', 'images', 'express','watch']);
gulp.task('dist', ['js','sass','templates', 'images']);
