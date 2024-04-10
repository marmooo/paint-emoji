import { basename } from "https://deno.land/std/path/mod.ts";
import { expandGlobSync } from "https://deno.land/std/fs/mod.ts";

function fluentUIEmoji() {
  console.log("Fluent UI Emoji");
  const dir = "svg/fluentui-emoji";
  try {
    Deno.statSync(dir);
    Deno.removeSync(dir, { recursive: true });
  } catch {
    // skip
  }
  Deno.mkdirSync(`${dir}-flat`, { recursive: true });
  Deno.mkdirSync(`${dir}-high-contrast`, { recursive: true });
  const glob = expandGlobSync("vendor/fluentui-emoji/assets/**/*.svg", {
    globstar: true,
  });
  for (const file of glob) {
    const fileName = basename(file.path);
    if (fileName.endsWith("flat.svg")) {
      const name = fileName.slice(0, -9);
      Deno.copyFileSync(file.path, `${dir}-flat/${name}.svg`);
    } else if (fileName.endsWith("high_contrast.svg")) {
      const name = fileName.slice(0, -18);
      Deno.copyFileSync(file.path, `${dir}-high-contrast/${name}.svg`);
    }
  }
}

fluentUIEmoji();
