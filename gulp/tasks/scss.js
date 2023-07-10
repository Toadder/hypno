import rename from 'gulp-rename';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';

import autoprefixer from 'gulp-autoprefixer';
import cleanCss from 'gulp-clean-css';
import groupCssMediaQueries from 'gulp-group-css-media-queries';
import sassGlob from 'gulp-sass-glob';

const sass = gulpSass(dartSass);

const scss = () => {
	return (
		app.gulp
			.src(app.path.src.scss, {
				sourcemaps: app.isDev,
			})
			.pipe(
				app.plugins.plumber(
					app.plugins.notify.onError({
						title: 'SCSS',
						message: 'Error: <%= error.message %>',
					})
				)
			)
			.pipe(sassGlob())
			.pipe(app.plugins.replace(/@img\//g, '..img/'))
			.pipe(
				sass({
					outputStyle: 'expanded',
				})
			)
			.pipe(app.plugins.if(app.isBuild, groupCssMediaQueries()))
			.pipe(
				app.plugins.if(
					app.isBuild,
					autoprefixer({
						grid: true,
						overrideBrowsersList: ['last 3 versions'],
						cascade: true,
					})
				)
			)
			// Создание не сжатого дубля стилей
			.pipe(app.gulp.dest(app.path.build.css))
			.pipe(app.plugins.if(app.isBuild, cleanCss()))
			.pipe(
				rename({
					extname: '.min.css',
				})
			)
			.pipe(app.gulp.dest(app.path.build.css))
			.pipe(app.plugins.browsersync.stream())
	);
};

export default scss;
