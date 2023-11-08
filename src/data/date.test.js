import tap from "tap";

import { getTimezoneFromCharacter, parseDate } from "./date.js";

tap.test("date utilities", async (dateTests) => {
  dateTests.test("get timezone from a character", async (tzCharTests) => {
    tzCharTests.test("east coast", async (test) => {
      const actual = getTimezoneFromCharacter("e");
      test.same(actual, "America/New_York");
    });

    tzCharTests.test("center coast", async (test) => {
      const actual = getTimezoneFromCharacter("c");
      test.same(actual, "America/Chicago");
    });

    tzCharTests.test("mountain coast", async (test) => {
      const actual = getTimezoneFromCharacter("m");
      test.same(actual, "America/Denver");
    });

    tzCharTests.test("left coast", async (test) => {
      const actual = getTimezoneFromCharacter("p");
      test.same(actual, "America/Los_Angeles");
    });

    tzCharTests.test("unknown coast", async (test) => {
      const actual = getTimezoneFromCharacter("q");
      test.same(actual, "America/New_York");
    });
  });

  dateTests.test(
    "parse ugly Amtrak date into ISO8601 strings",
    async (parseTests) => {
      parseTests.test("handles falsey dates", async (test) => {
        const actual = parseDate(false);
        test.same(actual, null);
      });

      parseTests.test("defaults to NY timezone", async (test) => {
        const actual = parseDate("02/03/2017 3:47:00");
        test.same(actual, "2017-02-03T08:47:00.000Z");
      });

      parseTests.test("uses the optionally provided timezone", async (test) => {
        const actual = parseDate("02/03/2017 3:47:00", "America/Denver");
        test.same(actual, "2017-02-03T10:47:00.000Z");
      });
    },
  );
});
