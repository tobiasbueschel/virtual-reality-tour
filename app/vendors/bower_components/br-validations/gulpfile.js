var gulp = require('gulp'),
	path = require('path'),
	jshintReporter = require('jshint-stylish'),
	plugins = require('gulp-load-plugins')({
		config: path.join(__dirname, 'package.json')
	}),
	pkg = require('./package.json'),
	fs = require('fs');

var config = {
	src: {
		files: 'src/**/*.js',
		release: 'releases/br-validations.js'
	},
	test: {
		files: 'test/**/*.test.js'
	}
}

gulp.task('build', function(done) {
	var pkg = require('./package.json');

	var header = ['/**',
		' * <%= pkg.name %>',
		' * <%= pkg.description %>',
		' * @version v<%= pkg.version %>',
		' * @link <%= pkg.homepage %>',
		' * @license <%= pkg.license %>',
		' */',
		'(function (root, factory) {',
		'	if (typeof define === \'function\' && define.amd) {',
		'		// AMD. Register as an anonymous module.',
		'		define([], factory);',
		'	} else if (typeof exports === \'object\') {',
		'		// Node. Does not work with strict CommonJS, but',
		'		// only CommonJS-like environments that support module.exports,',
		'		// like Node.',
		'		module.exports = factory();',
		'	} else {',
		'		// Browser globals (root is window)',
		'		root.BrV = factory();',
		'	}',
		'}(this, function () {',
		''].join('\n');

	var footer = ['',
		'	return {',
		'		ie: IE,',
		'		cpf: CPF,',
		'		cnpj: CNPJ,',
		'		pis: PIS',
		'	};',
		'}));'].join('\n');

	gulp.src(config.src.files)
		.pipe(plugins.concat('br-validations.js'))
		.pipe(plugins.header(header, {pkg: pkg}))
		.pipe(plugins.footer(footer))
		.pipe(plugins.concat('br-validations.js'))
		.pipe(gulp.dest('./releases'))
		.pipe(plugins.uglify())
		.pipe(plugins.concat('br-validations.min.js'))
		.pipe(gulp.dest('./releases'));

	done();
});

gulp.task('jshint', function(done) {
	gulp.src(config.src.files)
	.pipe(plugins.jshint('.jshintrc'))
	.pipe(plugins.jshint.reporter(jshintReporter));
	done();
});

function mochaRunnerFactory(reporter) {
	return plugins.mocha({
		reporter: reporter || 'spec'
	});
}

gulp.task('runtestdot', ['jshint', 'build'], function() {
	gulp.src(config.test.files, {read: false})
	.pipe(mochaRunnerFactory('dot'))
	.on('error', console.warn.bind(console));
});

gulp.task('runtest', ['jshint', 'build'], function() {
	gulp.src(config.test.files, {read: false})
	.pipe(mochaRunnerFactory())
	.on('error', console.warn.bind(console));
});

gulp.task('default', ['jshint', 'build', 'runtestdot'], function() {
    gulp.watch(config.src.files, ['jshint', 'build', 'runtestdot']);
});

gulp.task('test', ['jshint', 'build', 'runtest']);

gulp.task('test-watch', ['jshint', 'build', 'runtest'], function() {
    gulp.watch(config.src.files, ['jshint', 'build', 'runtest']);
});

gulp.task('test-coverage', ['jshint'], function(done) {
	gulp.src(config.src.release)
	.pipe(plugins.istanbul())
	.pipe(plugins.istanbul.hookRequire())
	.on('finish', function() {
		gulp.src(config.test.files, {
			cwd: process.env.PWD,
			read: false
		})
		.pipe(mochaRunnerFactory('spec'))
		.pipe(plugins.istanbul.writeReports())
		.on('end', function() {
			if (process.env.TRAVIS) {
				gulp.src('./coverage/**/lcov.info')
				.pipe(plugins.coveralls())
				.on('end', done);
			} else {
				done();
			}
		});
	});
});

gulp.task('changelog', function(done) {
	var changelog = require('conventional-changelog');

	var options = {
		repository: pkg.homepage,
		version: pkg.version,
		file: path.join(__dirname, 'CHANGELOG.md')
	};

	changelog(options, function(err, log) {
		if (err) {
			throw err;
		}

		fs.writeFile(options.file, log, done);
	});
});
