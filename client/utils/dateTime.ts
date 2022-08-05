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

// https://stackoverflow.com/a/69122877/18365823
export function timeAgo(dateIput: Date) {
  const date = dateIput instanceof Date ? dateIput : new Date(dateIput);
  const formatter = new Intl.RelativeTimeFormat("en");
  const ranges: any = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (let key in ranges) {
    if (ranges[key] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key];
      return formatter.format(Math.round(delta), key as any);
    }
  }
}

export function timeSince(date: any) {
  var seconds = Math.floor(((new Date() as any) - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + "y";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "w";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "d";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "h";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "m";
  }
  return Math.floor(seconds) + "s";
}

export function dateToTimeAgo(date: Date): string {
  const now = new Date(Date.now());
  const difftime = now.getTime() - date.getTime();
  const diffDate = new Date(difftime - 5.5 * 60 * 60 * 1000);
  const [sec, min, hr, day, month] = [
    diffDate.getSeconds(),
    diffDate.getMinutes(),
    diffDate.getHours(),
    diffDate.getDate() - 1,
    diffDate.getMonth(),
  ];
  const f = (property: number, end: string) => {
    // console.log(property,end)
    return `${property} ${end}${property > 1 ? "s" : ""} ago`;
  };
  // console.log(diffDate.toLocaleString());
  return month >= 1
    ? f(month, "month")
    : day >= 1
    ? f(day, "day")
    : hr >= 1
    ? f(hr, "hr")
    : min >= 1
    ? f(min, "min")
    : day >= 1
    ? f(sec, "sec")
    : "";

  throw new Error("Date To time ago not implmented");
}
