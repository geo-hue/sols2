export const formatTime = (date: Date | string): string => {
  const d = new Date(date);

  // Get hours and determine AM/PM
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  // Convert hours from 24-hour to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'

  // Format hours as a string and pad with leading zero if needed
  const formattedHours = String(hours).padStart(1, "0");

  return `${formattedHours}:${minutes}${ampm}`;
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = String(d.getFullYear()).slice(2);
  return `${day}/${month}/${year}`;
};