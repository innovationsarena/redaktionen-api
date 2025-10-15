import { RSSItem, Signal, Source } from "../types";
import Parser from "rss-parser";
import { SingleBar } from "cli-progress";
import { getIsoDate } from "./date.utils";

/**
 * Fetches RSS feeds from multiple sources with progress tracking
 * @param sources Array of RSS feed sources to fetch
 * @param limit Maximum number of items to fetch per source
 * @param progressBar CLI progress bar for visual feedback
 * @returns Array of RSS feed items
 */
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

        // Sort list by date (newest first)
        parcialFeedItems.sort(function (a, b) {
          return a.isoDate > b.isoDate ? -1 : a.isoDate < b.isoDate ? 1 : 0;
        });

        // Limit each feed
        const limitedList = parcialFeedItems.slice(0, limit);

        feedItems = [...feedItems, ...limitedList];

        // Update progress bar
        progress++;
        progressBar.update(progress);
      } catch (err) {
        // Silent fail for individual feed errors
        // Consider logging this in production
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

/**
 * Converts RSS feed items to Signal entities
 * @param feedItems Array of RSS items to parse
 * @param factor PESTEL factor to assign to signals
 * @returns Array of Signal entities
 */
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
