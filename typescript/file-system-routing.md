# Installed modules

- express
- @types/express
- readdir-enhanced

# Code

```ts
import { Request, Response, NextFunction } from "express";
import { resolve } from "path";
import { readdirSync } from "@jsdevtools/readdir-enhanced";

export const requestEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  // /path/to/routes/directory
  const root = resolve("/path", "to", "routes", "directory");

  const files = readdirSync(root, {
    deep: true,
    filter: /^.*\.[tj]s$/,
    sep: "/",
    basePath: "/"
  });

  const modifiedFiles = files.map(file => {
    const fileRegex = file
      .replace(/\//g, "\\/")
      .replace(/\./g, "\\.")
      .replace(/\\\/\[\w+](?:\/|\\.)/g, full => {
        const starting = full.slice(0, 2);
        const ending = full.slice(-2);
        const body = full.slice(starting.length, -1 * ending.length);
        const rawBody = body.slice(1, -1);
        return `${starting}(?<${rawBody}>.*)${ending}`;
      });

    const path = req.path === "/" ? "index" : req.path;
    const filePath = `${path}${file.slice(-3)}`;
    const regex = new RegExp(`^${fileRegex}$`);

    let m;
    return (m = filePath.match(regex))
      ? { file: resolve(root, `.${file}`), body: { ...m.groups } }
      : {};
  });

  const { file = "", body = {} } = modifiedFiles.find(route => !!Object.keys(route).length)!;
  Object.assign(body, req.method.toLowerCase() === "get" ? req.query : req.body);

  try {
    const handlers = require(file);
    const handler = handlers[req.method.toLowerCase()] || handlers[req.method.toUpperCase()];

    if (handler) {
      const response = await handler(req, res);
      if (response) {
        if (typeof response === "object") {
          res.status(200).json(response);
        } else {
          res.status(200).write(response);
        }
      }
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

# Example

For Example in routes directory we have 3 files.

- /api/v1/routeMe.ts
- /api/v1/[user].ts
- /api/v1/[user]/[article].ts

In first route we getting simple path.  
In second route we getting route but with body { user: routeValueHere }  
In third route we getting route with { user: firstBracketsValue, article: secondBracketsValue } body.

In Each route file must function with (lower or upper case) method name.
