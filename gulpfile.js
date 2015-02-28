/* jshint browser: false, node: true */

'use strict';

var gulp = require('gulp');
var annotate = require('gulp-ng-annotate');
var bump = require('gulp-bump');
var concat = require('gulp-concat');
var fileSort = require('gulp-angular-filesort');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');

var bowerJSON = require('./bower.json');

var templateOptions = {
    module: 'zenubu.ngStrap',
    root: 'zenubu.ngStrap'
};

gulp.task('default', ['lint', 'test', 'build']);

gulp.task('test', ['lint']);

gulp.task('build', ['templates', 'js', 'lint', 'bumpVersion']);

gulp.task('js', ['templates'], function () {
    return gulp.src(['src/**/*.js', '.tmp/**/*.js'])
        .pipe(fileSort())
        .pipe(annotate())
        .pipe(concat('zenubu.ngStrap.js'))
        .pipe(gulp.dest('./'))
        .pipe(uglify())
        .pipe(rename('zenubu.ngStrap.min.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('templates', function () {
    return gulp.src(['src/**/*.tpl.html'])
        .pipe(templateCache('templates.js', templateOptions))
        .pipe(gulp.dest('./.tmp'));
});

gulp.task('lint', function () {
    return gulp.src(['./src/**/*.js', './gulpfile.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('bumpVersion', function(){
    return gulp.src('./*.json')
        .pipe(bump({version: bowerJSON.version}))
        .pipe(gulp.dest('./'));
});