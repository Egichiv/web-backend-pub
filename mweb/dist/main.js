"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const hbs_1 = __importDefault(require("hbs"));
const handlebars_helpers_1 = require("./helpers/handlebars.helpers");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    app.setBaseViewsDir((0, path_1.join)(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    hbs_1.default.registerPartials((0, path_1.join)(__dirname, '..', 'views', 'partials'));
    (0, handlebars_helpers_1.registerHandlebarsHelpers)();
    app.use((req, res, next) => {
        res.locals.layout = 'layouts/main';
        next();
    });
    app.set('view options', {
        extension: 'hbs',
        map: { html: 'hbs' },
    });
    const config = app.get(config_1.ConfigService);
    const port = Number(config.get('PORT')) || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map