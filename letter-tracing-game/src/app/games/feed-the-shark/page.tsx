import { Suspense } from "react";
import { FeedTheSharkGame } from "@games/feed-the-shark/FeedTheSharkGame";

// useScreenHistorySync (inside FeedTheSharkGame) reads useSearchParams(), which the
// Next.js App Router requires to be wrapped in Suspense.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <FeedTheSharkGame />
    </Suspense>
  );
}
