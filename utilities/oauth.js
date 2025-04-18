import { URL, URLSearchParams } from "url";
import { createServer } from "http";
import { randomBytes } from "crypto";
import assert from "assert";
/* import fetch from "node-fetch"; */

const PORT = 52296;
const oauthClientConfig = {
    client_id: "cli",
    redirect_uri: `http://127.0.0.1:${PORT}`,
    scope: "full",
};

function generateState(size) {
    return randomBytes(size).toString("hex");
}

function generateRedirectUrl(endpoints, state) {
    const url = new URL(`${endpoints.platform}/oauth/authorize`);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("client_id", oauthClientConfig.client_id);
    url.searchParams.append("redirect_uri", oauthClientConfig.redirect_uri);
    url.searchParams.append("scope", oauthClientConfig.scope);
    url.searchParams.append("state", state);
    return url.href;
}

function parseRedirectedUrl(req) {
    assert(req.url != null);
    const url = new URL(`http://127.0.0.1${req.url}`);
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    if (error != null) {
        const message = [
            url.searchParams.get("error"),
            url.searchParams.get("error_description"),
            url.searchParams.get("error_uri"),
        ]
            .filter((value) => value !== null)
            .join("\n");
        throw new Error(message);
    }
    assert(state != null);
    assert(code != null);
    return { state, code };
}

 async function loginAndGetAccessToken(endpoints) {
    const expectedState = generateState(10);
    const callbackPromise = new Promise((resolve, reject) => {
        const listener = async (req, res) => {
            try {
                const { code, state } = parseRedirectedUrl(req);
                assert(state == expectedState);
                const authRequest = await fetch(`${endpoints.platform}/oauth/token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: `Basic ${Buffer.from(`${oauthClientConfig.client_id}:${oauthClientConfig.client_id}`).toString("base64")}`,
                    },
                    body: new URLSearchParams({
                        grant_type: "authorization_code",
                        redirect_uri: oauthClientConfig.redirect_uri,
                        code,
                    }),
                });
                const accessToken = (await authRequest.json()).access_token;
                assert(accessToken != null);
                res.end("Close your browser to continue");
                resolve(accessToken);
            }
            catch (err) {
                reject(err);
            }
            finally {
                server.close();
            }
        };
        const server = createServer(listener);
        server.listen(PORT, "127.0.0.1");
    });
    
    const openModule = await import('open');
    const open = openModule.default;
    
    open(generateRedirectUrl(endpoints, expectedState)).then((browserProcess) => {
        browserProcess.unref();
    });
    return await callbackPromise;
}

const endpoints = {
    platform: "https://platform.cloud.coveo.com"
};

async function getToken() {
    try {
        console.log("Opening browser for authentication...");
        const accessToken = await loginAndGetAccessToken(endpoints);
        return accessToken
    } catch (error) {
        console.error("Error during authentication:", error);
    }
}


export { getToken };
