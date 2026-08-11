import type { Module } from "@games/letter-tracing/types";

/** Canonical symbol lists for progress tracking, shared by the store, the
 *  home shelf and the page router — defined once, imported everywhere. */
export const LETTER_SYMBOLS: readonly string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const NUMBER_SYMBOLS: readonly string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export function symbolsFor(module: Module): readonly string[] {
  return module === "numbers" ? NUMBER_SYMBOLS : LETTER_SYMBOLS;
}
