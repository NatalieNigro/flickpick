// --------------------------
// Pick List Helper Functions
//---------------------------

const PICK_LIST_KEY = "flickpickPickList";

export function getPickList() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(PICK_LIST_KEY)) || [];
}

export function saveToPickList(movie) {
  const current = getPickList();
  const alreadyExists = current.some(
    (item) => item.title === movie.title && item.year === movie.year
  );

  if (!alreadyExists) {
    localStorage.setItem(PICK_LIST_KEY, JSON.stringify([...current, movie]));
  }
}

export function removeFromPickList(title, year) {
  const current = getPickList();
  const updated = current.filter(
    (movie) => !(movie.title === title && movie.year === year)
  );
  localStorage.setItem(PICK_LIST_KEY, JSON.stringify(updated));
}
