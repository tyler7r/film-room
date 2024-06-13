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
