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
  id?: number;
  organizationId?: string;
  source: string;
  type: SourceType;
  url: string;
  factor: Factor;
};

export type SourceType = "rss" | "url";

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
  id?: number;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  date: string;
  factor: Factor;
};

export type Summary = {
  id?: number;
  title: string;
  body: string;
  posterUrl: string | null; // Url to poster image
  signalId: number;
  sourceUrl: string;
  factor: string;
  date: string;
  scope: string;
};
