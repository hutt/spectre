const {series, watch, src, dest, parallel, task} = require('gulp');
const pump = require('pump');
const path = require('path');
const inquirer = require('inquirer');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const zip = require('gulp-zip');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const beeper = require('beeper');
const fs = require('fs');

// postcss plugins
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const easyimport = require('postcss-easy-import');

// penthouse laden
const penthouse = require('penthouse');

const REPO = 'hutt/spectre';
const REPO_READONLY = 'hutt/spectre';
const CHANGELOG_PATH = path.join(process.cwd(), '.', 'changelog.md');

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', 'partials/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    pump([
        src('assets/css/screen.css', {sourcemaps: true}),
        postcss([
            easyimport,
            autoprefixer(),
            cssnano()
        ]),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function printCss(done) {
    pump([
        src('assets/css/print.css', {sourcemaps: true}),
        postcss([
            easyimport,
            autoprefixer(),
            cssnano()
        ]),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function generateCriticalCSS(done, category, url) {
    penthouse({
        url: url,
        css: 'assets/built/screen.css',
        width: 390,
        height: 1280,
        keepLargerMediaQueries: true,
        //forceInclude: ['/\.youtube\-player[.\w\s]*/g', '/\.gh\-navigation[\.\-\w\s]*/g', '/\#gh\-navigation/g', '/\.gh\-main/g', '/\.gh\-inner/g', '/\.has\-sans\-title \:is\(\.is\-title,\.gh\-content[\.\-\>\*\+\[\]\w\s]*/g', '/\.gh\-content\>\:is\(hr\,blockquote\,iframe\)/g'],
        forceInclude: ['/\.youtube\-player[.\w\s]*/g', '/\.gh\-navigation[\.\-\w\s]*/g', '/\#gh\-navigation/g', '/\.gh\-content[\.\-\>\*\+\[\]\w\s]*/g', '\.kg\-blockquote\-alt/g'],
        renderWaitTime: 500,
        blockJSRequests: false,
    })
    .then(criticalCss => {
        // remove all @font-face and @import rules
        //const regex = /@font-face\s*\{[^}]*\}|@import\s+url\([^)]+\)[^;]*;/g;
        // replace all links
        const regex = /url\((?:'|"|)(\.\.\/)([^)'"]+)(?:'|"|)\)/g;
        const cleanedCss = criticalCss.replace(regex, (match, p1, p2) => `url('/assets/${p2}')`);
        fs.writeFileSync(`partials/css/${category}.critical.css.hbs`, `<style>\n${cleanedCss}\n</style>`);
    })
    .catch(err => {
        console.error(err);
        done(err);
    })
    .finally(() => {
        done();
    });
}

function critical(done) {
    const categories = [
        { name: 'post', url: 'http://hegel.hutt/blog/die-ost-tour-geht-weiter/' },
        { name: 'page', url: 'http://hegel.hutt/' },
        { name: 'tag', url: 'http://hegel.hutt/tag/gewerkschaft/' },
        { name: 'index', url: 'http://hegel.hutt/blog/' }
    ];

    categories.forEach(category => {
        generateCriticalCSS(done, category.name, category.url);
    });
}

function js(done) {
    pump([
        src([
            'assets/js/lib/*.js',
            'assets/js/*.js'
        ], {sourcemaps: true}),
        concat('source.js'),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    const filename = require('./package.json').name + '.zip';
    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**',
            '!yarn-error.log',
            '!yarn.lock',
            '!gulpfile.js'
        ]),
        zip(filename),
        dest('dist/')
    ], handleError(done));
}

const cssWatcher = () => watch('assets/css/screen.css', css);
const printCssWatcher = () => watch('assets/css/print.css', printCss);
//const criticalCssWatcher = () => watch('assets/css/screen.css', critical);
const jsWatcher = () => watch('assets/js/**', js);
const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const watcher = parallel(cssWatcher, printCssWatcher, jsWatcher, hbsWatcher);
const build = series(css, printCss, js, critical);

exports.build = build;
exports.zip = series(build, zipper);
exports.critical = critical;
exports.default = series(build, serve, watcher);
