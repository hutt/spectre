const {series, watch, src, dest, parallel, task} = require('gulp');
const pump = require('pump');
const path = require('path');
const releaseUtils = require('@tryghost/release-utils');
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
        forceInclude: ['/\.youtube\-player[.\w\s]*/g', '/\.gh\-navigation[\.\-\w\s]*/g', '/\#gh\-navigation/g', '/\.gh\-burger/g', '/\.gh\-icon\-button/g', '/\.gh\-main/g', '/\.gh\-inner/g', '/h1/g'],
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
        { name: 'post', url: 'https://spectre.hutt.io/blog/sample-post/' },
        { name: 'page', url: 'https://spectre.hutt.io/style-guide/' },
        { name: 'tag', url: 'https://spectre.hutt.io/tag/getting-started/' },
        { name: 'index', url: 'https://spectre.hutt.io/blog/' }
    ];

    categories.forEach(category => {
        generateCriticalCSS(done, category.name, category.url);
    });
}

function js(done) {
    pump([
        src([
            // pull in lib files first so our own code can depend on it
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

exports.release = async () => {
    // @NOTE: https://yarnpkg.com/lang/en/docs/cli/version/
    // require(./package.json) can run into caching issues, this re-reads from file everytime on release
    let packageJSON = JSON.parse(fs.readFileSync('./package.json'));
    const newVersion = packageJSON.version;

    if (!newVersion || newVersion === '') {
        console.log(`Invalid version: ${newVersion}`);
        return;
    }

    console.log(`\nCreating release for ${newVersion}...`);

    const githubToken = process.env.GST_TOKEN;

    if (!githubToken) {
        console.log('Please configure your environment with a GitHub token located in GST_TOKEN');
        return;
    }

    try {
        const result = await inquirer.prompt([{
            type: 'input',
            name: 'compatibleWithGhost',
            message: 'Which version of Ghost is it compatible with?',
            default: '5.0.0'
        }]);

        const compatibleWithGhost = result.compatibleWithGhost;

        const releasesResponse = await releaseUtils.releases.get({
            userAgent: 'Source',
            uri: `https://api.github.com/repos/${REPO_READONLY}/releases`
        });

        if (!releasesResponse || !releasesResponse) {
            console.log('No releases found. Skipping...');
            return;
        }

        let previousVersion = releasesResponse[0].tag_name || releasesResponse[0].name;
        console.log(`Previous version: ${previousVersion}`);

        const changelog = new releaseUtils.Changelog({
            changelogPath: CHANGELOG_PATH,
            folder: path.join(process.cwd(), '.')
        });

        changelog
            .write({
                githubRepoPath: `https://github.com/${REPO}`,
                lastVersion: previousVersion
            })
            .sort()
            .clean();

        const newReleaseResponse = await releaseUtils.releases.create({
            draft: true,
            preRelease: false,
            tagName: 'v' + newVersion,
            releaseName: newVersion,
            userAgent: 'Source',
            uri: `https://api.github.com/repos/${REPO}/releases`,
            github: {
                token: githubToken
            },
            content: [`**Compatible with Ghost ≥ ${compatibleWithGhost}**\n\n`],
            changelogPath: CHANGELOG_PATH
        });
        console.log(`\nRelease draft generated: ${newReleaseResponse.releaseUrl}\n`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
