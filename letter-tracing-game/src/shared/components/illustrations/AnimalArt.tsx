"use client";

/**
 * AnimalArt — shared handcrafted pastel animal illustrations (100×100
 * viewBox each), usable by any game. Single source of truth: the letter-
 * tracing anchor cards and the Jungle ABC Spy game both draw from here.
 */

type Art = () => React.ReactElement;

export const Cat: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M28 34 L24 16 L40 26 Z" fill="#B9A7E8" />
    <path d="M72 34 L76 16 L60 26 Z" fill="#B9A7E8" />
    <circle cx="50" cy="52" r="30" fill="#CDBDF0" />
    <circle cx="40" cy="46" r="4" fill="#3D3D5C" />
    <circle cx="60" cy="46" r="4" fill="#3D3D5C" />
    <path d="M46 58 Q50 62 54 58" stroke="#3D3D5C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M50 55 L50 58 M30 54 L16 51 M30 60 L17 62 M70 54 L84 51 M70 60 L83 62" stroke="#6B5B7B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="50" cy="53" r="3.5" fill="#FF9EBC" />
  </svg>
);

export const Dog: Art = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="30" cy="40" rx="10" ry="17" fill="#C89B6E" transform="rotate(18 30 40)" />
    <ellipse cx="70" cy="40" rx="10" ry="17" fill="#C89B6E" transform="rotate(-18 70 40)" />
    <circle cx="50" cy="52" r="29" fill="#E5C398" />
    <ellipse cx="50" cy="62" rx="14" ry="11" fill="#F7E7CF" />
    <circle cx="40" cy="45" r="4" fill="#3D3D5C" />
    <circle cx="60" cy="45" r="4" fill="#3D3D5C" />
    <ellipse cx="50" cy="58" rx="6" ry="4.5" fill="#6B4B33" />
    <path d="M50 62 Q50 68 44 69 M50 62 Q50 68 56 69" stroke="#6B4B33" strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </svg>
);

export const Fish: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M22 50 L8 36 L12 50 L8 64 Z" fill="#74B9FF" />
    <ellipse cx="55" cy="50" rx="33" ry="22" fill="#8FD0FF" />
    <path d="M50 30 Q60 42 50 50 Q60 58 50 70" stroke="white" strokeWidth="4" fill="none" opacity="0.6" />
    <circle cx="74" cy="45" r="4" fill="#3D3D5C" />
    <circle cx="30" cy="26" r="4" fill="#C9E8FF" />
    <circle cx="24" cy="16" r="3" fill="#C9E8FF" />
  </svg>
);

export const Lion: Art = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="36" fill="#F4A73E" opacity="0.85" />
    <circle cx="50" cy="50" r="26" fill="#FFD9A0" />
    <circle cx="41" cy="45" r="4" fill="#3D3D5C" />
    <circle cx="59" cy="45" r="4" fill="#3D3D5C" />
    <ellipse cx="50" cy="56" rx="5" ry="4" fill="#C77B3F" />
    <path d="M50 60 Q50 65 44 66 M50 60 Q50 65 56 66" stroke="#C77B3F" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <circle cx="34" cy="55" r="4" fill="#FF9EBC" opacity="0.6" />
    <circle cx="66" cy="55" r="4" fill="#FF9EBC" opacity="0.6" />
  </svg>
);

export const Nest: Art = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="50" cy="60" rx="34" ry="18" fill="#C89B6E" />
    <path d="M18 58 Q50 44 82 58 M22 64 Q50 52 78 64 M26 70 Q50 60 74 70" stroke="#8B6F47" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
    <ellipse cx="40" cy="48" rx="9" ry="11" fill="#EAF6FF" />
    <ellipse cx="58" cy="46" rx="9" ry="11" fill="#FFF6E5" />
  </svg>
);

export const Octopus: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M50 14 Q76 16 76 44 L76 56 Q76 62 70 62 Q66 62 66 68 Q66 76 58 74 Q54 73 53 78 Q52 84 46 82 Q42 80 40 74 Q38 68 32 68 Q24 68 24 56 L24 44 Q24 16 50 14 Z" fill="#C9A9F5" />
    <circle cx="41" cy="40" r="4.5" fill="#3D3D5C" />
    <circle cx="59" cy="40" r="4.5" fill="#3D3D5C" />
    <path d="M44 50 Q50 55 56 50" stroke="#3D3D5C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="33" cy="47" r="4" fill="#FF9EBC" opacity="0.6" />
    <circle cx="67" cy="47" r="4" fill="#FF9EBC" opacity="0.6" />
  </svg>
);

export const Rabbit: Art = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="40" cy="24" rx="8" ry="19" fill="#F4F0FA" />
    <ellipse cx="60" cy="24" rx="8" ry="19" fill="#F4F0FA" />
    <ellipse cx="40" cy="26" rx="4" ry="13" fill="#FFD6E3" />
    <ellipse cx="60" cy="26" rx="4" ry="13" fill="#FFD6E3" />
    <circle cx="50" cy="58" r="27" fill="#FBF9FF" stroke="#E8E2F5" strokeWidth="2" />
    <circle cx="41" cy="53" r="4" fill="#3D3D5C" />
    <circle cx="59" cy="53" r="4" fill="#3D3D5C" />
    <ellipse cx="50" cy="62" rx="4" ry="3" fill="#FF9EBC" />
    <path d="M50 65 Q50 70 45 71 M50 65 Q50 70 55 71 M34 62 L22 60 M34 66 L23 69 M66 62 L78 60 M66 66 L77 69" stroke="#B8AED0" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </svg>
);

export const Zebra: Art = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="34" cy="22" rx="6" ry="10" fill="#E8E8F0" transform="rotate(-14 34 22)" />
    <ellipse cx="62" cy="20" rx="6" ry="10" fill="#E8E8F0" transform="rotate(10 62 20)" />
    <path d="M44 12 L48 22 M54 11 L56 21" stroke="#3D3D5C" strokeWidth="4" strokeLinecap="round" />
    <path d="M48 18 Q74 22 74 52 Q74 80 48 82 Q26 80 26 52 Q26 22 48 18 Z" fill="#F4F4FA" />
    <path d="M34 30 Q46 34 62 30 M30 42 Q48 47 68 42 M30 56 Q48 60 69 56" stroke="#3D3D5C" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.75" />
    <circle cx="40" cy="46" r="4" fill="#3D3D5C" />
    <circle cx="58" cy="46" r="4" fill="#3D3D5C" />
    <ellipse cx="49" cy="70" rx="12" ry="9" fill="#D8D8E4" />
    <circle cx="44" cy="69" r="2.2" fill="#3D3D5C" />
    <circle cx="54" cy="69" r="2.2" fill="#3D3D5C" />
  </svg>
);

export const Alligator: Art = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="46" cy="58" rx="34" ry="16" fill="#8FD6A8" />
    <path d="M72 52 Q94 48 96 56 Q94 64 72 62 Z" fill="#8FD6A8" />
    <circle cx="86" cy="55" r="1.6" fill="#3D3D5C" />
    <path d="M74 56 L78 59 L82 56 L86 59 L90 56" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <circle cx="34" cy="44" r="7" fill="#8FD6A8" />
    <circle cx="50" cy="44" r="7" fill="#8FD6A8" />
    <circle cx="34" cy="43" r="3" fill="#3D3D5C" />
    <circle cx="50" cy="43" r="3" fill="#3D3D5C" />
    <path d="M20 64 Q28 70 38 70 M50 71 Q60 72 68 68" stroke="#5FAE7E" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <ellipse cx="44" cy="66" rx="18" ry="6" fill="#D6F2E0" opacity="0.8" />
    <path d="M24 74 L24 80 M40 76 L40 82 M56 76 L56 82" stroke="#5FAE7E" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const Bear: Art = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="30" cy="26" r="10" fill="#B98A5F" />
    <circle cx="70" cy="26" r="10" fill="#B98A5F" />
    <circle cx="30" cy="27" r="5" fill="#E5C398" />
    <circle cx="70" cy="27" r="5" fill="#E5C398" />
    <circle cx="50" cy="54" r="31" fill="#C89B6E" />
    <circle cx="41" cy="47" r="4" fill="#3D3D5C" />
    <circle cx="59" cy="47" r="4" fill="#3D3D5C" />
    <ellipse cx="50" cy="62" rx="13" ry="10" fill="#E5C398" />
    <ellipse cx="50" cy="58" rx="5" ry="4" fill="#6B4B33" />
    <path d="M50 62 Q50 67 45 68 M50 62 Q50 67 55 68" stroke="#6B4B33" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </svg>
);

export const Elephant: Art = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="26" cy="46" rx="16" ry="19" fill="#B9C4E8" />
    <ellipse cx="74" cy="46" rx="16" ry="19" fill="#B9C4E8" />
    <ellipse cx="26" cy="48" rx="9" ry="12" fill="#DCE3F7" />
    <ellipse cx="74" cy="48" rx="9" ry="12" fill="#DCE3F7" />
    <circle cx="50" cy="48" r="24" fill="#C9D2F0" />
    <circle cx="42" cy="43" r="3.8" fill="#3D3D5C" />
    <circle cx="58" cy="43" r="3.8" fill="#3D3D5C" />
    <path d="M50 52 Q46 66 52 76 Q56 83 50 88" stroke="#C9D2F0" strokeWidth="11" fill="none" strokeLinecap="round" />
    <circle cx="44" cy="52" r="3" fill="#FF9EBC" opacity="0.55" />
    <circle cx="56" cy="52" r="3" fill="#FF9EBC" opacity="0.55" />
  </svg>
);

export const Frog: Art = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="34" cy="30" r="11" fill="#8FD6A8" />
    <circle cx="66" cy="30" r="11" fill="#8FD6A8" />
    <circle cx="34" cy="28" r="5.5" fill="white" />
    <circle cx="66" cy="28" r="5.5" fill="white" />
    <circle cx="34" cy="28" r="2.6" fill="#3D3D5C" />
    <circle cx="66" cy="28" r="2.6" fill="#3D3D5C" />
    <ellipse cx="50" cy="56" rx="32" ry="24" fill="#A8E3BC" />
    <path d="M34 58 Q50 70 66 58" stroke="#5FAE7E" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <circle cx="40" cy="48" r="3" fill="#FF9EBC" opacity="0.5" />
    <circle cx="60" cy="48" r="3" fill="#FF9EBC" opacity="0.5" />
    <ellipse cx="22" cy="76" rx="10" ry="5.5" fill="#8FD6A8" />
    <ellipse cx="78" cy="76" rx="10" ry="5.5" fill="#8FD6A8" />
  </svg>
);

export const Giraffe: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M40 16 Q40 8 44 6 M60 16 Q60 8 56 6" stroke="#C89B6E" strokeWidth="5" strokeLinecap="round" fill="none" />
    <circle cx="41" cy="7" r="3.4" fill="#C89B6E" />
    <circle cx="59" cy="7" r="3.4" fill="#C89B6E" />
    <ellipse cx="50" cy="26" rx="17" ry="14" fill="#F4D8A0" />
    <circle cx="44" cy="23" r="3.4" fill="#3D3D5C" />
    <circle cx="56" cy="23" r="3.4" fill="#3D3D5C" />
    <ellipse cx="50" cy="33" rx="8.5" ry="6" fill="#EFC985" />
    <circle cx="47" cy="32" r="1.7" fill="#8B6F47" />
    <circle cx="53" cy="32" r="1.7" fill="#8B6F47" />
    <path d="M44 40 L42 88 M56 40 L58 88" stroke="#F4D8A0" strokeWidth="13" strokeLinecap="round" />
    <circle cx="45" cy="52" r="3.6" fill="#D8A85E" opacity="0.75" />
    <circle cx="55" cy="63" r="3.2" fill="#D8A85E" opacity="0.75" />
    <circle cx="45" cy="74" r="3.4" fill="#D8A85E" opacity="0.75" />
  </svg>
);

export const Horse: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M34 26 L30 12 L42 20 Z" fill="#B98A5F" />
    <path d="M66 26 L70 12 L58 20 Z" fill="#B98A5F" />
    <path d="M50 14 Q42 20 42 30 L58 30 Q58 20 50 14 Z" fill="#8B6F47" />
    <ellipse cx="50" cy="46" rx="24" ry="24" fill="#C89B6E" />
    <circle cx="41" cy="41" r="3.8" fill="#3D3D5C" />
    <circle cx="59" cy="41" r="3.8" fill="#3D3D5C" />
    <path d="M50 52 Q38 54 38 66 Q38 78 50 78 Q62 78 62 66 Q62 54 50 52 Z" fill="#E5C398" />
    <circle cx="45" cy="66" r="2.6" fill="#8B6F47" />
    <circle cx="55" cy="66" r="2.6" fill="#8B6F47" />
  </svg>
);

export const Iguana: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M14 54 Q34 40 58 46 Q84 52 92 44 Q92 58 74 62 Q46 68 24 62 Q12 59 14 54 Z" fill="#A8E3BC" />
    <circle cx="30" cy="46" r="12" fill="#8FD6A8" />
    <circle cx="27" cy="43" r="3" fill="#3D3D5C" />
    <path d="M30 34 L34 28 M38 36 L43 31 M46 40 L51 35 M54 44 L59 40" stroke="#5FAE7E" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M22 52 Q26 55 31 54" stroke="#5FAE7E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <path d="M30 64 L28 74 M46 66 L46 76 M62 62 L64 72" stroke="#8FD6A8" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="42" cy="52" r="2.4" fill="#5FAE7E" opacity="0.6" />
    <circle cx="54" cy="55" r="2.4" fill="#5FAE7E" opacity="0.6" />
  </svg>
);

export const Jellyfish: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M22 46 Q22 16 50 16 Q78 16 78 46 Q64 42 50 46 Q36 42 22 46 Z" fill="#E3C9F5" />
    <path d="M30 30 Q40 22 52 24" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
    <circle cx="41" cy="36" r="3" fill="#3D3D5C" />
    <circle cx="59" cy="36" r="3" fill="#3D3D5C" />
    <path d="M45 41 Q50 44 55 41" stroke="#3D3D5C" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <path d="M30 48 Q26 62 32 74 M42 50 Q40 66 44 82 M58 50 Q60 66 56 82 M70 48 Q74 62 68 74" stroke="#C9A9F5" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

export const Koala: Art = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="26" cy="32" r="14" fill="#B8AED0" />
    <circle cx="74" cy="32" r="14" fill="#B8AED0" />
    <circle cx="26" cy="33" r="7" fill="#E8DFF5" />
    <circle cx="74" cy="33" r="7" fill="#E8DFF5" />
    <circle cx="50" cy="52" r="28" fill="#CFC6E4" />
    <circle cx="41" cy="47" r="4" fill="#3D3D5C" />
    <circle cx="59" cy="47" r="4" fill="#3D3D5C" />
    <ellipse cx="50" cy="58" rx="7" ry="9" fill="#6B5B7B" />
    <circle cx="43" cy="57" r="3.4" fill="#FF9EBC" opacity="0.5" />
    <circle cx="57" cy="57" r="3.4" fill="#FF9EBC" opacity="0.5" />
  </svg>
);

export const Monkey: Art = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="24" cy="42" r="10" fill="#B98A5F" />
    <circle cx="76" cy="42" r="10" fill="#B98A5F" />
    <circle cx="24" cy="42" r="5" fill="#F0D6B8" />
    <circle cx="76" cy="42" r="5" fill="#F0D6B8" />
    <circle cx="50" cy="46" r="26" fill="#C89B6E" />
    <path d="M30 40 Q30 24 50 24 Q70 24 70 40 Q60 32 50 33 Q40 32 30 40 Z" fill="#8B6F47" />
    <ellipse cx="50" cy="52" rx="16" ry="14" fill="#F0D6B8" />
    <circle cx="42" cy="44" r="3.8" fill="#3D3D5C" />
    <circle cx="58" cy="44" r="3.8" fill="#3D3D5C" />
    <ellipse cx="46" cy="55" rx="2" ry="2.8" fill="#8B6F47" />
    <ellipse cx="54" cy="55" rx="2" ry="2.8" fill="#8B6F47" />
    <path d="M42 61 Q50 66 58 61" stroke="#8B6F47" strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </svg>
);

export const Penguin: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M50 10 Q76 14 76 52 Q76 86 50 88 Q24 86 24 52 Q24 14 50 10 Z" fill="#5C6672" />
    <path d="M50 26 Q66 28 66 56 Q66 82 50 84 Q34 82 34 56 Q34 28 50 26 Z" fill="#F4F6FA" />
    <circle cx="42" cy="30" r="3.6" fill="#3D3D5C" />
    <circle cx="58" cy="30" r="3.6" fill="#3D3D5C" />
    <circle cx="43.4" cy="28.8" r="1.1" fill="white" />
    <circle cx="59.4" cy="28.8" r="1.1" fill="white" />
    <path d="M46 36 L50 42 L54 36 Z" fill="#F4A73E" />
    <path d="M26 44 Q14 54 20 68 Q28 62 30 54 Z" fill="#5C6672" />
    <path d="M74 44 Q86 54 80 68 Q72 62 70 54 Z" fill="#5C6672" />
    <ellipse cx="42" cy="90" rx="8" ry="4" fill="#F4A73E" />
    <ellipse cx="58" cy="90" rx="8" ry="4" fill="#F4A73E" />
  </svg>
);

export const Quail: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M52 22 Q52 12 58 8 Q57 16 62 18 Q56 20 56 26" stroke="#8B6F47" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <circle cx="54" cy="34" r="13" fill="#D8B98A" />
    <circle cx="58" cy="32" r="3.2" fill="#3D3D5C" />
    <path d="M66 35 L74 37.5 L66 40 Z" fill="#F4A73E" />
    <ellipse cx="42" cy="58" rx="26" ry="21" fill="#E5C398" />
    <path d="M28 50 Q40 46 52 50 M26 60 Q40 55 54 60" stroke="#C89B6E" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M18 54 Q10 58 12 66 Q18 64 22 60 Z" fill="#C89B6E" />
    <path d="M38 78 L38 86 M48 78 L48 86" stroke="#F4A73E" strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

export const Snake: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M18 76 Q10 66 20 60 Q34 54 48 60 Q62 66 74 60 Q86 54 82 42 Q78 32 64 34 Q54 36 52 44" stroke="#8FD6A8" strokeWidth="13" fill="none" strokeLinecap="round" />
    <circle cx="52" cy="46" r="11" fill="#A8E3BC" />
    <circle cx="49" cy="43" r="2.8" fill="#3D3D5C" />
    <circle cx="57" cy="43" r="2.8" fill="#3D3D5C" />
    <path d="M52 55 L52 62 M52 62 L48 66 M52 62 L56 66" stroke="#E86A8A" strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="30" cy="62" r="2.6" fill="#5FAE7E" opacity="0.65" />
    <circle cx="66" cy="60" r="2.6" fill="#5FAE7E" opacity="0.65" />
    <circle cx="78" cy="46" r="2.4" fill="#5FAE7E" opacity="0.65" />
  </svg>
);

export const Turtle: Art = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="48" cy="52" rx="30" ry="23" fill="#8FD6A8" />
    <path d="M36 40 L48 34 L60 40 L62 54 L48 62 L34 54 Z" fill="#5FAE7E" opacity="0.55" />
    <path d="M48 34 L48 62" stroke="#5FAE7E" strokeWidth="2" opacity="0.5" />
    <circle cx="82" cy="44" r="9.5" fill="#A8E3BC" />
    <circle cx="85" cy="42" r="2.6" fill="#3D3D5C" />
    <path d="M80 48 Q84 50 88 48" stroke="#5FAE7E" strokeWidth="2" fill="none" strokeLinecap="round" />
    <ellipse cx="28" cy="72" rx="8" ry="5" fill="#A8E3BC" />
    <ellipse cx="64" cy="73" rx="8" ry="5" fill="#A8E3BC" />
  </svg>
);

export const UmbrellaBird: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M32 30 Q30 14 46 12 Q60 10 62 22 Q52 18 44 22 Q36 25 32 30 Z" fill="#5C6672" />
    <circle cx="46" cy="34" r="14" fill="#6E7A88" />
    <circle cx="50" cy="31" r="3.4" fill="#3D3D5C" />
    <circle cx="51.2" cy="29.9" r="1" fill="white" />
    <path d="M58 34 L68 37 L58 41 Z" fill="#F4A73E" />
    <ellipse cx="42" cy="62" rx="20" ry="19" fill="#5C6672" />
    <path d="M42 50 Q46 58 42 68" stroke="#8A96A5" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M28 74 Q22 80 24 86 M38 78 L38 87" stroke="#5C6672" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const Vulture: Art = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="48" cy="58" rx="24" ry="21" fill="#8A7BA8" />
    <path d="M26 48 Q14 40 12 28 Q22 34 30 34 Z" fill="#6B5B7B" />
    <path d="M70 48 Q82 40 84 28 Q74 34 66 34 Z" fill="#6B5B7B" />
    <path d="M48 40 Q48 30 54 26" stroke="#E8DFF5" strokeWidth="7" fill="none" strokeLinecap="round" />
    <circle cx="57" cy="24" r="9" fill="#E8DFF5" />
    <circle cx="60" cy="22" r="2.6" fill="#3D3D5C" />
    <path d="M65 25 Q72 26 72 31 Q67 30 64 28 Z" fill="#F4A73E" />
    <path d="M36 62 Q48 70 60 62" stroke="#6B5B7B" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
    <path d="M42 78 L42 86 M54 78 L54 86" stroke="#F4A73E" strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

export const Whale: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M14 52 Q14 30 44 30 Q78 30 82 50 Q84 62 70 66 Q40 74 22 64 Q14 60 14 52 Z" fill="#8FD0FF" />
    <path d="M82 52 Q92 46 94 38 Q96 48 92 54 Q96 58 94 66 Q88 62 82 58 Z" fill="#74B9FF" />
    <circle cx="30" cy="46" r="3.6" fill="#3D3D5C" />
    <path d="M22 56 Q30 60 40 58" stroke="#4E92CC" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <ellipse cx="52" cy="62" rx="22" ry="7" fill="#D4EEFF" opacity="0.7" />
    <path d="M40 26 Q38 18 42 14 M44 26 Q46 17 43 12 M48 26 Q50 19 54 16" stroke="#74B9FF" strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </svg>
);

export const Yak: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M28 30 Q16 26 14 16 Q26 18 32 26 M72 30 Q84 26 86 16 Q74 18 68 26" stroke="#B8AED0" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M50 22 Q74 24 76 50 Q77 74 50 78 Q23 74 24 50 Q26 24 50 22 Z" fill="#8B6F47" />
    <path d="M30 40 Q50 34 70 40 L70 66 Q50 76 30 66 Z" fill="#6B4B33" />
    <path d="M32 30 Q50 24 68 30 Q60 36 50 36 Q40 36 32 30 Z" fill="#A8845C" />
    <circle cx="41" cy="46" r="4" fill="white" />
    <circle cx="59" cy="46" r="4" fill="white" />
    <circle cx="41" cy="46" r="2.2" fill="#3D3D5C" />
    <circle cx="59" cy="46" r="2.2" fill="#3D3D5C" />
    <ellipse cx="50" cy="62" rx="11" ry="8" fill="#D8B98A" />
    <circle cx="46" cy="61" r="2.2" fill="#6B4B33" />
    <circle cx="54" cy="61" r="2.2" fill="#6B4B33" />
  </svg>
);

/** Registry keyed by lowercase animal name */
export const ANIMAL_ART: Record<string, Art> = {
  alligator: Alligator, bear: Bear, cat: Cat, dog: Dog, elephant: Elephant,
  frog: Frog, giraffe: Giraffe, horse: Horse, iguana: Iguana,
  jellyfish: Jellyfish, koala: Koala, lion: Lion, monkey: Monkey, nest: Nest,
  octopus: Octopus, penguin: Penguin, quail: Quail, rabbit: Rabbit,
  snake: Snake, turtle: Turtle, "umbrella bird": UmbrellaBird,
  vulture: Vulture, whale: Whale, "x-ray fish": Fish, yak: Yak, zebra: Zebra,
};
