/**
 * Get the current date in the format "dd-mm-yyyy".
 * @returns {string} The current date.
 */
export function getCurrentDate() {
  const today = new Date();
  const date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
  return date;
}

export function convertDate(dateStr: string): string {
  const [monthAbbr, day] = dateStr.split(" ");

  const monthMap: { [key: string]: string } = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December"
  };

  const englishMonth = monthMap[monthAbbr];

  if (!englishMonth) {
    throw new Error(`Unknown month abbreviation: ${monthAbbr}`);
  }

  return `${englishMonth} ${day}, 2025`;
}