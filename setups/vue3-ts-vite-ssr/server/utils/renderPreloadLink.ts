import { extname } from "path";

enum FileTypeEndings {
  JS = ".js",
  CSS = ".css",
  WOFF = ".woff",
  WOFF2 = ".woff2",
  GIF = ".gif",
  JPG = ".jpg",
  JPEG = ".jpeg",
  PNG = ".png"
}

interface Property extends Record<string, string | boolean | undefined> {
  rel: "modulepreload" | "stylesheet" | "preload";
  crossorigin?: boolean;
  as?: "font" | "image";
  type?: string;
}

const properties: Record<FileTypeEndings, Property> = {
  [FileTypeEndings.JS]: { rel: "modulepreload", crossorigin: true },
  [FileTypeEndings.CSS]: { rel: "stylesheet" },
  [FileTypeEndings.WOFF]: { rel: "preload", crossorigin: true, as: "font", type: "type/woff" },
  [FileTypeEndings.WOFF2]: { rel: "preload", crossorigin: true, as: "font", type: "font/woff2" },
  [FileTypeEndings.GIF]: { rel: "preload", as: "image", type: "image/gif" },
  [FileTypeEndings.JPG]: { rel: "preload", as: "image", type: "image/jpeg" },
  [FileTypeEndings.JPEG]: { rel: "preload", as: "image", type: "image/jpeg" },
  [FileTypeEndings.PNG]: { rel: "preload", as: "image", type: "image/png" }
};

export const renderPreloadLink = (file: string) => {
  const extension = extname(file) as FileTypeEndings;

  if (properties[extension]) {
    properties[extension].href = file;

    const props = Object.entries(properties[extension])
      .reduce<string[]>((acc, [k, v]) => {
        acc.push(`${k}="${v}"`);
        return acc;
      }, [])
      .join(" ");

    return `<link ${props} />`;
  }

  return ``;
};
