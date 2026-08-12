import { Suspense } from "react";
import { LetterHuntGame } from "@games/letter-hunt/LetterHuntGame";

// useScreenHistorySync (inside LetterHuntGame) reads useSearchParams(), which the
// Next.js App Router requires to be wrapped in Suspense.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <LetterHuntGame />
    </Suspense>
  );
}
