"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const node_apps_toolkit_1 = require("@contentful/node-apps-toolkit");
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.json({
    type: "application/vnd.contentful.management.v1+json",
}));
app.use((req, res, next) => {
    const canonicalRequest = {
        body: JSON.stringify(req.body),
        headers: JSON.parse(JSON.stringify(req.headers)),
        method: req.method,
        path: req.path,
    };
    console.log("canonicalRequest", canonicalRequest);
    console.log("signing secret", process.env.CONTENTFUL_SIGNING_SECRET);
    if (!(0, node_apps_toolkit_1.verifyRequest)(process.env.CONTENTFUL_SIGNING_SECRET, canonicalRequest)) {
        return res
            .status(401)
            .send("Unauthorized. Cannot verify authenticity of request");
    }
    next();
});
app.post("/", (req, res) => {
    res.json({ status: "ok" });
});
app.listen(port, () => {
    console.log(`[Server]: I am running at https://localhost:${port}`);
});
