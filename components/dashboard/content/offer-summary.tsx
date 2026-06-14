"use client";

import { useSyncExternalStore } from "react";

import { offerSummary, type OfferItem } from "./content-meta";

const emptySubscribe = () => () => {};

/**
 * One-line summary for an offer card. Event dates format in the viewer's
 * locale/timezone, which the server can't predict — so on the server and first
 * client paint we render the stable "Live event" label, then localize the date
 * after mount. Using `useSyncExternalStore` keeps it hydration-safe without a
 * setState-in-effect.
 */
export function OfferSummary({ item }: { item: OfferItem }) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (item.contentType === "event" && !isClient) return <>Live event</>;
  return <>{offerSummary(item)}</>;
}
