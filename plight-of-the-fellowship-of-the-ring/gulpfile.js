var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('pack-js', function () {
    return gulp.src(['graph.js', 'priority-queue.js', 'utility.js'])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['pack-js']);
