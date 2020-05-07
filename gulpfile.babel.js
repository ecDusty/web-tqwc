/* eslint-disable implicit-arrow-linebreak */
/**
 * Dev Packages for running Gulp
 */

// Main Gulp
import {
	src,
	dest,
	parallel,
	series,
	watch
} from 'gulp';

// =======
// Custom Packages
import del from 'del';
import buffer from 'vinyl-buffer';
import fs from 'fs';

// Terminal packages
import notifier from 'node-notifier';
import parseArgs from 'minimist';
import log from 'fancy-log';
import colors from 'ansi-colors';

// Gulp packages
import through from 'through2';
import gulpIf from 'gulp-if';
import cached from 'gulp-cached';
import data from 'gulp-data';
import flatten from 'gulp-flatten';

// CSS packages
import sassInheritance from 'gulp-sass-inheritance';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';

// JS & Browsersync packages
import bro from 'gulp-bro';
import browserSync from 'browser-sync';
import babelify from 'babelify';
import uglify from 'gulp-uglify';

// Image packages
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';

// HTML packages
import htmlmin from 'gulp-htmlmin';
import nunjucksRender from 'gulp-nunjucks-render';


/**
 * Configuration Object
 * any arguments & settings for gulp to run
 */
const config = {
	app: './app/',
	dist: './dist/',
	distApp: './dist/app/',
	env: !parseArgs(process.argv).env ? 'localDev' : parseArgs(process.argv).env,
	browserSyncServerDir: ['./dist'],
	browserSync: {},
	syncWatching: false,
	nunjucks: {}
};


// Config BrowserSync config object
config.browserSync = {
	server: config.browserSyncServerDir,
	https: false,
};

// Website JSON data location
config.nunjucks.data = `${config.app}pages/data/`;

// Nunjucks settings
config.nunjucks.templates = [`${config.app}templates`];

/**
 * Terminal Log Configuration
 * styles which will make the Gulp easier to read
 */
log(colors.cyan('config.env: '), config.env);
log(colors.cyan('config.browserSync: '), config.browserSync);


/**
 * All Function Names Declaration
 * @nada - Empty function that always the stream content to continue
 * @initBrowserSync - Initializes BrowserSync, creating a local server
 * 		to host the development files, which gives you the ability to
 * 		test your website build.
 * @sass - Compiles all the root SASS files, to produce the usable CSS.
 * @js - Compiles all the root JS files, to produce the usable main.js file.
 * 		This also initiates the BrowserSync functionality (Creating a local hosted site).
 * @jsVendor - Takes all the vendor js code and place in within the vendor folder.
 * 		No compiling or anything is done, it just moves the files. The reason for
 * 		this is because the scripts are already minified, and just need to be sorted.
 * @images - For 'localDev', this moves images to 'dist/img/' folder. The reason
 * 		for this is to save, and shorten processing time. With
 * 		'production', the images will be minified and moved.
 * @html - Compiles all the nunjucks templates into usable HTML pages, and
 * 		places them into the base 'dist/' folder for hosting.
 * @fonts - Moves all fonts to base font folder. 'dist/fonts'.
 * @cleanUp - Deletes the dist folder. Helpful to ensure all files are only the
 * 		most updated version, and saving space when not actively developing.
 * @watchFiles - Watch for source file changes, and trigger a recreate & resync.
 */


/**
 * In case of no action needed, run nada()
 */
const nada = () => through.obj();


/**
 * Server
 */
const initBrowserSync = () => browserSync.init(config.browserSync);


/**
 * Styles
 */
const css = () =>
	src(`${config.app}/**/*.scss`)
		.pipe(gulpIf(global.syncWatching, cached('css')))
		.pipe(sassInheritance({
			dir: `${config.app}`
		}))
		.pipe(
			(config.env === 'production')
				? nada()
				: sourcemaps.init()
		)
		.pipe(sourcemaps.identityMap())
		.pipe(sass
			.sync({
				sourceComments: true,
				includePaths: ['node_modules/'],
			})
			.on('error', function errorHandler(err) {
				log(colors.red(`ERROR (sass): ${err.message}`));
				notifier.notify({
					title: 'Compile Error',
					message: err.message,
					sound: true,
				});
				this.emit('end');
			}))
		.pipe(autoprefixer())
		.pipe(config.env === 'production'
			? sass({ outputStyle: 'compressed', })
			: nada())
		.pipe(config.env === 'production'
			? nada()
			: sourcemaps.write())
		.pipe(flatten())
		.pipe(dest(`${config.distApp}css/`))
		.pipe(config.env === 'localDev'
			? browserSync.stream()
			: nada());


/**
 * JAVASCRIPT COMPILING
 */
const jsVendor = () =>
	src(`${config.app}/vendor/**/*.{js,min.js}`)
		.pipe(gulpIf(global.syncWatching, cached('jsVendor')))
		.pipe(buffer())
		.pipe((config.env === 'production')
			? uglify()
			: nada())
		.pipe(dest(`${config.distApp}vendor/`))
		.pipe(config.env === 'localDev'
			? browserSync.stream()
			: nada());

const js = () =>
	src(`${config.app}/js/*.js`)
		.pipe(bro({
			debug: true,
			transform: [
				babelify.configure({
					presets: [
						[
							'@babel/preset-env',
							{ useBuiltIns: 'usage' }
						]
					]
				})
			],
		}))
		.pipe(gulpIf(global.syncWatching, cached('js')))
		.pipe(buffer())
		.pipe((config.env === 'production')
			? uglify()
			: nada())
		.pipe(dest(`${config.distApp}js/`))
		.pipe(config.env === 'localDev'
			? browserSync.stream()
			: nada());


/**
 * IMAGE COMPILING
 * Images are only minified for production, not local development
 */
const images = () =>
	src(`${config.app}/**/*.{jpg,jpeg,svg,png,gif}`)
		.pipe(config.env === 'localDev'
			? imagemin({
				progressive: true,
				svgoPlugins: [{
					removeViewBox: false,
				}],
				use: [pngquant()],
			})
			: nada())
		.pipe(flatten())
		.pipe(dest(`${config.distApp}img/`))
		.pipe(config.env === 'localDev'
			? browserSync.stream()
			: nada());

const favicon = () =>
	src(`${config.app}/**/*.ico`)
		.pipe(flatten())
		.pipe(dest(`${config.distApp}img/favicon/`))
		.pipe(config.env === 'localDev'
			? browserSync.stream()
			: nada());

/**
 * HTML compiling
 * The preprocessor removes development sections
 */
const htmlDataJSON = () => {
	const mainData = JSON.parse(fs.readFileSync(`${config.nunjucks.data}site.json`));
	return mainData;
};

const html = () =>
	src(`${config.app}/pages/**/*.html`) // .pipe(flatten())
		.pipe(data(htmlDataJSON()))
		.pipe(nunjucksRender({
			path: config.nunjucks.templates
		}))
		.pipe(config.env === 'localDev' ? nada() : htmlmin({ collapseWhitespace: true }))
		.pipe(dest(`${config.dist}`))
		.pipe(config.env === 'localDev' ? browserSync.stream() : nada());


/**
 * Fonts
 */
const fonts = () =>
	src(`${config.app}/**/*.{eot,ttf,woff,woff2}`)
		.pipe(flatten())
		.pipe(dest(`${config.distApp}fonts/`))
		.pipe(config.env === 'localDev' ? browserSync.stream() : nada());


/**
 * Clean up files & folders
 */
const cleanUp = () => del(`${config.dist}`);


/**
* Watch
*/
function watchFiles() {
	global.syncWatching = true;
	watch([
		`${config.app}pages/**/*.html`,
		`${config.app}templates/*.njk`,
		`${config.app}templates/**/*.njk`,
		`${config.app}templates/**/**/*.njk`,
		`${config.app}templates/*.nunjucks`,
		`${config.nunjucks.data}*.json`
	],
	series(html));
	watch(`${config.app}**/*.{jpg,jpeg,svg,png,gif}`, series(images));
	watch(`${config.app}**/*.ico`, series(favicon));
	watch(`${config.app}**/*.scss`, series(css));
	watch(`${config.app}**/*.js`, series(js, jsVendor));
}


/**
 * Gulp executables
 * These are the gulp functions
 */

// Default
exports.default = series(
	cleanUp,
	parallel(css, js, jsVendor, html, images, favicon),
	parallel(watchFiles, initBrowserSync)
);

// Live site builder
exports.production = series(
	cleanUp,
	parallel(css, js, jsVendor, html, images, fonts)
);

// HTML generator
exports.html = series(
	cleanUp,
	parallel(html)
);

// Clean up production
exports.cleanUp = series(cleanUp);

// Create CSS files
exports.sass = series(css);

// Create JS Files
exports.js = series(js, jsVendor);
exports.jsV = series(jsVendor);
