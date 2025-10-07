export type RSSItem = {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  content: string;
  contentSnippet: string;
  guid?: string;
  categories: string[];
  isoDate: string;
};

export type Source = {
  source: string;
  url: string;
};

export type TipsterItem = {
  factor: Factor;
  sources: Source[];
};

export type RSSFeed = {
  feedUrl: string;
  title: string;
  description: string;
  link: string;
  items: RSSItem[];
};

export type Factor =
  | "political"
  | "economic"
  | "social"
  | "technological"
  | "environmental"
  | "legal";

export type Signal = {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  date: string;
  factor: Factor;
};
