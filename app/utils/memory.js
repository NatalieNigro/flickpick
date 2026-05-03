const MEMORY_KEY = "flickpickMemory";
const LAST_RESULTS_KEY = "flickpickLastResults";

export function getMemory() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];
}

export function saveMemory(newMemory) {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(newMemory));
}

export function getLastResults() {
  if (typeof window === "undefined") return null;
  return JSON.parse(localStorage.getItem(LAST_RESULTS_KEY));
}

export function saveLastResults(intro, movies, vibe) {
  localStorage.setItem(
    LAST_RESULTS_KEY,
    JSON.stringify({
      intro,
      movies,
      vibe,
    })
  );
}
