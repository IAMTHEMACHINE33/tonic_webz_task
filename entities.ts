import type { PostOnly, Thread } from "./interfaces.ts";

export const thread: ISchema<Thread> = {
    name: "threads",
    schema: [
        "uuid", "url", "site_full", "site", "site_section", "site_categories",
        "section_title", "title", "title_full", "published", "replies_count",
        "participants_count", "site_type", "country", "main_image", "performance_score",
        "domain_rank", "domain_rank_updated", "social"
    ],
    createQuery: `
        CREATE TABLE IF NOT EXISTS threads (
            uuid TEXT PRIMARY KEY,
            url TEXT NOT NULL,
            site_full TEXT,
            site TEXT,
            site_section TEXT,
            site_categories TEXT[],
            section_title TEXT,
            title TEXT,
            title_full TEXT,
            published TIMESTAMP,
            replies_count INTEGER,
            participants_count INTEGER,
            site_type TEXT,
            country TEXT,
            main_image TEXT,
            performance_score INTEGER,
            domain_rank INTEGER,
            domain_rank_updated TIMESTAMP,
            social JSONB
            );`
};

export const post: ISchema<PostOnly> = {
    name: "posts",
    schema: [
        "uuid", "url", "ord_in_thread", "parent_url",
        "author", "published", "title", "text", "highlightText",
        "highlightTitle", "highlightThreadTitle", "language", "sentiment",
        "categories", "external_links", "external_images", "entities",
        "rating", "crawled", "updated"
    ],
    createQuery: `
        CREATE TABLE IF NOT EXISTS posts (
            uuid TEXT PRIMARY KEY REFERENCES threads(uuid),
            url TEXT NOT NULL,
            ord_in_thread INTEGER,
            parent_url TEXT,
            author TEXT,
            published TIMESTAMP,
            title TEXT,
            text TEXT,
            highlightText TEXT,
            highlightTitle TEXT,
            highlightThreadTitle TEXT,
            language TEXT,
            sentiment TEXT,
            categories TEXT[],
            external_links TEXT[],
            external_images TEXT[],
            entities JSONB,
            rating TEXT,
            crawled TIMESTAMP,
            updated TIMESTAMP
            );` 
};

export interface ISchema<T> {
    name: string;
    schema: Array<keyof T>;
    createQuery: string;
}
