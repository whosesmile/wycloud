var fs = require('fs');
var path = require('path');
var pkg = require('./package.json');
var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat-util');
// gulp-autoprefixer has a bug on sourcemaps, so should use postcss to replace it
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();

var dist = __dirname + '/dist';

var banner = `/*!
* cloud v<%= pkg.version %> (<%= pkg.homepage %>)
* Copyright <%= new Date().getFullYear() %> whosesmile@gmail.com.
* Licensed under the <%= pkg.license %> license
*/
`;

// 编译EXUI LESS
gulp.task('build:less', function() {
  gulp.src(['src/less/*.less'], { base: 'src/less' })
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
    .pipe(concat.header(banner, {
      pkg: pkg,
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.join(dist, 'css')))
    .pipe(browserSync.stream())
    .pipe(cssnano({
      safe: true,
    }))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(gulp.dest(path.join(dist, 'css')));
});

// 同步素材
gulp.task('build:assets', function() {
  gulp.src(['src/**/*', '!src/less/**/*'], { base: 'src' })
    .pipe(gulp.dest(dist))
    .pipe(browserSync.stream());
});

// 监听改变
gulp.task('watch', ['build:less', 'build:assets'], function() {
  gulp.watch('src/less/**/*', ['build:less']);
  gulp.watch(['src/**/*', '!src/less/**/*'], ['build:assets']);
});

// 启动服务
gulp.task('default', ['watch'], function() {
  browserSync.init({
    port: 8080,
    server: {
      baseDir: './dist',
      directory: true,
    },
    startPath: '/templates',
  });
});
