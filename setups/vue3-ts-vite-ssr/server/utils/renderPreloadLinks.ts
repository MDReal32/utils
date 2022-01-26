import { basename } from "path";
import { renderPreloadLink } from "./renderPreloadLink";

export const renderPreloadLinks = (modules: string[], manifest: Record<string, string[]>) => {
  const links: string[] = [];
  const seen = new Set();
  for (const id of modules) {
    const files = manifest[id];
    if (!files) continue;

    for (const file of files) {
      if (seen.has(file)) continue;

      seen.add(file);
      const filename = basename(file);
      if (!manifest[filename]) continue;

      for (const depFile of manifest[filename]) {
        links.push(renderPreloadLink(depFile));
        seen.add(depFile);
      }
      links.push(renderPreloadLink(file));
    }
  }

  return links.join("");
};
