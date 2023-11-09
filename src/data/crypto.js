import { createDecipheriv, pbkdf2Sync } from "node:crypto";

let cryptoInitializers = false;

// The public key (used to encrypt private key passwords), key derivation salt,
// and AES initialization vectors are all provided by the API. Fetch them.
export const getCryptoInitializers = async (fetch = global.fetch) => {
  if (cryptoInitializers === false) {
    // First, the index of the public key is the sum of all zoom levels for all
    // routes, so let's get that real quick.
    const masterZoom = await fetch(
      "https://maps.amtrak.com/rttl/js/RoutesList.json",
    )
      .then((r) => r.json())
      .then((list) =>
        list.reduce((sum, { ZoomLevel }) => sum + (ZoomLevel ?? 0), 0),
      );

    // Then fetch the data containing our values.
    const cryptoData = await fetch(
      "https://maps.amtrak.com/rttl/js/RoutesList.v.json",
    ).then((r) => r.json());

    // And pull them out.
    cryptoInitializers = {
      PUBLIC_KEY: cryptoData.arr[masterZoom],
      // The salt and IV indices are equal to the length of any given value in the
      // array. So if salt[0] is 8 bytes long, then our value is at salt[8]. Etc.
      CRYPTO_SALT: Buffer.from(cryptoData.s[cryptoData.s[0].length], "hex"),
      CRYPTO_IV: Buffer.from(cryptoData.v[cryptoData.v[0].length], "hex"),
    };
  }
  return cryptoInitializers;
};

// The "private key" embedded in each response is really more of a password used
// to derive a key. Anyway, it's 64 bytes long. Base64 decoded and padded, it
// comes out to 88 bytes. And that's where this number comes from.
const MASTER_SEGMENT = 88;

export const decrypt = async (data, keyDerivationPassword) => {
  const { PUBLIC_KEY, CRYPTO_SALT, CRYPTO_IV } = await getCryptoInitializers();

  // The content is base64 encoded, so decode that to binary first.
  const ciphertext = Buffer.from(data, "base64");

  // The actual key is derived from the derivation password using the salt from
  // the API and PBKDF2 with SHA1, with 1,000 iterations and a 16-byte output.
  const key = pbkdf2Sync(
    keyDerivationPassword ?? PUBLIC_KEY,
    CRYPTO_SALT,
    1_000,
    16,
    "sha1",
  );

  // It's encrypted with AES-128-CBC using the generated key above and the
  // hardcoded initialization vector.
  const decipher = createDecipheriv("aes-128-cbc", key, CRYPTO_IV);

  // The Node library works in chunks, so we'll get some stuff out as soon as we
  // update the decipher, and we have to get the rest out by calling .final().
  // The result is a string either way, so just join the array of results at the
  // end and be happy.
  const text = [decipher.update(ciphertext, "binary", "utf-8")];
  text.push(decipher.final("utf-8"));
  return text.join("");
};

export const parse = async (data) => {
  // The encrypted data is at the beginning. The last 88 bytes are the base64
  // encoded private key password. Slice those two out.
  const ciphertext = data.slice(0, -MASTER_SEGMENT);
  const privateKeyCipher = data.slice(-MASTER_SEGMENT);

  // The private key password is encrypted with the public key provided by the
  // API. It's a pipe-delimited string, but only the first segment is useful.
  // We can toss out the rest.
  const [privateKey] = await decrypt(privateKeyCipher).then((keyFragments) =>
    keyFragments.split("|"),
  );

  // The actual data is encrypted with the private key. The result is always
  // JSON (for our purposes), so go ahead and parse that.
  return JSON.parse(await decrypt(ciphertext, privateKey));
};
