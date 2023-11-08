import sinon from "sinon";
import tap from "tap";

import { getCryptoInitializers, parse } from "./crypto.js";

tap.test("crypto utilities", async (cryptoTests) => {
  const fetch = sinon.stub();

  cryptoTests.beforeEach(() => {
    fetch.reset();

    fetch.withArgs("https://maps.amtrak.com/rttl/js/RoutesList.json").resolves({
      json: async () => [],
    });

    const s = "12345678";
    const v = "12345678901234567890123456789012";

    fetch
      .withArgs("https://maps.amtrak.com/rttl/js/RoutesList.v.json")
      .resolves({
        json: async () => ({
          arr: ["0b1d2897-640a-4c64-a1d8-b54f453a7ad7"],
          s: [s, s, s, s, s, s, s, s, "deadbeef"],
          // prettier-ignore
          v: [
            v, v, v, v, v, v, v, v, v, v,
            v, v, v, v, v, v, v, v, v, v,
            v, v, v, v, v, v, v, v, v, v,
            v, v,
            "7e117a1e7e117a1e7e117a1e7e117a1e",
          ],
        }),
      });
  });

  cryptoTests.test("fetching the keys and stuff", async (test) => {
    const {
      PUBLIC_KEY: key,
      CRYPTO_SALT: salt,
      CRYPTO_IV: iv,
    } = await getCryptoInitializers(fetch);

    test.same(key, "0b1d2897-640a-4c64-a1d8-b54f453a7ad7");
    test.same(salt.toString("hex"), "deadbeef");
    test.same(iv.toString("hex"), "7e117a1e7e117a1e7e117a1e7e117a1e");
  });

  cryptoTests.test("parses an encrypted string", async (test) => {
    // This is an encrypted string of the type we'd get from Amtrak. The private
    // key is "private_key" and the payload is a JSON string that (see the test)
    // is a message for the emperor.
    //
    // See the bottom of this test file for commented code where I built up the
    // test ciphertext.
    const parsedMessage = await parse(
      "9REEYi/JXW52zpVxlbzDP/zQ2NxJE8ykzOdkuiiLn8U0PskEpazNwyQIpmOBlJthSQeY8NhCd9gldfh7C/CscgnbFUD7IHkKaK4fnwB6tyY1C5vh4yZ8rUj5NmPMHCM9G2d/zqKvBZw3iXZFjg18Jw==",
    );

    test.matchOnly(parsedMessage, { a: "message", for: "the emperor" });
  });
});

/*
import { createDecipheriv, createCipheriv, pbkdf2Sync } from "node:crypto";

const PUBLIC_KEY = "0b1d2897-640a-4c64-a1d8-b54f453a7ad7";
const CRYPTO_SALT = Buffer.from("deadbeef", "hex");
const CRYPTO_IV = Buffer.from("7e117a1e7e117a1e7e117a1e7e117a1e", "hex");

// Encryption method. It's basically a reverse of the decrypt method in
// the crypto.js utility module
const enc = async (str, PK = PUBLIC_KEY) =>
  new Promise((resolve) => {
    const key = pbkdf2Sync(PK, CRYPTO_SALT, 1_000, 16, "sha1");
    const cipher = createCipheriv("aes-128-cbc", key, CRYPTO_IV);
    cipher.setEncoding("base64");

    const ciphertext = [];
    cipher.on("data", (chunk) => {
      if (chunk) {
        ciphertext.push(chunk);
      }
    });
    cipher.on("end", () => {
      resolve(ciphertext.join(""));
    });

    cipher.write(str);
    cipher.end();
  });

const makeCipherBlob = async () => {
  // The actual private key is derived from the password, which is the first
  // part of this string, "private_key". But this extra stuff is tacked on to
  // private key when it's encrypted, ostensibly to make it harder to decrypt.
  const privateKey =
    "private_key|date string or something|time sneaky sneaky haha";

  // Encrypt the private key with the global public key
  const cipherkey = await enc(privateKey);

  // The binary length needs to be 64 and the base64-encoded length needs to be
  // 88. I output these here so I could fiddle with the padding stuff above to
  // get the right output lengths.
  console.log(cipherkey.length, Buffer.from(cipherkey, "base64").length);

  // Here's the actual message.
  const plaintext = JSON.stringify({ a: "message", for: "the emperor" });

  // Encrypt it with "private_key," not with the encrypted or derived keys.
  const ciphertext = await enc(plaintext, "private_key");

  // Smoosh them together and display them. This is what we can use for tests.
  console.log(`${ciphertext}${cipherkey}`);
};

await makeCipherBlob();
*/
