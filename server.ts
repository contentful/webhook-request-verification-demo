import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import { verifyRequest } from "@contentful/node-apps-toolkit";

const app: Express = express();
const port = 3000;

app.use(
  bodyParser.json({
    type: "application/vnd.contentful.management.v1+json",
  })
);

app.use((req, res, next) => {
  const canonicalRequest = {
    body: JSON.stringify(req.body),
    headers: JSON.parse(JSON.stringify(req.headers)),
    method: req.method as
      | "GET"
      | "PATCH"
      | "HEAD"
      | "POST"
      | "DELETE"
      | "OPTIONS"
      | "PUT",
    path: req.path,
  };

  console.log("canonicalRequest", canonicalRequest);
  console.log("signing secret", process.env.CONTENTFUL_SIGNING_SECRET);
  if (
    !verifyRequest(
      process.env.CONTENTFUL_SIGNING_SECRET as string,
      canonicalRequest
    )
  ) {
    return res
      .status(401)
      .send("Unauthorized. Cannot verify authenticity of request");
  }
  next();
});

app.post("/", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`[Server]: I am running at https://localhost:${port}`);
});
