export * from "./errorHandler";
import { Agency, RSSItem, Signal, Source } from "../types";
import Parser from "rss-parser";
import { SingleBar } from "cli-progress";
import { formatISO } from "date-fns/formatISO";
import { createHmac } from "crypto";
import { Agencies } from "../../services";

export const fetchFeeds = async (
  sources: Source[],
  limit: number = 5,
  progressBar: SingleBar
): Promise<RSSItem[]> => {
  const parser = new Parser();

  let feedItems: RSSItem[] = [];
  const num = sources.length;
  let progress = 0;

  progressBar.start(num, 0);

  try {
    for await (const source of sources) {
      try {
        const feed = await parser.parseURL(source.url);

        const parcialFeedItems = feed.items.map((item: any) => {
          const rssItem: RSSItem = {
            ...item,
            isoDate: getIsoDate(item),
            content: item.content
              ? item.content
              : "No content provided in RSS item.",
            creator: source.source,
          };

          return rssItem;
        });

        // Sort list
        parcialFeedItems.sort(function (a, b) {
          return a.isoDate > b.isoDate ? -1 : a.isoDate > b.isoDate ? 1 : 0;
        });

        // Limit each feed
        const limitedList = parcialFeedItems.slice(0, limit);

        feedItems = [...feedItems, ...limitedList];

        // Update progress bar
        progress++;
        progressBar.update(progress);
      } catch (err) {
        // Silent fail
      }
    }

    progressBar.stop();

    return feedItems;
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    console.log(feedItems.length + " signals found.");
  }
};

export const parseFeed = (feedItems: RSSItem[], factor: any): Signal[] => {
  const signals: Signal[] = [];

  feedItems.forEach((item) => {
    signals.push({
      title: item.title,
      summary: item.content,
      source: item.creator,
      sourceUrl: item.link ? item.link : "no-url-provided",
      date: item.isoDate,
      factor,
    });
  });

  return signals;
};

export const getIsoDate = (item: RSSItem) => {
  if (item.isoDate) return item.isoDate;
  if (item.pubDate) return formatISO(new Date(item.pubDate as string));
  if (urlIncludesDate(item.link)) return extractISODateFromURL(item.link);
  return new Date().toISOString();
};

function urlIncludesDate(url: string): boolean {
  const match = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  return !match === null ? false : true;
}

function extractISODateFromURL(url: string): string | null {
  const match = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  if (!match) return null;
  const [_, year, month, day] = match;
  // Construct ISO string for UTC midnight
  const isoString = new Date(Date.UTC(+year, +month - 1, +day)).toISOString();
  return isoString;
}

export const createPublicKey = async (agency: Agency): Promise<Agency> => {
  // Hash sha-256 the private key with hashSecret
  const hmac = createHmac("sha256", process.env.HASH_SECRET as string);
  hmac.update(agency.private_key);
  const hash = hmac.digest("hex");

  await Agencies.update({ ...agency, public_key: `gr-${hash}` });

  return { ...agency, public_key: `gr-${hash}` };
};

export const id = (len: number = 8) => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz";
  let shortUuid = "";
  for (let i = 0; i < len; i++) {
    shortUuid += chars[Math.floor(Math.random() * chars.length)];
  }
  return shortUuid;
};
