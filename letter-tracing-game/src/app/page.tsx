"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useGameStore } from "@/stores/gameStore";
import { LETTER_DATA } from "@/constants/letterData";
import { LOWERCASE_LETTER_DATA } from "@/constants/lowercaseLetterData";

import { SplashScreen } from "@/components/screens/SplashScreen";
import { MainMenuScreen } from "@/components/screens/MainMenuScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { LetterIntroScreen } from "@/components/screens/LetterIntroScreen";
import { DemoScreen } from "@/components/screens/DemoScreen";
import { TracingScreen } from "@/components/screens/TracingScreen";
import { CelebrationScreen } from "@/components/screens/CelebrationScreen";
import { RewardScreen } from "@/components/screens/RewardScreen";
import { CompletionScreen } from "@/components/screens/CompletionScreen";
import { LetterSequencingScreen } from "@/components/screens/LetterSequencingScreen";

const PAGE_TRANSITIONS = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.02, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

export default function GamePage() {
  const {
    screen,
    module,
    setScreen,
    setModule,
    progress,
    lowercaseProgress,
    completeCurrentLetter,
    goToLetter,
    resetProgress,
    resetLowercaseProgress,
  } = useGameStore();

  const currentProgress = module === "lowercase" ? lowercaseProgress : progress;
  const letterData = module === "lowercase" ? LOWERCASE_LETTER_DATA : LETTER_DATA;
  const currentLetter = letterData[currentProgress.currentLetterIndex];
  const isLastLetter = currentProgress.currentLetterIndex >= letterData.length - 1;

  // Handle splash → main-menu transition
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

  // Home → letter intro
  const handleContinue = useCallback(() => {
    if (currentProgress.completedLetters.length === 26) {
      setScreen("completion");
      return;
    }
    setScreen("letter-intro");
  }, [setScreen, currentProgress.completedLetters.length]);

  // Home → start from beginning
  const handleStartFromA = useCallback(() => {
    if (module === "lowercase") {
      resetLowercaseProgress();
    } else {
      resetProgress();
    }
    goToLetter(0);
    setScreen("letter-intro");
  }, [module, resetProgress, resetLowercaseProgress, goToLetter, setScreen]);

  // Letter intro → demo
  const handleStartTracing = useCallback(() => {
    setScreen("demo");
  }, [setScreen]);

  // Demo → tracing
  const handleDemoComplete = useCallback(() => {
    setScreen("tracing");
  }, [setScreen]);

  // Tracing → celebration
  const handleTracingComplete = useCallback(() => {
    completeCurrentLetter();
    setScreen("celebration");
  }, [setScreen, completeCurrentLetter]);

  // Return to demo from tracing
  const handleReplayDemo = useCallback(() => {
    setScreen("demo");
  }, [setScreen]);

  // Home button during gameplay → main menu
  const handleGoHome = useCallback(() => {
    setScreen("main-menu");
  }, [setScreen]);

  // Celebration → reward
  const handleCelebrationContinue = useCallback(() => {
    setScreen("reward");
  }, [setScreen]);

  // Reward → next letter or completion
  const handleRewardContinue = useCallback(() => {
    if (isLastLetter || currentProgress.completedLetters.length >= 26) {
      setScreen("completion");
    } else {
      goToLetter(currentProgress.currentLetterIndex + 1);
      setScreen("letter-intro");
    }
  }, [setScreen, isLastLetter, currentProgress, goToLetter]);

  // Completion → main menu
  const handlePlayAgain = useCallback(() => {
    setScreen("main-menu");
  }, [setScreen]);

  // Safety guard — ensure currentLetter exists for screens that need it
  const needsLetter =
    screen !== "splash" &&
    screen !== "main-menu" &&
    screen !== "home" &&
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
            <MainMenuScreen onSelectModule={handleSelectModule} />
          </motion.div>
        )}

        {screen === "home" && (
          <motion.div key="home" className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <HomeScreen
              onContinue={handleContinue}
              onStartFromA={handleStartFromA}
            />
          </motion.div>
        )}

        {screen === "letter-intro" && currentLetter && (
          <motion.div key={`intro-${currentLetter.letter}`} className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <LetterIntroScreen
              letter={currentLetter}
              onStart={handleStartTracing}
              onHome={handleGoHome}
            />
          </motion.div>
        )}

        {screen === "demo" && currentLetter && (
          <motion.div key={`demo-${currentLetter.letter}`} className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <DemoScreen
              letter={currentLetter}
              onDone={handleDemoComplete}
              onHome={handleGoHome}
            />
          </motion.div>
        )}

        {screen === "tracing" && currentLetter && (
          <motion.div key={`tracing-${currentLetter.letter}`} className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <TracingScreen
              letter={currentLetter}
              onComplete={handleTracingComplete}
              onReplayDemo={handleReplayDemo}
              onHome={handleGoHome}
            />
          </motion.div>
        )}

        {screen === "celebration" && currentLetter && (
          <motion.div key={`celebration-${currentLetter.letter}`} className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <CelebrationScreen
              letter={currentLetter.letter}
              onContinue={handleCelebrationContinue}
            />
          </motion.div>
        )}

        {screen === "reward" && currentLetter && (
          <motion.div key={`reward-${currentLetter.letter}`} className="absolute inset-0" {...PAGE_TRANSITIONS}>
            <RewardScreen
              letterIndex={currentProgress.currentLetterIndex}
              onContinue={handleRewardContinue}
              isLastLetter={isLastLetter}
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
