import { Suspense } from "react";
import { AlphabetDinoDigGame } from "@games/dino-dig/AlphabetDinoDigGame";

// useScreenHistorySync (inside AlphabetDinoDigGame) reads useSearchParams(), which
// the Next.js App Router requires to be wrapped in Suspense.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <AlphabetDinoDigGame />
    </Suspense>
  );
}
