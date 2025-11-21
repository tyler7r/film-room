import type { UserSession, UserType } from "./types";

export const validateEmail = (email: string) => {
  const regex = new RegExp(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
  if (regex.test(email)) {
    return true;
  }
  return false;
};

export const validatePwdMatch = (p1: string, p2: string) => {
  if (p1 === p2) {
    return true;
  } else {
    return false;
  }
};

export const divisions = [
  "Open",
  "Mixed",
  "Women's",
  "PUL",
  "WUL",
  "UFA",
  "D1 College Men's",
  "D1 College Women's",
  "D3 College Men's",
  "D3 College Women's",
  "Youth",
  "Other",
];

export const proDivs = ["UFA", "WUL", "PUL"];

export const recentYears = [
  2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014,
];

export const isItemUnique = (item: string, array: string[] | null) => {
  if (array) {
    const itemInArray = array.includes(item);
    if (itemInArray) return false;
    else return true;
  } else {
    return true;
  }
};

export const isValidYoutubeLink = (link: string) => {
  const youtubeRegEx = new RegExp(
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))((\w|-){11})(?:\S+)?$/,
  );
  const isValid = youtubeRegEx.test(link);
  if (isValid) return true;
  else return false;
};

export const getToAndFrom = (itemsPerPage: number, page: number) => {
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  return { from, to };
};

export const getNumberOfPages = (itemPerPage: number, count: number) => {
  if (count % itemPerPage !== 0) return Math.floor(count / itemPerPage) + 1;
  else return count / itemPerPage;
};

export const convertTimestamp = (date: string) => {
  const month =
    date.slice(5, 6) === "0" ? date.slice(6, 7) : date.substring(5, 7);
  const day =
    date.slice(8, 9) === "0" ? date.slice(9, 10) : date.substring(8, 10);
  return `${month}/${day}`;
};

export const convertFullTimestamp = (date: string) => {
  const d = new Date(date);
  return d.toLocaleString();
};

export const convertYouTubeTimestamp = (time: number) => {
  let newTimestamp = "";
  time < 3600
    ? (newTimestamp = new Date(time * 1000).toISOString().substring(14, 19))
    : (newTimestamp = new Date(time * 1000).toISOString().substring(11, 19));
  return newTimestamp;
};

export const getTimeSinceNotified = (date: string) => {
  const present = new Date();
  const created = new Date(date);

  const utc1 = Date.UTC(
    present.getFullYear(),
    present.getMonth(),
    present.getDate(),
  );
  const utc2 = Date.UTC(
    created.getFullYear(),
    created.getMonth(),
    created.getDate(),
  );

  // Calculate the time difference in milliseconds
  const timeDiff = Math.abs(utc2 - utc1);

  // Convert milliseconds to days
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  if (daysDiff < 1) return "today";
  if (1 <= daysDiff && daysDiff <= 13) return `${daysDiff}d ago`;
  if (14 <= daysDiff && daysDiff <= 56)
    return `${Math.round(daysDiff / 7)}w ago`;
  if (57 <= daysDiff && daysDiff <= 365)
    return `${Math.round(daysDiff / 30)}mo ago`;
  if (daysDiff >= 366) return `${Math.round(daysDiff / 365)}y ago`;
};

export const youtubeRegEx = (link: string) => {
  const url = link.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  const newLink =
    url[2] !== undefined ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
  const fullLink = `https://www.youtube.com/watch?v=${newLink}`;
  return fullLink;
};

export const proDivWeeks = [
  "Practice",
  "Preseason",
  "Week 1",
  "Week 2",
  "Week 3",
  "Week 4",
  "Week 5",
  "Week 6",
  "Week 7",
  "Week 8",
  "Week 9",
  "Week 10",
  "Week 11",
  "Week 12",
  "Week 13",
  "Playoffs",
  "Championship Weekend",
];

type CondensedUserDetails = {
  email: string;
  name: string | null;
};

export const getDisplayName = (
  user: UserType | UserSession | CondensedUserDetails,
) => {
  if (user.name && user.name !== "") {
    return user.name;
  }
  // If no name, use the part of the email before '@'
  if (user.email) {
    const atIndex = user.email.indexOf("@");
    if (atIndex !== -1) {
      return user.email.substring(0, atIndex);
    }
    return user.email; // Fallback if no '@' symbol for some reason
  }
  return "Unknown User"; // Fallback if neither name nor email
};
