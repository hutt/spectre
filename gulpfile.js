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

// fetch für externes cards-Stylesheet
const axios = require('axios');

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

async function generateCriticalCSS(done, category, url) {
    try {
        // Fetch the external CSS
        const externalCssResponse = await axios.get('http://hegel.hutt/public/cards.min.css');
        const externalCss = externalCssResponse.data;

        // Read the main stylesheet
        const mainCss = fs.readFileSync('assets/built/screen.css', 'utf8');

        // Combine the stylesheets
        const combinedCss = mainCss + '\n' + externalCss;

        // Generate critical CSS using the combined stylesheet
        const criticalCss = await penthouse({
            url: url,
            cssString: combinedCss,  // Use cssString instead of css file path
            width: 390,
            height: 1280,
            keepLargerMediaQueries: true,
            forceInclude: ['/\.youtube\-player[.\w\s]*/g', '/\.gh\-navigation[\.\-\w\s]*/g', '/\#gh\-navigation/g', '/\.gh\-content[\.\-\>\*\+\[\]\w\s]*/g', '/\.kg\-blockquote\-alt/g', '/\.kg\-header\-card/g', '/\.kg\-header\-card\-content/g', '/\.kg\-header\-card\-image/g'],
            renderWaitTime: 1000,
            blockJSRequests: false,
        });

        // Process the critical CSS
        const regex = /url\((?:'|"|)(\.\.\/)([^)'"]+)(?:'|"|)\)/g;
        const cleanedCss = criticalCss.replace(regex, (match, p1, p2) => `url('/assets/${p2}')`);
        fs.writeFileSync(`partials/css/${category}.critical.css.hbs`, `<style>\n${cleanedCss}\n</style>`);
    } catch (err) {
        console.error(err);
        done(err);
    } finally {
        done();
    }
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
            'assets/js/*.js',
            '!assets/js/lib/opentype.js', // exclude opentype.js
            '!assets/js/lib/text-to-svg.js', // exclude text-to-svg.js
            '!assets/js/dielinke-logo-generator.js' // exclude dielinke-logo-generator.js
        ], {sourcemaps: true}),
        concat('source.js'),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));

    // handle dielinke-logo-generator.js seperately
    pump([
        src([
            'assets/js/lib/opentype.js',
            'assets/js/lib/text-to-svg.js',
            'assets/js/dielinke-logo-generator.js'
        ], {sourcemaps: true}),
        concat('dielinke-logo-generator.js'),
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
            '!grafik', '!grafik/**',
            '!yarn-error.log',
            '!yarn.lock',
            '!gulpfile.js'
        ]),
        zip(filename),
        dest('dist/')
    ], handleError(done));
}

const cssWatcher = () => watch(['assets/css/screen.css', 'assets/css/print.css'], css);
//const criticalCssWatcher = () => watch('assets/css/screen.css', critical);
const jsWatcher = () => watch('assets/js/**', js);
const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const watcher = parallel(cssWatcher, jsWatcher, hbsWatcher);
const build = series(css, js, critical);

exports.build = build;
exports.zip = series(build, zipper);
exports.critical = critical;
exports.default = series(build, serve, watcher);
