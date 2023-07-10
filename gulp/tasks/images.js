import webp from 'gulp-webp';

const img = () => {
	return app.gulp
		.src(app.path.src.img)
		.pipe(
			app.plugins.plumber(
				app.plugins.notify.onError({
					title: 'IMAGES',
					message: 'Error: <%= error.message %>',
				})
			)
		)
		.pipe(app.plugins.newer(app.path.build.img))
		.pipe(app.plugins.if(app.isBuild, webp()))
		.pipe(app.plugins.if(app.isBuild, app.gulp.dest(app.path.build.img)))
		.pipe(app.plugins.if(app.isBuild, app.gulp.src(app.path.src.img)))
		.pipe(app.plugins.if(app.isBuild, app.plugins.newer(app.path.build.img)))
		.pipe(app.gulp.dest(app.path.build.img))
		.pipe(app.gulp.src(app.path.src.svg))
		.pipe(app.gulp.dest(app.path.build.img))
		.pipe(app.plugins.browsersync.stream());
};

export default img;
