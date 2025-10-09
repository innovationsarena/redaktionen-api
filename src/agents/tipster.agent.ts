import { Factor, fetchFeeds, parseFeed, Source, TipsterItem } from "../core";
import { SingleBar, Presets } from "cli-progress";
import { signals } from "../services";

const sources: Source[] = [
  {
    source: "SVT",
    url: "https://www.svt.se/rss.xml",
    factor: "political",
    type: "rss",
  },
  {
    source: "Financial Times",
    url: "https://www.ft.com/global-economy?format=rss",
    factor: "economic",
    type: "rss",
  },
  {
    source: "Feber",
    url: "https://feber.se/samhalle/rss",
    factor: "social",
    type: "rss",
  },
  {
    source: "Feber",
    url: "https://feber.se/teknik/rss",
    factor: "technological",
    type: "rss",
  },
  {
    source: "Europaparlamentet",
    url: "https://www.europarl.europa.eu/rss/topic/904/en.xml",
    factor: "environmental",
    type: "rss",
  },
  {
    source: "Europaparlamentet",
    url: "https://www.europarl.europa.eu/rss/topic/902/en.xml",
    factor: "legal",
    type: "rss",
  },

  /*
  {
    source: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    factor: "technological",
    type: "rss",
  },
  {
    source: "Wired",
    url: "https://www.wired.com/feed/rss",
    factor: "technological",
    type: "rss",
  },
  {
    source: "Engadget",
    url: "https://www.engadget.com/rss.xml",
    factor: "technological",
    type: "rss",
  },
  {
    source: "Venturebeat",
    url: "https://feeds.feedburner.com/venturebeat/SZYF",
    factor: "technological",
    type: "rss",
  },
  {
    source: "Scientific American",
    url: "http://rss.sciam.com/basic-science",
    factor: "technological",
    type: "rss",
  },
 
  {
    source: "Dagens samhälle",
    url: "https://www.dagenssamhalle.se/rss.xml",
    factor: "political",
    type: "rss",
  },
  {
    source: "Europeiska rådet",
    url: "https://www.consilium.europa.eu/sv/rss/pressreleases.ashx",
    factor: "political",
    type: "rss",
  },
  {
    source: "BBC",
    url: "https://feeds.bbci.co.uk/news/politics/rss.xml",
    factor: "political",
    type: "rss",
  },
  {
    source: "SKR",
    url: "https://skr.se/4.7a383bf01715da022e3fffa/12.1f376ad3177c89481f750329.portlet?state=rss&sv.contenttype=text/xml;charset=UTF-8",
    factor: "political",
    type: "rss",
  },
  {
    source: "Naked Capitalism",
    url: "https://www.nakedcapitalism.com/feed",
    factor: "economic",
    type: "rss",
  },
  {
    source: "Europaparlamentet",
    url: "https://www.europarl.europa.eu/rss/topic/907/en.xml",
    factor: "economic",
    type: "rss",
  },
  {
    source: "Dow Jones",
    url: "https://feeds.content.dowjones.io/public/rss/socialeconomyfeed",
    factor: "economic",
    type: "rss",
  },
  {
    source: "Enlighted economics",
    url: "http://www.enlightenmenteconomics.com/blog/index.php/feed/",
    factor: "economic",
    type: "rss",
  },

  {
    source: "The streets",
    url: "https://www.thestreet.com/economonitor/.rss/full/",
    factor: "economic",
    type: "rss",
  },
  {
    source: "Regeringen",
    url: "https://www.regeringen.se/Filter/RssFeed?filterType=Taxonomy&filterByType=FilterablePageBase&preFilteredCategories=1284%2C1285%2C1286%2C1287%2C1288%2C1290%2C1291%2C1292%2C1293%2C1294%2C1295%2C1296%2C1297%2C2425&rootPageReference=0&filteredContentCategories=2097&filteredPoliticalLevelCategories=1012%2C1013&filteredPoliticalAreaCategories=1232&filteredPublisherCategories=1285",
    factor: "economic",
    type: "rss",
  },
  {
    source: "Svenskt näringsliv",
    url: "https://news.google.com/rss/search?q=site:svensktnaringsliv.se&hl=sv&gl=SE&ceid=SE:sv",
    factor: "economic",
    type: "rss",
  },
  {
    source: "SVT",
    url: "https://www.svt.se/nyheter/ekonomi/rss.xml",
    factor: "economic",
    type: "rss",
  },
  {
    source: "Reddit",
    url: "https://www.reddit.com/r/sweden/.rss",
    factor: "social",
    type: "rss",
  },
  {
    source: "Aftonbladet",
    url: "https://rss.aftonbladet.se/rss2/small/pages/sections/kultur/",
    factor: "social",
    type: "rss",
  },
  {
    source: "Regeringen",
    url: "https://www.regeringen.se/Filter/RssFeed?filterType=Taxonomy&filterByType=FilterablePageBase&preFilteredCategories=1284%2C1285%2C1286%2C1287%2C1288%2C1290%2C1291%2C1292%2C1293%2C1294%2C1295%2C1296%2C1297%2C2425&rootPageReference=0&filteredContentCategories=2097&filteredPoliticalLevelCategories=&filteredPoliticalAreaCategories=1242&filteredPublisherCategories=",
    factor: "social",
    type: "rss",
  },
  {
    source: "Eurozine",
    url: "https://www.eurozine.com/feed/",
    factor: "social",
    type: "rss",
  },
  {
    source: "France24",
    url: "https://www.france24.com/en/culture/rss",
    factor: "social",
    type: "rss",
  },
  {
    source: "Our culture  mag",
    url: "https://ourculturemag.com/feed/",
    factor: "social",
    type: "rss",
  },
  {
    source: "BBC",
    url: "https://www.bbc.com/culture/feed.rss",
    factor: "social",
    type: "rss",
  },
  {
    source: "Futurism",
    url: "https://futurism.com/feed",
    factor: "social",
    type: "rss",
  },
  {
    source: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    factor: "social",
    type: "rss",
  },
  {
    source: "Europaparlamentet",
    url: "https://www.europarl.europa.eu/rss/topic/908/en.xml",
    factor: "social",
    type: "rss",
  },
  {
    source: "Europaparlamentet",
    url: "https://www.europarl.europa.eu/rss/topic/911/en.xml",
    factor: "social",
    type: "rss",
  },
  {
    source: "Regeringen",
    url: "https://www.regeringen.se/Filter/RssFeed?filterType=Taxonomy&filterByType=FilterablePageBase&preFilteredCategories=1284%2C1285%2C1286%2C1287%2C1288%2C1290%2C1291%2C1292%2C1293%2C1294%2C1295%2C1296%2C1297%2C2425&rootPageReference=0&filteredContentCategories=2097&filteredPoliticalLevelCategories=&filteredPoliticalAreaCategories=1252&filteredPublisherCategories=",
    factor: "environmental",
    type: "rss",
  },
  {
    source: "Grist",
    url: "https://grist.org/feed/",
    factor: "environmental",
    type: "rss",
  },
  {
    source: "Greenpeace",
    url: "https://www.greenpeace.org/international/feed/",
    factor: "environmental",
    type: "rss",
  },
  {
    source: "Columbia Climate School",
    url: "https://news.climate.columbia.edu/feed/",
    factor: "environmental",
    type: "rss",
  },
  {
    source: "The Ecologist",
    url: "https://theecologist.org/whats_new/feed",
    factor: "environmental",
    type: "rss",
  },
  {
    source: "The Independent",
    url: "https://www.independent.co.uk/climate-change/news/rss",
    factor: "environmental",
    type: "rss",
  },
  {
    source: "Supermiljöbloggen",
    url: "https://supermiljobloggen.se/feed/",
    factor: "environmental",
    type: "rss",
  },
  {
    source: "Environmental Defence",
    url: "https://environmentaldefence.ca/feed/",
    factor: "environmental",
    type: "rss",
  },
  {
    source: "Europaparlamentet",
    url: "https://www.europarl.europa.eu/rss/topic/904/en.xml",
    factor: "environmental",
    type: "rss",
  },
  {
    source: "Regeringen",
    url: "https://www.regeringen.se/Filter/RssFeed?filterType=Taxonomy&filterByType=FilterablePageBase&preFilteredCategories=1284%2C1285%2C1286%2C1287%2C1288%2C1290%2C1291%2C1292%2C1293%2C1294%2C1295%2C1296%2C1297%2C2425&rootPageReference=0&filteredContentCategories=2097&filteredPoliticalLevelCategories=&filteredPoliticalAreaCategories=2096%2C1220%2C1230%2C2391%2C1224&filteredPublisherCategories=",
    factor: "legal",
    type: "rss",
  },

  {
    source: "Sveriges domstolar",
    url: "https://www.domstol.se/feed/56/?searchPageId=2693&scope=news",
    factor: "legal",
    type: "rss",
  },
  */
];

export const tipster = async (factor: Factor, limit: number = 5) => {
  console.log("------------------------------------------------------------>>");
  console.log(
    `${
      factor.charAt(0).toUpperCase() + factor.slice(1)
    } tipster reporting for duty!`
  );
  console.log("------------------------------------------------------------>>");

  const tipsterProgress = new SingleBar({}, Presets.shades_classic);

  const items: Source[] | undefined = sources.filter(
    (item) => item.factor === factor
  );

  if (items) {
    const feedItems = await fetchFeeds(items, limit, tipsterProgress);

    console.log(`Formatting signals...`);
    const parsedFeed = parseFeed(feedItems, factor);

    console.log(`Writing signals...`);
    await signals.batchWrite(parsedFeed);

    return parsedFeed;
  }
  return [];
};
