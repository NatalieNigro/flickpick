// --------------------------
// Pick List Helper Functions
//---------------------------

// This is the name we use when storing data in the browser
// Think of it like a labeled drawer
const PICK_LIST_KEY = "flickpickPickList";

// Get all saved movies from the Pick List
export function getPickList() {
  // This check prevents errors when the page is loading on the server
  if (typeof window === "undefined") return [];

  // Grab the saved data from the browser
  const data = localStorage.getItem(PICK_LIST_KEY);

  // Convert it from text back into usable data
  return data ? JSON.parse(data) : [];
}

// Add a movie to the Pick List
export function saveToPickList(movie) {
  const current = getPickList();

  // Check if the movie is already saved
  const alreadyExists = current.some(
    (m) => m.title === movie.title && m.year === movie.year
  );

  // Only add it if it’s not already there
  if (!alreadyExists) {
    const updated = [...current, movie];
    localStorage.setItem(PICK_LIST_KEY, JSON.stringify(updated));
  }
}

// Remove a movie from the Pick List
export function removeFromPickList(title, year) {
  const current = getPickList();

  // Keep everything EXCEPT the movie we want to remove
  const updated = current.filter(
    (m) => !(m.title === title && m.year === year)
  );

  localStorage.setItem(PICK_LIST_KEY, JSON.stringify(updated));
}
