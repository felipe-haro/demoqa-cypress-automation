const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pad = (n) => String(n).padStart(2, '0');

/** Parses an ISO date (YYYY-MM-DD) without timezone shifts. */
export const parseIsoDate = (iso) => {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, monthIndex: month - 1, day };
};

/** Format used by the Practice Form input, e.g. "05 Mar 1995". */
export const toInputFormat = ({ year, monthIndex, day }) =>
  `${pad(day)} ${MONTHS[monthIndex].slice(0, 3)} ${year}`;

/** Format used by the submission modal, e.g. "05 March,1995". */
export const toSubmissionFormat = ({ year, monthIndex, day }) => `${pad(day)} ${MONTHS[monthIndex]},${year}`;

/** Returns an ISO date N days from today (negative values go to the past). */
export const isoDaysFromToday = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
