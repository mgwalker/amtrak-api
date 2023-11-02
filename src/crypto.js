import { createDecipheriv, pbkdf2Sync } from "node:crypto";

// These values are hardcoded.
const CRYPTO_SALT = Buffer.from("9a3686ac", "hex");
const CRYPTO_IV = Buffer.from("c6eb2f7f5c4740c1a2f708fefd947d39", "hex");
const MASTER_SEGMENT = 88;
const PUBLIC_KEY = "69af143c-e8cf-47f8-bf09-fc1f61e5cc33";

export const decrypt = (data, key = PUBLIC_KEY) => {
  // The content is base64 encoded, so decode that to binary first.
  const ciphertext = Buffer.from(data, "base64");

  // Our local key is a hash of the input key and the hardcoded salt, via
  // PBKDF2 with SHA1, with 1,000 iterations and a 16-byte (128 bit) output.
  const localKey = pbkdf2Sync(key, CRYPTO_SALT, 1_000, 16, "sha1");

  // It's encrypted with AES-128-CBC using the generated key above and the
  // hardcoded initialization vector.
  const decipher = createDecipheriv("aes-128-cbc", localKey, CRYPTO_IV);

  // The Node library works in chunks, so we'll get some stuff out as soon as we
  // update the decipher, and we have to get the rest out by calling .final().
  // The result is a string either way, so just join the array of results at the
  // end and be happy.
  const text = [decipher.update(ciphertext, "binary", "utf-8")];
  text.push(decipher.final("utf-8"));
  return text.join("");
};

export const parse = (data) => {
  const ciphertext = data.slice(0, -MASTER_SEGMENT);
  const privateKeyCipher = data.slice(-MASTER_SEGMENT);

  const [privateKey] = decrypt(privateKeyCipher).split("|");

  return JSON.parse(decrypt(ciphertext, privateKey));
};

await fetch("https://maps.amtrak.com/rttl/js/RoutesList.json")
  .then((r) => r.json())
  .then((list) =>
    list.reduce((sum, { ZoomLevel }) => sum + (ZoomLevel ?? 0), 0),
  );
