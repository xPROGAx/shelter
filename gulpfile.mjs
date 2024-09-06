import gulp from 'gulp';
import browserSync from 'browser-sync';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import { minify } from 'html-minifier-terser';
import imagemin from 'gulp-imagemin';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import plumber from 'gulp-plumber';
import concat from 'gulp-concat';
import through2 from 'through2';

const sass = gulpSass(dartSass);

// Задача для компиляции SASS
gulp.task('styles', function() {
    return gulp.src("src/sass/**/*.+(scss|sass)")
        .pipe(plumber())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({ suffix: '.min', prefix: ''}))
        .pipe(autoprefixer())
        .pipe(cleanCSS({compatibility: 'ie8'}   ))
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream());
});

// Задача для минификации JS
gulp.task('scripts', function() {
    return gulp.src("src/js/**/*.js")
        .pipe(plumber())
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("dist/js"))
        .pipe(browserSync.stream());
});

// Задача для минификации HTML
gulp.task('html', function () {
    return gulp.src("src/*.html")
        .pipe(through2.obj(async function (file, _, cb) { // Использование through2
            if (file.isBuffer()) {
                try {
                    const minified = await minify(file.contents.toString(), {
                        collapseWhitespace: true,
                        removeComments: true
                    });
                    file.contents = Buffer.from(minified);
                } catch (err) {
                    cb(err);
                    return;
                }
            }
            cb(null, file);
        }))
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream());
});

// Задача для оптимизации изображений
gulp.task('images', function() {
    return gulp.src("src/assets/img/**/*", {
        encoding: false
        })
        .pipe(imagemin())
        .pipe(gulp.dest("dist/assets/img"));
});

// Задача для запуска сервера и наблюдения за изменениями
gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "dist"
        }
    });
    gulp.watch("src/sass/**/*.+(scss|sass)", gulp.series('styles'));
    gulp.watch("src/js/**/*.js", gulp.series('scripts'));
    gulp.watch("src/*.html", gulp.series('html'));
    gulp.watch("src/assets/img/**/*", gulp.series('images'));
});

// Задача по умолчанию
gulp.task('default', gulp.series('styles', 'scripts', 'html', 'images', 'server'));
//npm update --save