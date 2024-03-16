import { makeVar } from "@apollo/client";
import { StoredAnimation } from "./types";

export const myNameVar = makeVar<string>(`Name-${Math.random().toString(36)}`);
export const selectedAnimationVar = makeVar<StoredAnimation | null>(null);