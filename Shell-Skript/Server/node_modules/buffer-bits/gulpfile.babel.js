'use strict';

let gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');
var babel = require('gulp-babel');
var path = require('path');
var dest = 'lib';

const dirs = {
    src: 'src/**/*.js',
    dest: dest
};

gulp.task('clean', function () {
    return gulp.src(dirs.dest, { read: false })
        .pipe(clean());
});

gulp.task('installResources', ['clean'], function () {
    // all other files
    return gulp.src(['src/**/!(*.js)', '!logs/'])
        .pipe(gulp.dest(dirs.dest));
});

gulp.task('install', ['clean', 'installResources'], function () {
    return gulp.src([dirs.src])
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['latest'] }))
        .pipe(sourcemaps.write('.', { sourceRoot: path.join(__dirname, 'src') }))
        .pipe(gulp.dest(dirs.dest));
});

gulp.task('installProd', ['clean', 'installResources'], function () {
    return gulp.src([dirs.src])
        .pipe(babel({ presets: ['latest'] }))
        .pipe(gulp.dest(dirs.dest));
});



gulp.task('default', ['clean', 'installResources', 'install']);
gulp.task('prod', ['clean', 'installResources', 'installProd'])