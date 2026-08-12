"use client";

import { useState } from "react";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { animalPhotoPath } from "@games/jungle-spy/constants/animals";

/**
 * Shows the REAL PHOTO of an animal when one exists in
 * public/games/jungle-spy/animals/, and silently falls back to the pastel
 * SVG illustration when it doesn't — so photos can be added one at a time.
 */
export function AnimalDisplay({ art }: { art: string }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const Art = ANIMAL_ART[art];

  if (photoFailed) return Art ? <Art /> : null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={animalPhotoPath(art)}
      alt=""
      className="h-full w-full object-cover"
      onError={() => setPhotoFailed(true)}
      draggable={false}
    />
  );
}
