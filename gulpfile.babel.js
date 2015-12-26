'use strict';

import gulp        from 'gulp';
import browserSync from 'browser-sync';
import path        from 'path';
import sourcemaps  from 'gulp-sourcemaps';
import source      from 'vinyl-source-stream';
import buffer      from 'vinyl-buffer';
import browserify  from 'browserify';
import watchify    from 'watchify';
import babel       from 'babelify';
import uglify      from 'gulp-uglify';
import shell       from 'gulp-shell';

const dir = {
    dist: path.resolve(__dirname, 'dist'),
    demo: path.resolve(__dirname, 'demo'),
    lib : path.resolve(__dirname, 'lib'),
    main: path.resolve(__dirname, 'index.js')
};

let compile = (watch) => {
    let bundler = watchify(browserify(dir.main, {debug: true}))
        .transform(babel, {presets: ['es2015']});

    let rebundle = () => {
        bundler.bundle()
            .on('error', (e) => {console.error(e);})
            .pipe(source('uploader.min.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(dir.dist))
            .on('end', () => {
                browserSync.reload();
            });
    };

    if (watch) {
        bundler.on('update', () => rebundle());
    }
    rebundle();
};

gulp.task('compile', () => {
    return compile();
});

gulp.task('watch', () => {
    compile(true);
    gulp.watch(path.resolve(dir.demo, '**/*'), ['reload']);
});

gulp.task('reload', () => {
    browserSync.reload();
});

gulp.task('server', ['serve'], shell.task('node server/index.js'));

gulp.task('serve', ['watch'], () => {
    browserSync.init({
        server: {
            baseDir: ['demo', 'dist']
        },
        port: 4444,
        ui: {
            port: 4000
        }
    });
});

gulp.task('default', ['server']);