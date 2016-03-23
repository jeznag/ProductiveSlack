var gulp = require('gulp');
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
 
gulp.task('transpile', function () {
    return gulp.src('./js/sleepOnIt.js')
        .pipe(babel())
        .pipe(gulp.dest('build'));
});

// Lint Task
gulp.task('lint', function () {
    return gulp.src(['js/**/*.js'])
        // eslint() attaches the lint output to the eslint property 
        // of the file object so it can be used by other modules. 
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console. 
        // Alternatively use eslint.formatEach() (see Docs). 
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on 
        // lint error, return the stream and pipe to failOnError last. 
        .pipe(eslint.failOnError());
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('css'));
});

var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var zip = require('gulp-zip');

function compile(watch) {
  var bundler = watchify(browserify('./js/slackProductivity.js', { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      // .pipe(sourcemaps.init({ loadMaps: false }))
      // .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('zipForRelease', function () {
  return gulp.src('build/*')
        .pipe(zip('sleepOnItBuild.zip'))
        .pipe(gulp.dest('build/release'));
});

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

function runCucumber(flags, cb) {
  var exec = require('child_process').exec;

  exec('node_modules/.bin/babel-node node_modules/.bin/cucumber.js test/features ' + flags, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
  });
}

gulp.task('cucumber', function(cb) {
    runCucumber('', cb);
});

gulp.task('cucumberOnly', function(cb) {
    runCucumber('--tags @only', cb);
});

// Default Task
gulp.task('default', ['lint', 'build', 'cucumber', 'watch']);
