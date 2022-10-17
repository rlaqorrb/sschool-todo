import crypto from "crypto";

const createHashedPassword = (password) => {
  return crypto.createHash("sha512").update(password).digest("base64");
};

console.log(createHashedPassword("1234"));
console.log(createHashedPassword("1234"));
console.log(createHashedPassword("1234"));