import http from 'http';

export interface IDatabase {
    user: string,
    password: string,
    host: string,
    port: number,
    db_name: string
}

export interface IWebzApi extends http.RequestOptions {}

export interface INewsApiResponse {
  posts: Post[] | [];
  totalResults: number;
  moreResultsAvailable: number;
  next: string;
  requestsLeft: number;
  warnings: string | null;
}

export interface Post {
  thread: Thread;
  uuid: string;
  url: string;
  ord_in_thread: number;
  parent_url: string | null;
  author: string;
  published: string;
  title: string;
  text: string;
  highlightText: string;
  highlightTitle: string;
  highlightThreadTitle: string;
  language: string;
  sentiment: string | null;
  categories: string[] | null;
  external_links: string[];
  external_images: string[];
  entities: Entity;
  rating: string | null;
  crawled: string;
  updated: string;
}

export interface Thread {
  uuid: string;
  url: string;
  site_full: string;
  site: string;
  site_section: string;
  site_categories: string[];
  section_title: string;
  title: string;
  title_full: string;
  published: string;
  replies_count: number;
  participants_count: number;
  site_type: string;
  country: string;
  main_image: string;
  performance_score: number;
  domain_rank: number | null;
  domain_rank_updated: string | null;
  social: Social;
}

export interface Social {
  updated: string;
  facebook: {
    likes: number;
    comments: number;
    shares: number;
  };
  vk: {
    shares: number;
  };
}

export interface Entity {
  persons: EntityItem[];
  organizations: EntityItem[];
  locations: EntityItem[];
}

interface EntityItem {
  name: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}
export type PostOnly = Omit<Post, 'thread'>;
