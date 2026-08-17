"use client";

import { useEffect, useState } from "react";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { animalPhotoPath } from "@games/jungle-spy/constants/animals";

/**
 * Shows the REAL PHOTO of an animal when one exists in
 * public/games/jungle-spy/animals/, and silently falls back to the pastel
 * SVG illustration when it doesn't — so photos can be added one at a time.
 *
 * The <img> is KEYED BY ANIMAL: switching letters mounts a fresh element,
 * so the previous animal's decoded frame can never linger on screen while
 * the next photo loads (the old un-keyed img kept showing the previous
 * picture for 1-2s). Failure state also resets per animal, so one missing
 * photo doesn't force every later animal onto the SVG fallback.
 */
export function AnimalDisplay({ art }: { art: string }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => setPhotoFailed(false), [art]);
  const Art = ANIMAL_ART[art];

  if (photoFailed) return Art ? <Art /> : null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={art}
      src={animalPhotoPath(art)}
      alt=""
      // object-CONTAIN: the whole animal stays visible whatever the photo's
      // proportions are. Any leftover space reads as the white mount of the
      // frame around it, so a tall or wide photo still looks deliberate.
      className="h-full w-full object-contain"
      onError={() => setPhotoFailed(true)}
      draggable={false}
    />
  );
}
