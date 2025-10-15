import { formatISO } from "date-fns/formatISO";
import { RSSItem } from "../types";

/**
 * Extracts ISO date from RSS item, trying multiple fallback strategies
 * Priority: isoDate -> pubDate -> URL extraction -> current date
 * @param item RSS feed item
 * @returns ISO 8601 formatted date string
 */
export const getIsoDate = (item: RSSItem): string => {
  if (item.isoDate) return item.isoDate;
  if (item.pubDate) return formatISO(new Date(item.pubDate as string));
  if (urlIncludesDate(item.link)) {
    const dateFromUrl = extractISODateFromURL(item.link);
    if (dateFromUrl) return dateFromUrl;
  }
  return new Date().toISOString();
};

/**
 * Checks if a URL contains a date pattern (YYYY/MM/DD)
 * @param url URL to check
 * @returns true if URL contains date pattern
 */
function urlIncludesDate(url: string): boolean {
  const match = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  return match !== null;
}

/**
 * Extracts ISO date string from URL with YYYY/MM/DD pattern
 * @param url URL containing date pattern
 * @returns ISO 8601 formatted date string or null if not found
 */
function extractISODateFromURL(url: string): string | null {
  const match = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  if (!match) return null;
  const [_, year, month, day] = match;
  // Construct ISO string for UTC midnight
  const isoString = new Date(Date.UTC(+year, +month - 1, +day)).toISOString();
  return isoString;
}
