// Основной модуль
import gulp from "gulp";
// Импорт путей
import path from "./gulp/config/path.js";
// Импорт задачи
import copy from "./gulp/tasks/copy.js";
import reset from "./gulp/tasks/reset.js";
import html from "./gulp/tasks/html.js";
import plugins from "./gulp/config/plugins.js";
import server from "./gulp/tasks/server.js";
import scss from "./gulp/tasks/scss.js";
import js from "./gulp/tasks/js.js";
import img from "./gulp/tasks/images.js";
import zip from "./gulp/tasks/zip.js";
import ftp from "./gulp/tasks/ftp.js";
import { ttfToWoff, fontsStyle } from "./gulp/tasks/fonts.js";

// Передаём значения в глобальную переменную
global.app = {
  isBuild: process.argv.includes("--build"),
  isDev: !process.argv.includes("--build"),
  path: path,
  gulp: gulp,
  plugins: plugins,
};

// Наблюдатель за изменениями файлов
function watcher() {
  gulp.watch(path.watch.files, copy);
  //gulp.series(html, ftp) --> прописать вместо html, при изменении они выгружались на сервер
  // с остальныеми аналогично
  gulp.watch(path.watch.html, html);
  gulp.watch(path.watch.scss, scss);
  gulp.watch(path.watch.js, js);
  gulp.watch(path.watch.img, img);
}

// Последовательная обработка шрифтов
const fonts = gulp.series(ttfToWoff, fontsStyle);

const mainTasks = gulp.series(fonts, gulp.parallel(copy, html, scss, js, img));

// Построение сценариев выполнения задач
const dev = gulp.series(reset, mainTasks, gulp.parallel(watcher, server));
const build = gulp.series(reset, mainTasks);
const deployZip = gulp.series(reset, mainTasks, zip);
const deployFtp = gulp.series(reset, mainTasks, ftp);

// Эскпорт сценариев
export { dev };
export { build };
export { deployZip };
export { deployFtp };

// Выполнения сценария по умолчанию
gulp.task("default", dev);
