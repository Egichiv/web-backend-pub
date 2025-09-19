"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getIndexPage(auth) {
        const isAuthenticated = auth === 'true';
        return {
            title: 'Главная',
            currentPage: 'home',
            isMainPage: true,
            isAuthenticated,
            username: isAuthenticated ? 'Администратор' : null,
            posts: [
                {
                    id: 1,
                    title: 'Добро пожаловать на обновленный сайт!',
                    text: 'Мы рады представить вам новую версию сайта с улучшенным дизайном и функциональностью.',
                },
                {
                    id: 2,
                    title: 'Новая функция: добавление цитат',
                    text: 'Теперь каждый пользователь может предложить свою любимую цитату для публикации на сайте.',
                },
            ],
            latestQuotes: [
                {
                    text: 'Жизнь — это то, что происходит с тобой, пока ты строишь планы.',
                    author: 'Джон Леннон',
                },
                {
                    text: 'В конце концов, все будет хорошо. Если все плохо, значит это еще не конец.',
                    author: 'Пауло Коэльо',
                },
            ],
        };
    }
    getQuotesPage(auth, search, author, genre, sort, page = '1') {
        const isAuthenticated = auth === 'true';
        const currentPage = parseInt(page);
        const allQuotes = [
            {
                id: 1,
                author: 'Альберт Эйнштейн',
                text: 'Воображение важнее знания.',
                genre: 'Умная',
                date: new Date('2024-01-15'),
            },
            {
                id: 2,
                author: 'Стив Джобс',
                text: 'Оставайтесь голодными, оставайтесь безрассудными.',
                genre: 'Мотивирующая',
                date: new Date('2024-01-16'),
            },
            {
                id: 3,
                author: 'Марк Твен',
                text: 'Бросить курить легко. Я сам бросал тысячу раз.',
                genre: 'Смешная',
                date: new Date('2024-01-17'),
            },
            {
                id: 4,
                author: 'Конфуций',
                text: 'Выберите себе работу по душе, и вам не придется работать ни одного дня в своей жизни.',
                genre: 'Мотивирующая',
                date: new Date('2024-01-18'),
            },
            {
                id: 5,
                author: 'Оскар Уайльд',
                text: 'Будь собой. Остальные роли уже заняты.',
                genre: 'Реалистичная',
                date: new Date('2024-01-19'),
            },
        ];
        let filteredQuotes = allQuotes;
        if (search) {
            filteredQuotes = filteredQuotes.filter((q) => q.text.toLowerCase().includes(search.toLowerCase()));
        }
        if (author) {
            filteredQuotes = filteredQuotes.filter((q) => q.author.toLowerCase().includes(author.toLowerCase()));
        }
        if (genre) {
            const genreMap = {
                smart: 'Умная',
                motivating: 'Мотивирующая',
                realistic: 'Реалистичная',
                funny: 'Смешная',
            };
            filteredQuotes = filteredQuotes.filter((q) => q.genre === genreMap[genre]);
        }
        const itemsPerPage = 3;
        const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + itemsPerPage);
        return {
            title: 'Поиск цитат',
            currentPage: 'quotes',
            isAuthenticated,
            username: isAuthenticated ? 'Администратор' : null,
            quotes: paginatedQuotes,
            quotesCount: filteredQuotes.length,
            searchQuery: search,
            authorFilter: author,
            genreFilter: genre,
            sortBy: sort || 'date_desc',
            hasPagination: totalPages > 1,
            hasPrevPage: currentPage > 1,
            hasNextPage: currentPage < totalPages,
            prevPage: currentPage - 1,
            nextPage: currentPage + 1,
            totalPages,
        };
    }
    getAddQuotePage(auth) {
        const isAuthenticated = auth === 'true';
        return {
            title: 'Добавить цитату',
            currentPage: 'add-quote',
            isAuthenticated,
            username: isAuthenticated ? 'Администратор' : null,
            userQuotes: isAuthenticated
                ? [
                    {
                        text: 'Тестовая цитата 1',
                        author: 'Автор 1',
                        status: 'published',
                    },
                    { text: 'Тестовая цитата 2', author: 'Автор 2', status: 'pending' },
                ]
                : [],
        };
    }
    getAboutPage(auth, page = '1') {
        const isAuthenticated = auth === 'true';
        const currentPage = parseInt(page);
        const allComments = [
            {
                id: 1,
                author: 'Иван',
                text: 'Отличный сайт! Много интересных цитат.',
                date: new Date('2024-01-20'),
            },
            {
                id: 2,
                author: 'Мария',
                text: 'Удобный поиск и красивый дизайн.',
                date: new Date('2024-01-21'),
            },
            {
                id: 3,
                author: 'Петр',
                text: 'Спасибо за вдохновляющие цитаты!',
                date: new Date('2024-01-22'),
            },
            {
                id: 4,
                author: 'Анна',
                text: 'Каждый день захожу за новой порцией мудрости.',
                date: new Date('2024-01-23'),
            },
        ];
        const itemsPerPage = 3;
        const totalPages = Math.ceil(allComments.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedComments = allComments.slice(startIndex, startIndex + itemsPerPage);
        return {
            title: 'О сайте',
            currentPage: 'about',
            isAuthenticated,
            username: isAuthenticated ? 'Администратор' : null,
            comments: paginatedComments,
            commentsCount: allComments.length,
            stats: {
                totalQuotes: 1250,
                totalAuthors: 380,
                totalUsers: 42,
                totalComments: allComments.length,
            },
            hasPagination: totalPages > 1,
            hasPrevPage: currentPage > 1,
            hasNextPage: currentPage < totalPages,
            prevPage: currentPage - 1,
            nextPage: currentPage + 1,
            totalPages,
        };
    }
    getMemesPage(auth) {
        const isAuthenticated = auth === 'true';
        return {
            title: 'Мемы',
            currentPage: 'memes',
            isAuthenticated,
            username: isAuthenticated ? 'Администратор' : null,
            memes: [
                {
                    id: 1,
                    url: '/images/meme1.jpg',
                    alt: 'Мем про программирование',
                    caption: 'Когда код работает с первого раза',
                },
                {
                    id: 2,
                    url: '/images/meme2.jpg',
                    alt: 'Мем про дедлайны',
                    caption: 'Дедлайн был вчера',
                },
                {
                    id: 3,
                    url: '/images/meme3.jpg',
                    alt: 'Мем про баги',
                    caption: 'Это не баг, это фича',
                },
            ],
            memesCount: 3,
            viewsCount: 1337,
            lastUpdate: '19 января 2024',
            hasMore: false,
        };
    }
    getLoginPage(error) {
        return {
            title: 'Вход в систему',
            currentPage: 'login',
            isAuthenticated: false,
            error: error === 'true' ? 'Неверный логин или пароль' : null,
            redirectUrl: '/',
        };
    }
    postLogin(body) {
        const { username, password } = body;
        if (username === 'admin' && password === 'admin') {
            return { url: '/?auth=true' };
        }
        else {
            return { url: '/login?error=true' };
        }
    }
    logout() {
        return { url: '/?auth=false' };
    }
    createPost(body) {
        console.log('Creating post:', body);
        return { url: '/?auth=true&success=post_created' };
    }
    createQuote(body) {
        console.log('Creating quote:', body);
        return { url: '/add-quote?auth=true&success=quote_created' };
    }
    createComment(body) {
        console.log('Creating comment:', body);
        return { url: '/about?auth=true&success=comment_created' };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Render)('index'),
    __param(0, (0, common_1.Query)('auth')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getIndexPage", null);
__decorate([
    (0, common_1.Get)('quotes'),
    (0, common_1.Render)('quotes'),
    __param(0, (0, common_1.Query)('auth')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('author')),
    __param(3, (0, common_1.Query)('genre')),
    __param(4, (0, common_1.Query)('sort')),
    __param(5, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getQuotesPage", null);
__decorate([
    (0, common_1.Get)('add-quote'),
    (0, common_1.Render)('add-quote'),
    __param(0, (0, common_1.Query)('auth')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getAddQuotePage", null);
__decorate([
    (0, common_1.Get)('about'),
    (0, common_1.Render)('about'),
    __param(0, (0, common_1.Query)('auth')),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getAboutPage", null);
__decorate([
    (0, common_1.Get)('memes'),
    (0, common_1.Render)('memes'),
    __param(0, (0, common_1.Query)('auth')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getMemesPage", null);
__decorate([
    (0, common_1.Get)('login'),
    (0, common_1.Render)('login'),
    __param(0, (0, common_1.Query)('error')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getLoginPage", null);
__decorate([
    (0, common_1.Post)('auth/login'),
    (0, common_1.Redirect)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "postLogin", null);
__decorate([
    (0, common_1.Get)('logout'),
    (0, common_1.Redirect)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('posts/create'),
    (0, common_1.Redirect)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createPost", null);
__decorate([
    (0, common_1.Post)('quotes/create'),
    (0, common_1.Redirect)('/add-quote'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createQuote", null);
__decorate([
    (0, common_1.Post)('comments/create'),
    (0, common_1.Redirect)('/about'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createComment", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map