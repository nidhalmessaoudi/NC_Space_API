import crypto from "crypto";

const encryptToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export default encryptToken;
