"use client";

import { useRouter } from "next/navigation";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useScreenHistorySync } from "@shared/hooks/useScreenHistorySync";

import { useGameStore } from "@games/letter-tracing/store/gameStore";
import { LETTER_DATA } from "@games/letter-tracing/constants/letterData";
import { LOWERCASE_LETTER_DATA } from "@games/letter-tracing/constants/lowercaseLetterData";
import { NUMBER_DATA } from "@games/letter-tracing/constants/numberData";

import { SplashScreen } from "@games/letter-tracing/components/screens/SplashScreen";
import { MainMenuScreen } from "@games/letter-tracing/components/screens/MainMenuScreen";
import { HomeScreen } from "@games/letter-tracing/components/screens/HomeScreen";
import { ModeSelectScreen } from "@games/letter-tracing/components/screens/ModeSelectScreen";
import { TracingScreen } from "@games/letter-tracing/components/screens/TracingScreen";
import { CelebrationScreen } from "@games/letter-tracing/components/screens/CelebrationScreen";
import { CompletionScreen } from "@games/letter-tracing/components/screens/CompletionScreen";
import { LetterSequencingScreen } from "@games/letter-tracing/components/screens/LetterSequencingScreen";

const PAGE_TRANSITIONS = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.02, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

/**
 * Coarse history bucket for the tracing game's larger screen graph:
 *   entry  — splash
 *   menu   — main-menu, home (the letter/number shelf — browsing, not play)
 *   mode   — mode-select (five-star vs free)
 *   play   — tracing, celebration, sequencing, completion (gameplay itself;
 *            collapsed together deliberately — a 26-letter session would
 *            otherwise leave 26+ stacked history entries)
 */
function toBucket(screen: string): "entry" | "menu" | "mode" | "play" {
  if (screen === "splash") return "entry";
  if (screen === "main-menu" || screen === "home") return "menu";
  if (screen === "mode-select") return "mode";
  return "play"; // tracing, celebration, sequencing, completion
}

export function LetterTracingGame() {
  const router = useRouter();
  const {
    screen,
    module,
    practiceMode,
    setScreen,
    setModule,
    setPracticeMode,
    progress,
    lowercaseProgress,
    completeCurrentLetter,
    goToLetter,
    resetProgress,
    resetLowercaseProgress,
    resetNumbersProgress,
  } = useGameStore();

  const { numbersProgress } = useGameStore();
  const currentProgress =
    module === "lowercase" ? lowercaseProgress : module === "numbers" ? numbersProgress : progress;
  const letterData =
    module === "lowercase" ? LOWERCASE_LETTER_DATA : module === "numbers" ? NUMBER_DATA : LETTER_DATA;
  const currentLetter = letterData[currentProgress.currentLetterIndex];
  const isLastLetter = currentProgress.currentLetterIndex >= letterData.length - 1;

  // Handle splash → main-menu transition
  // Back button: step backward through entry → menu → mode → play instead
  // of exiting straight to the portal. Popping to "menu" always resolves to
  // main-menu specifically (a safe, always-valid landing spot) rather than
  // trying to reconstruct whether "home" was showing — simple and correct
  // for the common case of retreating out of gameplay.
  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("main-menu");
      else if (bucket === "mode") setScreen("mode-select");
      // "entry" and "play" popped-to have no reconstruction to do — entry
      // is only ever the initial state, and play's exact screen (tracing vs
      // sequencing vs celebration) was already set by whichever forward
      // action pushed that entry in the first place.
    },
    [setScreen]
  );
  useScreenHistorySync(toBucket(screen), handlePop);

  const handleSplashComplete = useCallback(() => {
    setScreen("main-menu");
  }, [setScreen]);

  // Main menu → module home
  const handleSelectModule = useCallback(
    (selectedModule: typeof module) => {
      setModule(selectedModule);
      if (selectedModule === "sequencing") {
        setScreen("sequencing");
      } else {
        setScreen("home");
      }
    },
    [setModule, setScreen]
  );

  // A practice mode must be chosen once per session before the first letter
  const enterTracing = useCallback(() => {
    setScreen(practiceMode ? "tracing" : "mode-select");
  }, [setScreen, practiceMode]);

  // Home → tracing (via mode-select the first time in a session)
  const handleContinue = useCallback(() => {
    if (currentProgress.completedLetters.length >= letterData.length) {
      setScreen("completion");
      return;
    }
    enterTracing();
  }, [setScreen, currentProgress.completedLetters.length, letterData.length, enterTracing]);

  // Home → start from beginning
  const handleStartFromA = useCallback(() => {
    if (module === "lowercase") {
      resetLowercaseProgress();
    } else if (module === "numbers") {
      resetNumbersProgress();
    } else {
      resetProgress();
    }
    goToLetter(0);
    enterTracing();
  }, [module, resetProgress, resetLowercaseProgress, resetNumbersProgress, goToLetter, enterTracing]);

  // Home → the child taps ANY letter on the alphabet shelf
  const handleSelectLetter = useCallback(
    (index: number) => {
      goToLetter(index);
      enterTracing();
    },
    [goToLetter, enterTracing]
  );

  // Mode select → tracing (mode remembered for the rest of the session)
  const handleModeSelected = useCallback(
    (mode: NonNullable<typeof practiceMode>) => {
      setPracticeMode(mode);
      setScreen("tracing");
    },
    [setPracticeMode, setScreen]
  );

  // Tracing complete (once in Free Mode, five stars in 5 Star Mode) → celebration
  const handleTracingComplete = useCallback(() => {
    completeCurrentLetter();
    setScreen("celebration");
  }, [setScreen, completeCurrentLetter]);

  // Home button during gameplay → main menu
  const handleGoHome = useCallback(() => {
    setScreen("main-menu");
  }, [setScreen]);

  // Celebration → AGAIN: replay the current letter (stars reset via remount)
  const handleAgain = useCallback(() => {
    setScreen("tracing");
  }, [setScreen]);

  // Celebration → NEXT: advance to the next letter (or completion)
  const handleNext = useCallback(() => {
    if (isLastLetter || currentProgress.completedLetters.length >= letterData.length) {
      setScreen("completion");
    } else {
      goToLetter(currentProgress.currentLetterIndex + 1);
      setScreen("tracing");
    }
  }, [setScreen, isLastLetter, currentProgress, letterData.length, goToLetter]);

  // Completion → main menu
  const handlePlayAgain = useCallback(() => {
    setScreen("main-menu");
  }, [setScreen]);

  // Safety guard — ensure currentLetter exists for screens that need it
  const needsLetter =
    screen !== "splash" &&
    screen !== "main-menu" &&
    screen !== "home" &&
    screen !== "mode-select" &&
    screen !== "completion" &&
    screen !== "sequencing";

  if (!currentLetter && needsLetter) {
    return (
      <div className="flex h-full items-center justify-center bg-lavender">
        <div className="text-center">
          <p className="font-rounded text-xl font-bold text-plum">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <SplashScreen onComplete={handleSplashComplete} />
          </motion.div>
        )}

        {screen === "main-menu" && (
          <motion.div key="main-menu" className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <MainMenuScreen
              onExitPortal={() => router.push("/")} onSelectModule={handleSelectModule} />
          </motion.div>
        )}

        {screen === "home" && (
          <motion.div key="home" className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <HomeScreen
              onContinue={handleContinue}
              onStartFromA={handleStartFromA}
              onSelectLetter={handleSelectLetter}
            />
          </motion.div>
        )}

        {screen === "mode-select" && (
          <motion.div key="mode-select" className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <ModeSelectScreen onSelect={handleModeSelected} />
          </motion.div>
        )}

        {screen === "tracing" && currentLetter && (
          <motion.div key={`tracing-${currentLetter.letter}`} className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <TracingScreen
              letter={currentLetter}
              mode={practiceMode ?? "five-star"}
              onComplete={handleTracingComplete}
              onHome={handleGoHome}
            />
          </motion.div>
        )}

        {screen === "celebration" && currentLetter && (
          <motion.div key={`celebration-${currentLetter.letter}`} className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <CelebrationScreen
              letter={currentLetter.letter}
              onAgain={handleAgain}
              onNext={handleNext}
            />
          </motion.div>
        )}

        {screen === "completion" && (
          <motion.div key="completion" className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <CompletionScreen onPlayAgain={handlePlayAgain} />
          </motion.div>
        )}

        {screen === "sequencing" && (
          <motion.div key="sequencing" className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <LetterSequencingScreen onHome={handleGoHome} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
