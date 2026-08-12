import { Suspense } from "react";
import { JungleSpyGame } from "@games/jungle-spy/JungleSpyGame";

// useScreenHistorySync (inside JungleSpyGame) reads useSearchParams(), which the
// Next.js App Router requires to be wrapped in Suspense.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <JungleSpyGame />
    </Suspense>
  );
}
