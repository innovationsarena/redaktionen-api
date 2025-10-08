"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipster = void 0;
const core_1 = require("../../core");
const cli_progress_1 = require("cli-progress");
const services_1 = require("../../services");
const tipsterUrls = [
    {
        factor: "political",
        sources: [
            { source: "SVT", url: "https://www.svt.se/rss.xml" },
            /*
            {
              source: "Dagens samhälle",
              url: "https://www.dagenssamhalle.se/rss.xml",
            },
            {
              source: "Europeiska rådet",
              url: "https://www.consilium.europa.eu/sv/rss/pressreleases.ashx",
            },
            { source: "BBC", url: "https://feeds.bbci.co.uk/news/politics/rss.xml" },
            {
              source: "SKR",
              url: "https://skr.se/4.7a383bf01715da022e3fffa/12.1f376ad3177c89481f750329.portlet?state=rss&sv.contenttype=text/xml;charset=UTF-8",
            },
            */
        ],
    },
    {
        factor: "economic",
        sources: [
            {
                source: "Europaparlamentet",
                url: "https://www.europarl.europa.eu/rss/topic/907/en.xml",
            },
            /*
            {
              source: "Naked Capitalism",
              url: "https://www.nakedcapitalism.com/feed",
            },
            {
              source: "Dow Jones",
              url: "https://feeds.content.dowjones.io/public/rss/socialeconomyfeed",
            },
            {
              source: "Enlighted economics",
              url: "http://www.enlightenmenteconomics.com/blog/index.php/feed/",
            },
            {
              source: "Financial Times",
              url: "https://www.ft.com/global-economy?format=rss",
            },
            {
              source: "The streets",
              url: "https://www.thestreet.com/economonitor/.rss/full/",
            },
            {
              source: "Regeringen",
              url: "https://www.regeringen.se/Filter/RssFeed?filterType=Taxonomy&filterByType=FilterablePageBase&preFilteredCategories=1284%2C1285%2C1286%2C1287%2C1288%2C1290%2C1291%2C1292%2C1293%2C1294%2C1295%2C1296%2C1297%2C2425&rootPageReference=0&filteredContentCategories=2097&filteredPoliticalLevelCategories=1012%2C1013&filteredPoliticalAreaCategories=1232&filteredPublisherCategories=1285",
            },
            {
              source: "Svenskt näringsliv",
              url: "https://news.google.com/rss/search?q=site:svensktnaringsliv.se&hl=sv&gl=SE&ceid=SE:sv",
            },
            { source: "SVT", url: "https://www.svt.se/nyheter/ekonomi/rss.xml" },
             */
        ],
    },
    {
        factor: "social",
        sources: [
            /*
            { source: "Reddit", url: "https://www.reddit.com/r/sweden/.rss" },
            { source: "Feber", url: "https://feber.se/samhalle/rss" },
             
            {
              source: "Aftonbladet",
              url: "https://rss.aftonbladet.se/rss2/small/pages/sections/kultur/",
            },
            {
              source: "Regeringen",
              url: "https://www.regeringen.se/Filter/RssFeed?filterType=Taxonomy&filterByType=FilterablePageBase&preFilteredCategories=1284%2C1285%2C1286%2C1287%2C1288%2C1290%2C1291%2C1292%2C1293%2C1294%2C1295%2C1296%2C1297%2C2425&rootPageReference=0&filteredContentCategories=2097&filteredPoliticalLevelCategories=&filteredPoliticalAreaCategories=1242&filteredPublisherCategories=",
            },
            { source: "Eurozine", url: "https://www.eurozine.com/feed/" },
            { source: "France24", url: "https://www.france24.com/en/culture/rss" },
            { source: "Our culture  mag", url: "https://ourculturemag.com/feed/" },
            { source: "BBC", url: "https://www.bbc.com/culture/feed.rss" },
            { source: "Futurism", url: "https://futurism.com/feed" },
            { source: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
            {
              source: "Europaparlamentet",
              url: "https://www.europarl.europa.eu/rss/topic/908/en.xml",
            },
            {
              source: "Europaparlamentet",
              url: "https://www.europarl.europa.eu/rss/topic/911/en.xml",
            },
            */
            {
                source: "Europaparlamentet",
                url: "https://www.europarl.europa.eu/rss/topic/906/en.xml",
            },
        ],
    },
    {
        factor: "technological",
        sources: [
            { source: "Feber", url: "https://feber.se/teknik/rss" },
            /*
            { source: "TechCrunch", url: "https://techcrunch.com/feed/" },
            { source: "Wired", url: "https://www.wired.com/feed/rss" },
            { source: "Engadget", url: "https://www.engadget.com/rss.xml" },
            {
              source: "Venturebeat",
              url: "https://feeds.feedburner.com/venturebeat/SZYF",
            },
            {
              source: "Scientific American",
              url: "http://rss.sciam.com/basic-science",
            },
            */
        ],
    },
    {
        factor: "environmental",
        sources: [
            {
                source: "Regeringen",
                url: "https://www.regeringen.se/Filter/RssFeed?filterType=Taxonomy&filterByType=FilterablePageBase&preFilteredCategories=1284%2C1285%2C1286%2C1287%2C1288%2C1290%2C1291%2C1292%2C1293%2C1294%2C1295%2C1296%2C1297%2C2425&rootPageReference=0&filteredContentCategories=2097&filteredPoliticalLevelCategories=&filteredPoliticalAreaCategories=1252&filteredPublisherCategories=",
            },
            /*
            { source: "Grist", url: "https://grist.org/feed/" },
            {
              source: "Greenpeace",
              url: "https://www.greenpeace.org/international/feed/",
            },
            {
              source: "Columbia Climate School",
              url: "https://news.climate.columbia.edu/feed/",
            },
            {
              source: "The Ecologist",
              url: "https://theecologist.org/whats_new/feed",
            },
            {
              source: "The Independent",
              url: "https://www.independent.co.uk/climate-change/news/rss",
            },
            {
              source: "Supermiljöbloggen",
              url: "https://supermiljobloggen.se/feed/",
            },
            {
              source: "Environmental Defence",
              url: "https://environmentaldefence.ca/feed/",
            },
            {
              source: "Europaparlamentet",
              url: "https://www.europarl.europa.eu/rss/topic/904/en.xml",
            },
            */
        ],
    },
    {
        factor: "legal",
        sources: [
            {
                source: "Reuters",
                url: "https://news.google.com/rss/search?q=site%3Areuters.com/legal&hl=en-US&gl=US&ceid=US%3Aen",
            },
            /*
            {
              source: "Sveriges domstolar",
              url: "https://www.domstol.se/feed/56/?searchPageId=2693&scope=news",
            },
            {
              source: "Regeringen",
              url: "https://www.regeringen.se/Filter/RssFeed?filterType=Taxonomy&filterByType=FilterablePageBase&preFilteredCategories=1284%2C1285%2C1286%2C1287%2C1288%2C1290%2C1291%2C1292%2C1293%2C1294%2C1295%2C1296%2C1297%2C2425&rootPageReference=0&filteredContentCategories=2097&filteredPoliticalLevelCategories=&filteredPoliticalAreaCategories=2096%2C1220%2C1230%2C2391%2C1224&filteredPublisherCategories=",
            },
            {
              source: "Europaparlamentet",
              url: "https://www.europarl.europa.eu/rss/topic/902/en.xml",
            },
            */
        ],
    },
];
const tipster = async (factor, limit = 5) => {
    console.log("------------------------------------------------------------>>");
    console.log(`${factor.charAt(0).toUpperCase() + factor.slice(1)} tipster reporting for duty!`);
    console.log("------------------------------------------------------------>>");
    const tipsterProgress = new cli_progress_1.SingleBar({}, cli_progress_1.Presets.shades_classic);
    const items = tipsterUrls.find((item) => item.factor === factor);
    if (items) {
        const feedItems = await (0, core_1.fetchFeeds)(items.sources, limit, tipsterProgress);
        console.log(`Formatting signals...`);
        const parsedFeed = (0, core_1.parseFeed)(feedItems, factor);
        console.log(`Writing signals...`);
        await services_1.signals.batchWrite(parsedFeed);
        return parsedFeed;
    }
    return [];
};
exports.tipster = tipster;
