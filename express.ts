import bodyParser from "body-parser";
import { Application } from "express";

export type HTTPMethod = "GET"
| "PATCH"
| "HEAD"
| "POST"
| "DELETE"
| "OPTIONS"
| "PUT"

export function init(app: Application) {
    app.use(
    bodyParser.json({
        type: "application/vnd.contentful.management.v1+json",
    })
    );
}