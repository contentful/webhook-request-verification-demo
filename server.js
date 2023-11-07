"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_apps_toolkit_1 = require("@contentful/node-apps-toolkit");
const express_2 = require("./express");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
(0, express_2.init)(app);
function makeCanonicalRequest({ body, headers, method, path }) {
    return {
        body: JSON.stringify(body),
        headers: JSON.parse(JSON.stringify(headers)),
        method: method,
        path,
    };
}
function verifyRequestMiddleware(req, res, next) {
    // format the request for node-apps-toolkit
    const canonicalRequest = makeCanonicalRequest(req);
    if (
    // use the signing secret to verify the request matches what was sent by Contentful
    !(0, node_apps_toolkit_1.verifyRequest)(process.env.CONTENTFUL_SIGNING_SECRET, canonicalRequest)) {
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
}
else {
    console.warn("[Server]: ⛔️ Request verification is not enabled.");
}
app.post("/", (req, res) => {
    var _a;
    const [context, entityType, eventType] = ((_a = req.header("X-Contentful-Topic")) === null || _a === void 0 ? void 0 : _a.split(".")) || [];
    console.log(`[Server]: ✅ Processed ${eventType} event for ${entityType}: ${req.body.sys.id}`);
    res.json({ status: "ok" });
});
app.listen(port, () => {
    console.log(`[Server]: 🟢 Server running at https://localhost:${port}`);
});
