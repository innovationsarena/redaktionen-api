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
  agency: AgencyContext,
  factor: Factor,
  tipLimit: number = 5
) => {
  const tipsterProgress = new SingleBar({}, Presets.shades_classic);

  const items: Source[] | undefined = await Sources.list({
    agencyId: agency.id,
    factor,
  });

  if (items) {
    const feedItems = await fetchFeeds(items, tipLimit, tipsterProgress);

    const parsedFeed = parseFeed(feedItems, factor, agency.id);
    console.log(`Signals formated.`);

    await Signals.batchWrite(parsedFeed);
    console.log(`Signals written to db.`);

    return parsedFeed;
  }
  return [];
};
