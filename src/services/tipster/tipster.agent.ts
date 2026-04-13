import { Presets, SingleBar } from "cli-progress";
import {
  AgencyContext,
  fetchFeeds,
  parseFeed,
  Signals,
  Source,
  Factor,
  Sources,
} from "../../core";

export const tipster = async (
  agencyId: string,
  factor: Factor,
  tipLimit: number = 5
) => {
  const tipsterProgress = new SingleBar({}, Presets.shades_classic);

  const items: Source[] | undefined = await Sources.list({
    agencyId,
    factor,
  });

  if (items.length) {
    const feedItems = await fetchFeeds(items, tipLimit, tipsterProgress);

    console.log(`Formatting signals...`);
    const parsedFeed = parseFeed(feedItems, factor, agencyId);

    console.log(`Writing signals...`);
    await Signals.batchWrite(parsedFeed);

    return parsedFeed;
  }
  return [];
};
