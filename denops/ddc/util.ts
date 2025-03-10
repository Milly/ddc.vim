import { assertEquals, Denops, op } from "./deps.ts";

export async function convertKeywordPattern(
  denops: Denops,
  keywordPattern: string,
): Promise<string> {
  const iskeyword = await op.iskeyword.getLocal(denops);
  return keywordPattern.replaceAll(
    /\\k/g,
    () => "[" + vimoption2ts(iskeyword) + "]",
  );
}

function vimoption2ts(option: string): string {
  let hasDash = false;
  const patterns: string[] = [];
  for (let pattern of option.split(",")) {
    if (pattern.match(/\d+/)) {
      pattern = pattern.replaceAll(/\d+/g, (s: string) => {
        return String.fromCharCode(parseInt(s, 10));
      });
    }

    switch (pattern) {
      case "":
        // ,
        if (patterns.indexOf(",") < 0) {
          patterns.push(",");
        }
        break;
      case "@":
        patterns.push("a-zA-Z");
        break;
      case "\\":
        patterns.push("\\\\");
        break;
      case "-":
        hasDash = true;
        break;
      default:
        patterns.push(pattern);
        break;
    }
  }

  // Dash must be last.
  if (hasDash) {
    patterns.push("-");
  }

  return patterns.join("");
}

Deno.test("vimoption2ts", () => {
  assertEquals(vimoption2ts("@,48-57,_,\\"), "a-zA-Z0-9_\\\\");
  assertEquals(vimoption2ts("@,-,48-57,_"), "a-zA-Z0-9_-");
  assertEquals(vimoption2ts("@,,,48-57,_"), "a-zA-Z,0-9_");
  assertEquals(vimoption2ts("@,48-57,_,-,+,\\,!~"), "a-zA-Z0-9_+\\\\!~-");
});
