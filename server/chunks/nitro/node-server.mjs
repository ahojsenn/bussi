globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import 'node-fetch-native/polyfill';
import { Server as Server$1 } from 'node:http';
import { Server } from 'node:https';
import destr from 'destr';
import { eventHandler, setHeaders, sendRedirect, defineEventHandler, handleCacheHeaders, createEvent, getRequestHeader, getRequestHeaders, setResponseHeader, createError, createApp, createRouter as createRouter$1, lazyEventHandler, toNodeListener } from 'h3';
import { createFetch as createFetch$1, Headers } from 'ofetch';
import { createCall, createFetch } from 'unenv/runtime/fetch/index';
import { createHooks } from 'hookable';
import { u as useRuntimeConfig } from './config.mjs';
import { hash } from 'ohash';
import { withoutBase, parseURL, withQuery, joinURL, withLeadingSlash, withoutTrailingSlash } from 'ufo';
import { createStorage } from 'unstorage';
import defu from 'defu';
import { toRouteMatcher, createRouter } from 'radix3';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'pathe';

const _assets = {

};

function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

const storage = createStorage({});

const useStorage = () => storage;

storage.mount('/assets', assets$1);

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler() {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      return sendRedirect(
        event,
        routeRules.redirect.to,
        routeRules.redirect.statusCode
      );
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    const path = new URL(event.node.req.url, "http://localhost").pathname;
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(path, useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro";
  const name = opts.name || fn.name || "_";
  const integrity = hash([opts.integrity, fn, opts]);
  const validate = opts.validate || (() => true);
  async function get(key, resolver, shouldInvalidateCache) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    const entry = await useStorage().getItem(cacheKey) || {};
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || !validate(entry);
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      entry.value = await pending[key];
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry)) {
          useStorage().setItem(cacheKey, entry).catch((error) => console.error("[nitro] [cache]", error));
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (opts.swr && entry.value) {
      _resolvePromise.catch(console.error);
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = opts.shouldInvalidateCache?.(...args);
    const entry = await get(key, () => fn(...args), shouldInvalidateCache);
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length > 0 ? hash(args, {}) : "";
}
function escapeKey(key) {
  return key.replace(/[^\dA-Za-z]/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const key = await opts.getKey?.(event);
      if (key) {
        return escapeKey(key);
      }
      const url = event.node.req.originalUrl || event.node.req.url;
      const friendlyName = escapeKey(decodeURI(parseURL(url).pathname)).slice(
        0,
        16
      );
      const urlHash = hash(url);
      return `${friendlyName}.${urlHash}`;
    },
    validate: (entry) => {
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: [opts.integrity, handler]
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const reqProxy = cloneWithProxy(incomingEvent.node.req, { headers: {} });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            for (const header in headers2) {
              this.setHeader(header, headers2[header]);
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.context = incomingEvent.context;
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = headers.Etag || headers.etag || `W/"${hash(body)}"`;
      headers["last-modified"] = headers["Last-Modified"] || headers["last-modified"] || new Date().toUTCString();
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(event);
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      event.node.res.setHeader(name, response.headers[name]);
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const plugins = [
  
];

function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || event.node.req.url?.endsWith(".json") || event.node.req.url?.includes("/api/");
}
function normalizeError(error) {
  const cwd = process.cwd();
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.node.req.url,
    statusCode,
    statusMessage,
    message,
    stack: "",
    data: error.data
  };
  event.node.res.statusCode = errorObject.statusCode !== 200 && errorObject.statusCode || 500;
  if (errorObject.statusMessage) {
    event.node.res.statusMessage = errorObject.statusMessage;
  }
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (isJsonRequest(event)) {
    event.node.res.setHeader("Content-Type", "application/json");
    event.node.res.end(JSON.stringify(errorObject));
    return;
  }
  const isErrorPage = event.node.req.url?.startsWith("/__nuxt_error");
  const res = !isErrorPage ? await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig().app.baseURL, "/__nuxt_error"), errorObject), {
    headers: getRequestHeaders(event),
    redirect: "manual"
  }).catch(() => null) : null;
  if (!res) {
    const { template } = await import('../error-500.mjs');
    event.node.res.setHeader("Content-Type", "text/html;charset=UTF-8");
    event.node.res.end(template(errorObject));
    return;
  }
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  if (res.status && res.status !== 200) {
    event.node.res.statusCode = res.status;
  }
  if (res.statusText) {
    event.node.res.statusMessage = res.statusText;
  }
  event.node.res.end(await res.text());
});

const assets = {
  "/.nojekyll": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1-uFjLKCYX+wlW2WAhXI6E0cz5CcY\"",
    "mtime": "2023-02-12T12:31:31.403Z",
    "size": 1,
    "path": "../public/.nojekyll"
  },
  "/SupermarkerVARTrial-Italic.woff2": {
    "type": "font/woff2",
    "etag": "\"2b068-PP2CsMU++NvaOYqxYAQgnQp9Y2M\"",
    "mtime": "2023-02-12T12:31:31.402Z",
    "size": 176232,
    "path": "../public/SupermarkerVARTrial-Italic.woff2"
  },
  "/SupermarkerVARTrial.woff2": {
    "type": "font/woff2",
    "etag": "\"240b0-g7MSLZBE7fNuUhekvTA6USvrWx8\"",
    "mtime": "2023-02-12T12:31:31.402Z",
    "size": 147632,
    "path": "../public/SupermarkerVARTrial.woff2"
  },
  "/bussi-old.png": {
    "type": "image/png",
    "etag": "\"83084-MddZ1pvMzwqtGYtRnamj9/fQJFw\"",
    "mtime": "2023-02-12T12:31:31.401Z",
    "size": 536708,
    "path": "../public/bussi-old.png"
  },
  "/bussi.png": {
    "type": "image/png",
    "etag": "\"895e8-0L1+lZfI2A3NTbM7dKPfGZ2pL9w\"",
    "mtime": "2023-02-12T12:31:31.400Z",
    "size": 562664,
    "path": "../public/bussi.png"
  },
  "/index.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"12d7-TTX1hCLCNfuqaA8RaxWxHbVdMdQ\"",
    "mtime": "2023-02-12T12:31:32.882Z",
    "size": 4823,
    "path": "../public/index.html"
  },
  "/prilblumen.png": {
    "type": "image/png",
    "etag": "\"d3c56-6Omhh5Wl1FMtKaRnIatIUocFcbI\"",
    "mtime": "2023-02-12T12:31:31.400Z",
    "size": 867414,
    "path": "../public/prilblumen.png"
  },
  "/_nuxt/_...slug_.bdf4fcd3.js": {
    "type": "application/javascript",
    "etag": "\"ca-n2H4neG/wz8J9xSpthZ2NFxJlAs\"",
    "mtime": "2023-02-12T12:31:31.397Z",
    "size": 202,
    "path": "../public/_nuxt/_...slug_.bdf4fcd3.js"
  },
  "/_nuxt/accounts.8ae564ba.js": {
    "type": "application/javascript",
    "etag": "\"250-nWy4aGmhHOqoLUp1/y6Pj6sDEbw\"",
    "mtime": "2023-02-12T12:31:31.397Z",
    "size": 592,
    "path": "../public/_nuxt/accounts.8ae564ba.js"
  },
  "/_nuxt/accounts.b6a337c8.js": {
    "type": "application/javascript",
    "etag": "\"31d-SfEIbylYp3VDFq5hMOaypE2aZv0\"",
    "mtime": "2023-02-12T12:31:31.396Z",
    "size": 797,
    "path": "../public/_nuxt/accounts.b6a337c8.js"
  },
  "/_nuxt/balance.3aa0d1bc.js": {
    "type": "application/javascript",
    "etag": "\"232d-qlbt4LMszkfFERGav3XaUxOSRoI\"",
    "mtime": "2023-02-12T12:31:31.394Z",
    "size": 9005,
    "path": "../public/_nuxt/balance.3aa0d1bc.js"
  },
  "/_nuxt/balance.41037350.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"196-iJQYe0c2dERXx141RhTJDTkNcnA\"",
    "mtime": "2023-02-12T12:31:31.394Z",
    "size": 406,
    "path": "../public/_nuxt/balance.41037350.css"
  },
  "/_nuxt/composables.e7c3d74f.js": {
    "type": "application/javascript",
    "etag": "\"61-Rm7X+plqPp65SNWz0n0bL8i3+hA\"",
    "mtime": "2023-02-12T12:31:31.394Z",
    "size": 97,
    "path": "../public/_nuxt/composables.e7c3d74f.js"
  },
  "/_nuxt/config.7167d66b.js": {
    "type": "application/javascript",
    "etag": "\"95-+luwJEax91x1YmZMZx0oY96qtOk\"",
    "mtime": "2023-02-12T12:31:31.393Z",
    "size": 149,
    "path": "../public/_nuxt/config.7167d66b.js"
  },
  "/_nuxt/default.5484272a.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"982-lmzsKpoj0K8RNmzqG6QxenqfXnM\"",
    "mtime": "2023-02-12T12:31:31.393Z",
    "size": 2434,
    "path": "../public/_nuxt/default.5484272a.css"
  },
  "/_nuxt/default.9413db54.js": {
    "type": "application/javascript",
    "etag": "\"4dc-ZB3WmoMDCAv616PpFyCLXJ/s6bc\"",
    "mtime": "2023-02-12T12:31:31.393Z",
    "size": 1244,
    "path": "../public/_nuxt/default.9413db54.js"
  },
  "/_nuxt/entry.66d28c6d.js": {
    "type": "application/javascript",
    "etag": "\"2365f-fcZ/+U3hdVNTKowWahAAJt0OvGg\"",
    "mtime": "2023-02-12T12:31:31.393Z",
    "size": 144991,
    "path": "../public/_nuxt/entry.66d28c6d.js"
  },
  "/_nuxt/error-404.0209a9a1.js": {
    "type": "application/javascript",
    "etag": "\"8cf-2eECFc7c5Zp0sf4VBe0jLQF5y0A\"",
    "mtime": "2023-02-12T12:31:31.392Z",
    "size": 2255,
    "path": "../public/_nuxt/error-404.0209a9a1.js"
  },
  "/_nuxt/error-404.23f2309d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"e2e-ivsbEmi48+s9HDOqtrSdWFvddYQ\"",
    "mtime": "2023-02-12T12:31:31.392Z",
    "size": 3630,
    "path": "../public/_nuxt/error-404.23f2309d.css"
  },
  "/_nuxt/error-500.aa16ed4d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"79e-7j4Tsx89siDo85YoIs0XqsPWmPI\"",
    "mtime": "2023-02-12T12:31:31.389Z",
    "size": 1950,
    "path": "../public/_nuxt/error-500.aa16ed4d.css"
  },
  "/_nuxt/error-500.d916150f.js": {
    "type": "application/javascript",
    "etag": "\"778-ZwlWDmIER3tQtt9m8hlU2an04rM\"",
    "mtime": "2023-02-12T12:31:31.387Z",
    "size": 1912,
    "path": "../public/_nuxt/error-500.d916150f.js"
  },
  "/_nuxt/error-component.f55b52ed.js": {
    "type": "application/javascript",
    "etag": "\"470-ZpMzmfLYLQe1xXw21uB8P3DdPqs\"",
    "mtime": "2023-02-12T12:31:31.382Z",
    "size": 1136,
    "path": "../public/_nuxt/error-component.f55b52ed.js"
  },
  "/_nuxt/hauptbuch.61e0eacc.js": {
    "type": "application/javascript",
    "etag": "\"234-g1yjaX4GDtxTENwLmEELgkWvZVc\"",
    "mtime": "2023-02-12T12:31:31.380Z",
    "size": 564,
    "path": "../public/_nuxt/hauptbuch.61e0eacc.js"
  },
  "/_nuxt/hauptbuch.6832cadd.js": {
    "type": "application/javascript",
    "etag": "\"422-w4GCMjRNDBcMVtHrswklFX+k700\"",
    "mtime": "2023-02-12T12:31:31.379Z",
    "size": 1058,
    "path": "../public/_nuxt/hauptbuch.6832cadd.js"
  },
  "/_nuxt/index.826532ca.js": {
    "type": "application/javascript",
    "etag": "\"18e-VQJs4XxzqR0mDlkYfE79Uh8a4L8\"",
    "mtime": "2023-02-12T12:31:31.379Z",
    "size": 398,
    "path": "../public/_nuxt/index.826532ca.js"
  },
  "/_nuxt/papaparse.74f7062d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"62f-1GkrsdyVv8pwWMDExrXRJSmip/0\"",
    "mtime": "2023-02-12T12:31:31.379Z",
    "size": 1583,
    "path": "../public/_nuxt/papaparse.74f7062d.css"
  },
  "/_nuxt/papaparse.min.dfc7edd1.js": {
    "type": "application/javascript",
    "etag": "\"66b5-zl/EnMxvaSWvqmoX42fbCEUHuNc\"",
    "mtime": "2023-02-12T12:31:31.378Z",
    "size": 26293,
    "path": "../public/_nuxt/papaparse.min.dfc7edd1.js"
  },
  "/_nuxt/stakeholder.10b988a3.js": {
    "type": "application/javascript",
    "etag": "\"2e6-eZzKIVSaa6J2La1jWRoX1LoP18c\"",
    "mtime": "2023-02-12T12:31:31.378Z",
    "size": 742,
    "path": "../public/_nuxt/stakeholder.10b988a3.js"
  },
  "/_nuxt/stakeholder.e5904810.js": {
    "type": "application/javascript",
    "etag": "\"1fb-y1DyvtHk8MHhEjMfbij2rXNrU2k\"",
    "mtime": "2023-02-12T12:31:31.377Z",
    "size": 507,
    "path": "../public/_nuxt/stakeholder.e5904810.js"
  },
  "/_nuxt/types.9c14c63d.js": {
    "type": "application/javascript",
    "etag": "\"8b1-m0kSl4Gg/cekQQE4Ef/cVUJmC0Y\"",
    "mtime": "2023-02-12T12:31:31.376Z",
    "size": 2225,
    "path": "../public/_nuxt/types.9c14c63d.js"
  }
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = [];

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base of publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _f4b49z = eventHandler((event) => {
  if (event.node.req.method && !METHODS.has(event.node.req.method)) {
    return;
  }
  let id = decodeURIComponent(
    withLeadingSlash(
      withoutTrailingSlash(parseURL(event.node.req.url).pathname)
    )
  );
  let asset;
  const encodingHeader = String(
    event.node.req.headers["accept-encoding"] || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    event.node.res.setHeader("Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = event.node.req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    event.node.res.statusCode = 304;
    event.node.res.end();
    return;
  }
  const ifModifiedSinceH = event.node.req.headers["if-modified-since"];
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= new Date(asset.mtime)) {
    event.node.res.statusCode = 304;
    event.node.res.end();
    return;
  }
  if (asset.type && !event.node.res.getHeader("Content-Type")) {
    event.node.res.setHeader("Content-Type", asset.type);
  }
  if (asset.etag && !event.node.res.getHeader("ETag")) {
    event.node.res.setHeader("ETag", asset.etag);
  }
  if (asset.mtime && !event.node.res.getHeader("Last-Modified")) {
    event.node.res.setHeader("Last-Modified", asset.mtime);
  }
  if (asset.encoding && !event.node.res.getHeader("Content-Encoding")) {
    event.node.res.setHeader("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.node.res.getHeader("Content-Length")) {
    event.node.res.setHeader("Content-Length", asset.size);
  }
  return readAsset(id);
});

const _lazy_kVhJdL = () => import('../handlers/renderer.mjs');

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_kVhJdL, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_kVhJdL, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const h3App = createApp({
    debug: destr(false),
    onError: errorHandler
  });
  const router = createRouter$1();
  h3App.use(createRouteRulesHandler());
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router);
  const localCall = createCall(toNodeListener(h3App));
  const localFetch = createFetch(localCall, globalThis.fetch);
  const $fetch = createFetch$1({
    fetch: localFetch,
    Headers,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch
  };
  for (const plugin of plugins) {
    plugin(app);
  }
  return app;
}
const nitroApp = createNitroApp();
const useNitroApp = () => nitroApp;

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const s = server.listen(port, host, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const i = s.address();
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${i.family === "IPv6" ? `[${i.address}]` : i.address}:${i.port}${baseURL}`;
  console.log(`Listening ${url}`);
});
{
  process.on(
    "unhandledRejection",
    (err) => console.error("[nitro] [dev] [unhandledRejection] " + err)
  );
  process.on(
    "uncaughtException",
    (err) => console.error("[nitro] [dev] [uncaughtException] " + err)
  );
}
const nodeServer = {};

export { getRouteRules as g, nodeServer as n, useNitroApp as u };
//# sourceMappingURL=node-server.mjs.map
