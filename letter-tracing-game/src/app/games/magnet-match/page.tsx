import { Suspense } from "react";
import { MagnetMatchGame } from "@games/magnet-match/MagnetMatchGame";

// useScreenHistorySync (inside MagnetMatchGame) reads useSearchParams(),
// which the Next.js App Router requires to be wrapped in Suspense.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <MagnetMatchGame />
    </Suspense>
  );
}
