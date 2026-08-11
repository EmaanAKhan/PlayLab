/** One friendly, instantly-recognizable animal per letter (age-5 list). */
export interface JungleAnimal {
  letter: string;
  name: string;
  /** key into the shared ANIMAL_ART registry (illustration fallback) */
  art: string;
}

/**
 * REAL PHOTOS (optional, recommended): drop licensed images into
 *   public/games/jungle-spy/animals/<art-key>.jpg
 * e.g. alligator.jpg, bear.jpg, "umbrella bird.jpg", "x-ray fish.jpg".
 * Free-license sources: pexels.com, pixabay.com. Any animal without a photo
 * automatically falls back to its pastel illustration — mix freely.
 */
export function animalPhotoPath(art: string): string {
  return `/games/jungle-spy/animals/${art}.jpg`;
}

export const JUNGLE_ANIMALS: readonly JungleAnimal[] = [
  { letter: "A", name: "Alligator", art: "alligator" },
  { letter: "B", name: "Bear", art: "bear" },
  { letter: "C", name: "Cat", art: "cat" },
  { letter: "D", name: "Dog", art: "dog" },
  { letter: "E", name: "Elephant", art: "elephant" },
  { letter: "F", name: "Frog", art: "frog" },
  { letter: "G", name: "Giraffe", art: "giraffe" },
  { letter: "H", name: "Horse", art: "horse" },
  { letter: "I", name: "Iguana", art: "iguana" },
  { letter: "J", name: "Jellyfish", art: "jellyfish" },
  { letter: "K", name: "Koala", art: "koala" },
  { letter: "L", name: "Lion", art: "lion" },
  { letter: "M", name: "Monkey", art: "monkey" },
  { letter: "N", name: "Nest", art: "nest" },
  { letter: "O", name: "Octopus", art: "octopus" },
  { letter: "P", name: "Penguin", art: "penguin" },
  { letter: "Q", name: "Quail", art: "quail" },
  { letter: "R", name: "Rabbit", art: "rabbit" },
  { letter: "S", name: "Snake", art: "snake" },
  { letter: "T", name: "Turtle", art: "turtle" },
  { letter: "U", name: "Umbrella Bird", art: "umbrella bird" },
  { letter: "V", name: "Vulture", art: "vulture" },
  { letter: "W", name: "Whale", art: "whale" },
  { letter: "X", name: "X-ray Fish", art: "x-ray fish" },
  { letter: "Y", name: "Yak", art: "yak" },
  { letter: "Z", name: "Zebra", art: "zebra" },
];

export function animalFor(letter: string): JungleAnimal {
  return JUNGLE_ANIMALS.find((a) => a.letter === letter.toUpperCase()) ?? JUNGLE_ANIMALS[0];
}
