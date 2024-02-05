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
  "AUDL",
  "D1 College Men's",
  "D1 College Women's",
  "D3 College Men's",
  "D3 College Women's",
  "Other",
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
