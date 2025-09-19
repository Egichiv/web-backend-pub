import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getIndexPage(auth?: string): {
        title: string;
        currentPage: string;
        isMainPage: boolean;
        isAuthenticated: boolean;
        username: string | null;
        posts: {
            id: number;
            title: string;
            text: string;
        }[];
        latestQuotes: {
            text: string;
            author: string;
        }[];
    };
    getQuotesPage(auth?: string, search?: string, author?: string, genre?: string, sort?: string, page?: string): {
        title: string;
        currentPage: string;
        isAuthenticated: boolean;
        username: string | null;
        quotes: {
            id: number;
            author: string;
            text: string;
            genre: string;
            date: Date;
        }[];
        quotesCount: number;
        searchQuery: string | undefined;
        authorFilter: string | undefined;
        genreFilter: string | undefined;
        sortBy: string;
        hasPagination: boolean;
        hasPrevPage: boolean;
        hasNextPage: boolean;
        prevPage: number;
        nextPage: number;
        currentPageNumber: number;
        totalPages: number;
    };
    getAddQuotePage(auth?: string): {
        title: string;
        currentPage: string;
        isAuthenticated: boolean;
        username: string | null;
        userQuotes: {
            text: string;
            author: string;
            status: string;
        }[];
    };
    getAboutPage(auth?: string, page?: string): {
        title: string;
        currentPage: string;
        isAuthenticated: boolean;
        username: string | null;
        comments: {
            id: number;
            author: string;
            text: string;
            date: Date;
        }[];
        commentsCount: number;
        stats: {
            totalQuotes: number;
            totalAuthors: number;
            totalUsers: number;
            totalComments: number;
        };
        hasPagination: boolean;
        hasPrevPage: boolean;
        hasNextPage: boolean;
        prevPage: number;
        nextPage: number;
        currentPageNumber: number;
        totalPages: number;
    };
    getMemesPage(auth?: string): {
        title: string;
        currentPage: string;
        isAuthenticated: boolean;
        username: string | null;
        memes: {
            id: number;
            url: string;
            alt: string;
            caption: string;
        }[];
        memesCount: number;
        viewsCount: number;
        lastUpdate: string;
        hasMore: boolean;
    };
    getLoginPage(error?: string): {
        title: string;
        currentPage: string;
        isAuthenticated: boolean;
        error: string | null;
        redirectUrl: string;
    };
    postLogin(body: any): {
        url: string;
    };
    logout(): {
        url: string;
    };
    createPost(body: any): {
        url: string;
    };
    createQuote(body: any): {
        url: string;
    };
    createComment(body: any): {
        url: string;
    };
}
