export function formatDate(date: Date) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const year = date.getFullYear();
  let hours = date.getHours();
  const day = date.getDay();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "p.m" : "a.m";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const strTime = hours + ":" + formattedMinutes + ampm + " " + year;
  return days[day] + " " + strTime;
}

export function timeSince(date: Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  let interval = seconds / 31536000;

  if (interval >= 1) {
    return Math.floor(interval) + "y";
  }
  interval = seconds / 604800;
  if (interval >= 1) {
    return Math.floor(interval) + "w";
  }
  interval = seconds / 86400;
  if (interval >= 1) {
    return Math.floor(interval) + "d";
  }
  interval = seconds / 3600;
  if (interval >= 1) {
    return Math.floor(interval) + "h";
  }
  interval = seconds / 60;
  if (interval >= 1) {
    return Math.floor(interval) + "m";
  }
  return Math.floor(seconds) + "s";
}
