# Installed modules

- express
- @types/express
- readdir-enhanced

# Code

```ts
import { Request, Response } from "express";
import { resolve } from "path";
import { readdirSync } from "@jsdevtools/readdir-enhanced";

export const requestEndpoint = (req: Request, res: Response) => {
  // /path/to/routes/directory
  const root = resolve("/path", "to", "routes", "directory");

  const { file, body } = readdirSync(root, {
    deep: true,
    filter: /^.*\.[tj]s$/,
    sep: "/",
    basePath: "/"
  })
    .map(file => {
      const initialFile = file;
      let m;
      for (const match of initialFile.matchAll(/\/\[([\s\S]+?)]\//g))
        file = file.replace(match[0], `/(?<${match[1]}>.*)/`);
      if ((m = req.path.match(new RegExp(`^${file}$`))))
        return { file: resolve(root, `.${initialFile}`), body: { ...m.groups } };
    })
    .filter(Boolean)[0];
  Object.assign(req.method.toLowerCase() === "get" ? req.query : req.body, body);

  try {
    const handlers = require(file);
    if (handlers[req.method.toLowerCase()]) {
      (handlers[req.method.toLowerCase()] || handlers[req.method.toUpperCase()])(req, res);
    } else {
      res.status(405).json({ code: 405, error: "Method Not Allowed" });
    }
  } catch (e) {
    res.status(405).json({ code: 405, error: "Method Not Allowed" });
  }
};
```

# Usage

Use as endpoint

```ts
import express from "express";
import { requestEndpoint } from "...";

const app = express();
app.all("*", requestEndpoint);
```
