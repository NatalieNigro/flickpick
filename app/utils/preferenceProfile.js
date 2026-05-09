const KEY = "flickpickUMPP";

export function getPreferenceProfile() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY) || "";
}

export function savePreferenceProfile(profile) {
  if (typeof window === "undefined") return;
  if (profile) localStorage.setItem(KEY, profile);
}
