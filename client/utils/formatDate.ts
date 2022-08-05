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

  let year = date.getFullYear();
  let hours = date.getHours();
  let day = date.getDay();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "p.m" : "a.m";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + formattedMinutes + ampm + " " + year;
  return days[day] + " " + strTime;
}
