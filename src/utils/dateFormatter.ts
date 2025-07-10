/**
 * Get the current date in the format "dd-mm-yyyy".
 * @returns {string} The current date.
 */
export function getCurrentDate() {
  const today = new Date();
  const date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
  return date;
}

export function convertDate(dateStr: string) {
  const [, day] = dateStr.split(" ");
  const indonesianMonth = "Maret";

  return `${day} ${indonesianMonth} 2025`;
}