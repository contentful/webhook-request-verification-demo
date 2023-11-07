import express, { Express, NextFunction, Request, Response } from "express";
import { verifyRequest } from "@contentful/node-apps-toolkit";
import { HTTPMethod, init } from "./express"

const app: Express = express();
const port = process.env.PORT || 3000;
init(app)

function makeCanonicalRequest({ body, headers, method, path }: Request) {
  return {
    body: JSON.stringify(body),
    headers: JSON.parse(JSON.stringify(headers)),
    method: method as HTTPMethod,
    path,
  }
}

function verifyRequestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // format the request for node-apps-toolkit
  const canonicalRequest = makeCanonicalRequest(req);
  if (
    // use the signing secret to verify the request matches what was sent by Contentful
    !verifyRequest(
      process.env.CONTENTFUL_SIGNING_SECRET as string,
      canonicalRequest
    )
  ) {
    console.warn("[Server]: 🙅 Unable to verify authenticity of request!!");
    return res
      .status(403)
      .send("Unauthorized. Cannot verify authenticity of request");
  }
  console.log(`[Server]: ✨ Webhook signature verified successfully!`);
  next();
}

if (process.env.CONTENTFUL_SIGNING_SECRET) {
  console.log(`[Server]: 🔒 Request verification is enabled.`);
  app.use(verifyRequestMiddleware);
} else {
  console.warn("[Server]: ⛔️ Request verification is not enabled.");
}

app.post("/", (req: Request, res: Response) => {
  const [context, entityType, eventType] =
    req.header("X-Contentful-Topic")?.split(".") || [];

  console.log(
    `[Server]: ✅ Processed ${eventType} event for ${entityType}: ${req.body.sys.id}`
  );
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`[Server]: 🟢 Server running at https://localhost:${port}`);
});
