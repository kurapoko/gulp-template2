'use strict';

// 初期設定(プラグインの読み込み)
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const sassGlob = require('gulp-sass-glob');
const ejs = require('gulp-ejs');
const fs = require('fs');
const rename = require('gulp-rename');
const prefix  = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
const imageminJpg = require('imagemin-jpeg-recompress');
const imageminPng = require('imagemin-pngquant');
const imageminGif = require('imagemin-gifsicle');
const imageminSvg = require('imagemin-svgo');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const prettify = require('gulp-prettify');
const browserSync = require('browser-sync').create();

// アセットディレクトリ(状況に応じて書き換え)
const path = 'dist';
const Build = 'build';
const Assets = 'assets';
const imgDir = 'images';


// SASSの設定
gulp.task('sass', function (done) {
    gulp.src(['./src/scss/**/*.scss', '!./src/scss/**/_*.scss'])
    .pipe(sassGlob())
    // エラーしても処理を止めない。エラーが発生した場合はデスクトップ通知を行う。
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    // 開発環境でのみソースマップを作成
    .pipe(sourcemaps.init())
    // 本番環境でのみcssを最小化
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(prefix({
      cascade: false,
      grid: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./' + path + '/' + Assets + '/css/'))
    // CSSファイルのみリロードする
    .pipe(browserSync.stream())
    done();
});

// JavaScriptの設定
gulp.task('js', function(done) {
  gulp.src('./src/js/modules/**/*.js')
  .pipe(plumber())
  .pipe(babel({presets: ['@babel/env']}))
  .pipe(concat('script.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./' + path + '/' + Assets + '/js/'))
  done();
});

// EJSの設定
gulp.task('ejs', function (done) {
    const json = JSON.parse(fs.readFileSync('./src/pages.json')),
      pages = json.pages,
      temp = "src/html/temp.ejs";
      let i = 0;

    while (i < pages.length) {
      let name = pages[i].name,
          url = pages[i].url,
          contents = pages[i].contents;
      gulp
      .src(temp)
      .pipe(plumber())
      .pipe(ejs({jsonData: pages[i]},{rmWhitespace: true}))
      .pipe(prettify({
        indent_size: 2,
        indent_with_tabs: true
      }))
      .pipe(rename(name + '.html'))
      .pipe(gulp.dest('./' + path  + url))
      .pipe(browserSync.stream())

      i++;
    }

    done();
});

//画像圧縮(jpg|jpeg|png|gif)
gulp.task('imagemin', (done) => {
  gulp.src(['./src/images/**/*.{jpg,jpeg,png,gif}'])
  .pipe(imagemin([
    imageminPng(),
    imageminJpg(),
    imageminGif({
        interlaced: false,
        optimizationLevel: 3,
        colors:180
    }),
    imageminSvg()
  ]
  ))
  .pipe(gulp.dest('./' + path + '/' + Assets + '/' + imgDir + '/'))
  done();
});

// Browser-syncの設定
// ブラウザ画面への通知を無効化
gulp.task('sync', () => {
  browserSync.init({
    server: {
      baseDir: './' + path + '/',
      index: 'index.html'
    },
    open: 'external',
    reloadOnRestart: true
  });
});

gulp.task('reload', () => {
  browserSync.reload();
});

gulp.task('watch', () => {
  gulp.watch(['./src/scss/**/*.scss'], gulp.task('sass'));
  gulp.watch(['./src/js/**/*.js'], gulp.task('js'));
  gulp.watch(['./src/html/**/*.ejs'], gulp.task('ejs'));
  gulp.watch(['./' + Build + '/**/*.html'], gulp.task('reload'));
});

gulp.task('default', gulp.series(gulp.parallel('sass', 'ejs', 'sync', 'js', 'reload', 'watch')));