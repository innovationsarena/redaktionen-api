"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsoDate = exports.parseFeed = exports.fetchFeeds = exports.validateKey = void 0;
__exportStar(require("./errorHandler"), exports);
const rss_parser_1 = __importDefault(require("rss-parser"));
const formatISO_1 = require("date-fns/formatISO");
const validateKey = async (request, reply) => {
    if (!request.headers["authorization"]) {
        throw new Error("API key not found.");
    }
    const API_KEY = request.headers["authorization"].split(" ")[1];
    if (!API_KEY) {
        throw new Error("API key not found.");
    }
    const valid = process.env.API_KEY === API_KEY;
    if (valid) {
        return;
    }
    else
        throw new Error("API key not valid.");
};
exports.validateKey = validateKey;
const fetchFeeds = async (sources, limit = 5, progressBar) => {
    const parser = new rss_parser_1.default();
    let feedItems = [];
    const num = sources.length;
    let progress = 0;
    progressBar.start(num, 0);
    try {
        for await (const source of sources) {
            try {
                const feed = await parser.parseURL(source.url);
                const parcialFeedItems = feed.items.map((item) => {
                    const rssItem = {
                        ...item,
                        isoDate: (0, exports.getIsoDate)(item),
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
            }
            catch (err) {
                // Silent fail
            }
        }
        progressBar.stop();
        return feedItems;
    }
    catch (error) {
        console.error(error);
        return [];
    }
    finally {
        console.log(feedItems.length + " signals found.");
    }
};
exports.fetchFeeds = fetchFeeds;
const parseFeed = (feedItems, factor) => {
    const signals = [];
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
exports.parseFeed = parseFeed;
const getIsoDate = (item) => {
    if (item.isoDate)
        return item.isoDate;
    if (item.pubDate)
        return (0, formatISO_1.formatISO)(new Date(item.pubDate));
    if (urlIncludesDate(item.link))
        return extractISODateFromURL(item.link);
    return new Date().toISOString();
};
exports.getIsoDate = getIsoDate;
function urlIncludesDate(url) {
    const match = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    return !match === null ? false : true;
}
function extractISODateFromURL(url) {
    const match = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    if (!match)
        return null;
    const [_, year, month, day] = match;
    // Construct ISO string for UTC midnight
    const isoString = new Date(Date.UTC(+year, +month - 1, +day)).toISOString();
    return isoString;
}
