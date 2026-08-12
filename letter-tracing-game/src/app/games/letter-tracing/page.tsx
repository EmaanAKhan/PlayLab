import { Suspense } from "react";
import { LetterTracingGame } from "@games/letter-tracing/LetterTracingGame";

// useScreenHistorySync (inside LetterTracingGame) reads useSearchParams(), which the
// Next.js App Router requires to be wrapped in Suspense.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <LetterTracingGame />
    </Suspense>
  );
}
