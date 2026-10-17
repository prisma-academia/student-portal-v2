/**
 * Shared "a navigation is in flight" flag for the top progress bar.
 * Link clicks start it automatically (components/system/nav-progress.tsx);
 * call navProgress.start() before a programmatic router.push/replace.
 */
import { useSyncExternalStore } from "react";

type Listener = () => void;

let pending = false;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

export const navProgress = {
  start() {
    if (pending) return;
    pending = true;
    emit();
  },
  done() {
    if (!pending) return;
    pending = false;
    emit();
  },
  get: () => pending,
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

/** True while a navigation is in flight; keep a submit button busy until the next page lands. */
export function useNavPending() {
  return useSyncExternalStore(navProgress.subscribe, navProgress.get, () => false);
}
