// 由 scripts/sync-engine.mjs 从客户端源码生成，请勿手改。GPL-3.0
const __decorator = () => (t) => t;
globalThis.Observed ??= (t) => t; globalThis.Track ??= () => {}; globalThis.Sendable ??= (t) => t;
globalThis.AppStorage ??= { _m: new Map(), get(k) { return this._m.get(k) }, set(k, v) { this._m.set(k, v) }, setOrCreate(k, v) { this._m.set(k, v) } };
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// ../harmony-legado/entry/src/main/ets/common/constants/SourceBrands.ets
var BRANDS = ["\u4E03\u732B", "\u756A\u8304", "\u732B\u773C"];

// shims/kit.mjs
import crypto from "node:crypto";
import nodeFs from "node:fs";
import os from "node:os";
import path from "node:path";
var http = {
  RequestMethod: { GET: "GET", POST: "POST", PUT: "PUT", HEAD: "HEAD", DELETE: "DELETE" },
  HttpDataType: { STRING: 0, OBJECT: 1, ARRAY_BUFFER: 2 },
  createHttp() {
    return {
      async request(url, opts = {}) {
        const timeout = Math.max(opts.connectTimeout ?? 0, opts.readTimeout ?? 0) || 3e4;
        const res = await fetch(url, {
          method: opts.method || "GET",
          headers: opts.header || {},
          body: opts.extraData === void 0 || opts.method === "GET" ? void 0 : opts.extraData,
          redirect: "follow",
          signal: AbortSignal.timeout(timeout)
        });
        const header = {};
        res.headers.forEach((v, k) => {
          header[k] = v;
        });
        const setCookies = res.headers.getSetCookie?.() ?? [];
        if (setCookies.length > 0) {
          header["set-cookie"] = setCookies;
        }
        return { responseCode: res.status, header, result: await res.arrayBuffer() };
      },
      destroy() {
      }
    };
  }
};
var util = {
  TextEncoder: class {
    encodeInto(s) {
      return new TextEncoder().encode(s ?? "");
    }
  },
  TextDecoder: {
    create(label, opts) {
      const td = new TextDecoder(label, { ignoreBOM: opts?.ignoreBOM ?? false });
      return { decodeWithStream: (b) => td.decode(b), decodeToString: (b) => td.decode(b) };
    }
  },
  Base64Helper: class {
    decodeSync(s) {
      return new Uint8Array(Buffer.from(typeof s === "string" ? s : Buffer.from(s).toString(), "base64"));
    }
    encodeToStringSync(b) {
      return Buffer.from(b).toString("base64");
    }
  }
};
var hashName = (alg) => alg.toLowerCase();
function cipherName(spec) {
  const [keyAlg, block] = spec.split("|");
  if (keyAlg.startsWith("AES")) {
    return `aes-${keyAlg.slice(3)}-${block.toLowerCase()}`;
  }
  return block.toUpperCase() === "ECB" ? "des-ede3" : `des-ede3-${block.toLowerCase()}`;
}
var cryptoFramework = {
  CryptoMode: { ENCRYPT_MODE: 0, DECRYPT_MODE: 1 },
  createMd(alg) {
    const h = crypto.createHash(hashName(alg));
    return {
      updateSync(b) {
        h.update(b.data);
      },
      digestSync() {
        return { data: new Uint8Array(h.digest()) };
      }
    };
  },
  createSymKeyGenerator() {
    return { convertKeySync(b) {
      return { data: Buffer.from(b.data) };
    } };
  },
  createMac(alg) {
    let h = null;
    return {
      initSync(key) {
        h = crypto.createHmac(hashName(alg), key.data);
      },
      updateSync(b) {
        h.update(b.data);
      },
      doFinalSync() {
        return { data: new Uint8Array(h.digest()) };
      }
    };
  },
  createCipher(spec) {
    const padding = !spec.endsWith("NoPadding");
    let c = null;
    return {
      initSync(mode, key, ivSpec) {
        const name = cipherName(spec);
        const iv = ivSpec ? Buffer.from(ivSpec.iv.data) : null;
        c = mode === 0 ? crypto.createCipheriv(name, key.data, iv) : crypto.createDecipheriv(name, key.data, iv);
        c.setAutoPadding(padding);
      },
      doFinalSync(b) {
        return { data: new Uint8Array(Buffer.concat([c.update(b.data), c.final()])) };
      }
    };
  }
};
function memoryPreferences() {
  const m = /* @__PURE__ */ new Map();
  return {
    getSync: (k, d) => m.has(k) ? m.get(k) : d,
    putSync: (k, v) => {
      m.set(k, v);
    },
    hasSync: (k) => m.has(k),
    deleteSync: (k) => {
      m.delete(k);
    },
    flush: () => Promise.resolve(),
    flushSync: () => {
    }
  };
}
var prefStores = /* @__PURE__ */ new Map();
var preferences = {
  getPreferencesSync(_ctx, opts) {
    const name = opts?.name ?? "";
    if (!prefStores.has(name)) {
      prefStores.set(name, memoryPreferences());
    }
    return prefStores.get(name);
  }
};
var kit_default = preferences;
var fileIo = {
  OpenMode: { READ_ONLY: 0, WRITE_ONLY: 1, READ_WRITE: 2, CREATE: 64, TRUNC: 512, APPEND: 1024 },
  accessSync: (p) => nodeFs.existsSync(p),
  mkdirSync: (p, recursive) => nodeFs.mkdirSync(p, { recursive: !!recursive }),
  readTextSync: (p) => nodeFs.readFileSync(p, "utf8"),
  openSync: (p) => ({ fd: nodeFs.openSync(p, "w") }),
  writeSync: (fd, text) => nodeFs.writeSync(fd, text),
  closeSync: (f) => nodeFs.closeSync(typeof f === "number" ? f : f.fd),
  unlinkSync: (p) => nodeFs.rmSync(p, { force: true }),
  rmdirSync: (p) => nodeFs.rmSync(p, { recursive: true, force: true }),
  listFileSync: (p) => nodeFs.existsSync(p) ? nodeFs.readdirSync(p) : []
};
var workDir = nodeFs.mkdtempSync(path.join(os.tmpdir(), "source-hub-"));
var AppUtil = {
  getContext: () => ({ filesDir: workDir, cacheDir: workDir })
};
var inert = new Proxy(function() {
  return {};
}, { get: (t, k) => k === "then" ? void 0 : inert, apply: () => ({}) });
var relationalStore = inert;
var curves = inert;

// ../harmony-legado/entry/src/main/ets/common/utils/NetworkHttp.ets
var NetworkHttp = class {
  static decode(data, encoding) {
    const toDecode = (label) => {
      try {
        const td = util.TextDecoder.create(label, { ignoreBOM: true });
        return td.decodeWithStream(new Uint8Array(data));
      } catch (e) {
        return null;
      }
    };
    let decoded = toDecode(/utf-?8/i.test(encoding) ? "utf-8" : encoding);
    if (decoded === null) {
      decoded = toDecode("utf-8");
    }
    return decoded ?? "";
  }
};

// ../harmony-legado/entry/src/main/ets/common/utils/CookieStore.ets
var SECOND_LEVEL = ["com", "net", "org", "gov", "edu", "co", "ac"];
var prefs = null;
var prefsUnavailable = false;
var jar = /* @__PURE__ */ new Map();
function store() {
  if (prefs === null && !prefsUnavailable) {
    try {
      prefs = preferences.getPreferencesSync(AppUtil.getContext(), { name: "book_source_cookies" });
    } catch (e) {
      prefsUnavailable = true;
    }
  }
  return prefs;
}
function cookieDomain(url) {
  const m = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/([^/?#:]+)/.exec((url ?? "").trim());
  const host = (m ? m[1] : (url ?? "").trim()).toLowerCase();
  if (/^\d+(\.\d+){3}$/.test(host) || !host.includes(".")) {
    return host;
  }
  const parts = host.split(".");
  const keep = parts.length > 2 && SECOND_LEVEL.includes(parts[parts.length - 2]) && parts[parts.length - 1].length === 2 ? 3 : 2;
  return parts.slice(parts.length - keep).join(".");
}
function load(domain) {
  let map = jar.get(domain);
  if (map === void 0) {
    map = /* @__PURE__ */ new Map();
    const saved = store()?.getSync(domain, "");
    if (saved) {
      parseCookieText(saved).forEach((v, k) => map?.set(k, v));
    }
    jar.set(domain, map);
  }
  return map;
}
function save(domain, map) {
  const s = store();
  if (s === null) {
    return;
  }
  if (map.size === 0) {
    s.deleteSync(domain);
  } else {
    s.putSync(domain, toCookieText(map));
  }
  s.flush().catch(() => {
  });
}
function parseCookieText(text) {
  const out = /* @__PURE__ */ new Map();
  (text ?? "").split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx > 0) {
      out.set(part.slice(0, idx).trim(), part.slice(idx + 1).trim());
    }
  });
  return out;
}
function toCookieText(map) {
  const parts = [];
  map.forEach((v, k) => parts.push(`${k}=${v}`));
  return parts.join("; ");
}
function getCookie(url) {
  return toCookieText(load(cookieDomain(url)));
}
function getCookieKey(url, key) {
  return load(cookieDomain(url)).get(key) ?? "";
}
function setCookie(url, cookie) {
  const domain = cookieDomain(url);
  const map = parseCookieText(cookie);
  jar.set(domain, map);
  save(domain, map);
}
function replaceCookie(url, cookie) {
  const domain = cookieDomain(url);
  const map = load(domain);
  parseCookieText(cookie).forEach((v, k) => map.set(k, v));
  save(domain, map);
}
function removeCookie(url) {
  const domain = cookieDomain(url);
  const map = /* @__PURE__ */ new Map();
  jar.set(domain, map);
  save(domain, map);
}
function applyCookies(url, headers) {
  const saved = load(cookieDomain(url));
  if (saved.size === 0) {
    return;
  }
  const key = Object.keys(headers).find((k) => k.toLowerCase() === "cookie");
  const merged = new Map(saved);
  if (key !== void 0) {
    parseCookieText(headers[key]).forEach((v, k) => merged.set(k, v));
    headers[key] = toCookieText(merged);
  } else {
    headers["Cookie"] = toCookieText(merged);
  }
}
function saveSetCookies(url, setCookies) {
  if (setCookies.length === 0) {
    return;
  }
  const domain = cookieDomain(url);
  const map = load(domain);
  let changed = false;
  for (const line of setCookies) {
    const first = line.split(";")[0];
    const idx = first.indexOf("=");
    if (idx <= 0) {
      continue;
    }
    const name = first.slice(0, idx).trim();
    const value = first.slice(idx + 1).trim();
    const maxAge = /;\s*max-age=(-?\d+)/i.exec(line);
    const expires = /;\s*expires=([^;]+)/i.exec(line);
    const expired = maxAge !== null && parseInt(maxAge[1], 10) <= 0 || maxAge === null && expires !== null && Date.parse(expires[1]) < Date.now();
    if (expired) {
      changed = map.delete(name) || changed;
    } else if (map.get(name) !== value) {
      map.set(name, value);
      changed = true;
    }
  }
  if (changed) {
    save(domain, map);
  }
}
function setCookieLines(raw) {
  if (raw === void 0 || raw === null) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.map((o) => `${o}`);
  }
  return `${raw}`.split(/\r?\n|,(?=\s*[^;,=\s]+=)/).map((s) => s.trim()).filter((s) => s.length > 0);
}

// ../harmony-legado/entry/src/main/ets/common/utils/AnalyzeUrl.ets
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
var RequestSpec = class {
  constructor() {
    this.url = "";
    this.method = "GET";
    this.body = "";
    this.headers = {};
    this.charset = "";
    this.type = "";
    this.timeout = 1e4;
    // 书源开启 enabledCookieJar（默认开启）时自动管理 Cookie
    this.cookieJar = false;
  }
};
var HttpResult = class {
  constructor() {
    this.body = "";
    this.code = 0;
    this.url = "";
    this.headers = {};
  }
};
function parseLooseJson(text) {
  const t = (text ?? "").trim();
  if (!t) {
    return null;
  }
  try {
    return JSON.parse(t);
  } catch (e) {
    try {
      const fixed = t.replace(/([{,]\s*)([a-zA-Z_$][\w$-]*)\s*:/g, '$1"$2":').replace(/'/g, '"');
      return JSON.parse(fixed);
    } catch (e2) {
      return null;
    }
  }
}
function toHeaderRecord(value, out) {
  if (value === null || value === void 0) {
    return;
  }
  let obj = value;
  if (typeof value === "string") {
    obj = parseLooseJson(value);
  }
  if (obj === null || typeof obj !== "object") {
    return;
  }
  const rec = obj;
  Object.keys(rec).forEach((k) => {
    const v = rec[k];
    if (v !== null && v !== void 0) {
      out[k] = `${v}`;
    }
  });
}
function sourceBaseUrl(source) {
  const raw = source?.bookSourceUrl ?? "";
  const hash = raw.indexOf("#");
  return (hash >= 0 ? raw.slice(0, hash) : raw).trim();
}
function isJsHeader(raw) {
  const t = (raw ?? "").trim();
  return t.startsWith("@js:") || t.startsWith("<js>");
}
var headerJsEvaluator = null;
var resolvingHeaders = /* @__PURE__ */ new Set();
function setHeaderJsEvaluator(fn) {
  headerJsEvaluator = fn;
}
async function resolveJsHeader(source) {
  if (!source || !isJsHeader(source.header) || headerJsEvaluator === null || resolvingHeaders.has(source.bookSourceUrl)) {
    return void 0;
  }
  resolvingHeaders.add(source.bookSourceUrl);
  try {
    return await headerJsEvaluator(source);
  } catch (e) {
    console.warn(`\u4E66\u6E90 header JS \u6267\u884C\u5931\u8D25\uFF1A${e?.message ?? e}`);
    return void 0;
  } finally {
    resolvingHeaders.delete(source.bookSourceUrl);
  }
}
function sourceHeaders(source, jsHeader) {
  const out = { "User-Agent": DEFAULT_UA };
  const raw = jsHeader ?? source?.header ?? "";
  if (raw.trim() && !isJsHeader(raw)) {
    toHeaderRecord(raw, out);
  }
  return out;
}
function absoluteUrl(base, link) {
  const u = (link ?? "").trim();
  if (!u || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(u)) {
    return u;
  }
  if (u.startsWith("//")) {
    return "https:" + u;
  }
  const hash = base.indexOf("#");
  const b = hash >= 0 ? base.slice(0, hash) : base;
  const om = /^(https?:\/\/[^/?#]+)/.exec(b);
  const origin = om ? om[1] : b;
  if (u.startsWith("/")) {
    return origin + u;
  }
  if (u.startsWith("?")) {
    const q = b.indexOf("?");
    return (q >= 0 ? b.slice(0, q) : b) + u;
  }
  const path2 = b.slice(origin.length);
  const cut = path2.lastIndexOf("/");
  return origin + (cut >= 0 ? path2.slice(0, cut + 1) : "/") + u;
}
function splitUrlOption(raw) {
  const text = (raw ?? "").trim();
  const re = /\s*,\s*(?=\{)/g;
  let m = re.exec(text);
  while (m !== null) {
    const opt = parseLooseJson(text.slice(m.index + m[0].length));
    if (opt !== null && typeof opt === "object" && !Array.isArray(opt)) {
      return [text.slice(0, m.index).trim(), opt];
    }
    m = re.exec(text);
  }
  return [text, null];
}
function absoluteRuleUrl(base, raw) {
  const parts = splitUrlOption(raw);
  if (parts[1] === null) {
    return absoluteUrl(base, raw);
  }
  return absoluteUrl(base, parts[0]) + "," + JSON.stringify(parts[1]);
}
function buildRequest(raw, baseUrl, source, jsHeader) {
  const spec = new RequestSpec();
  const parts = splitUrlOption(raw);
  const base = baseUrl || sourceBaseUrl(source);
  spec.url = absoluteUrl(base, parts[0]);
  spec.headers = sourceHeaders(source, jsHeader);
  spec.cookieJar = !!source && source.enabledCookieJar !== false;
  const opt = parts[1];
  if (opt !== null) {
    toHeaderRecord(opt.headers, spec.headers);
    spec.method = (opt.method ?? "GET").toUpperCase();
    if (opt.body !== void 0 && opt.body !== null) {
      spec.body = typeof opt.body === "string" ? opt.body : JSON.stringify(opt.body);
    }
    spec.charset = opt.charset ?? "";
    spec.type = opt.type ?? "";
  }
  return spec;
}
function hasHeader(headers, name) {
  const lower = name.toLowerCase();
  return Object.keys(headers).some((k) => k.toLowerCase() === lower);
}
function bytesHex(bytes) {
  let out = "";
  bytes.forEach((b) => {
    out += (b < 16 ? "0" : "") + b.toString(16);
  });
  return out;
}
function dataUrlResult(url, type) {
  const result = new HttpResult();
  result.code = 200;
  result.url = url;
  const m = /^data:[\s\S]*?;base64,([\s\S]*)$/i.exec(url);
  if (m) {
    const bytes = new util.Base64Helper().decodeSync(m[1].trim());
    result.body = type ? bytesHex(bytes) : NetworkHttp.decode(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "UTF-8");
  } else {
    const comma = url.indexOf(",");
    const text = comma >= 0 ? url.slice(comma + 1) : "";
    try {
      result.body = decodeURIComponent(text);
    } catch (e) {
      result.body = text;
    }
  }
  return result;
}
async function fetchSpec(spec) {
  if (/^data:/i.test(spec.url)) {
    return dataUrlResult(spec.url, spec.type);
  }
  let extraData = void 0;
  if (spec.method === "POST" || spec.method === "PUT") {
    if (!hasHeader(spec.headers, "Content-Type")) {
      const b = spec.body.trim();
      spec.headers["Content-Type"] = b.startsWith("{") || b.startsWith("[") ? "application/json; charset=UTF-8" : "application/x-www-form-urlencoded";
    }
    extraData = spec.body;
  }
  if (spec.cookieJar) {
    applyCookies(spec.url, spec.headers);
  }
  const client = http.createHttp();
  let res;
  try {
    res = await client.request(spec.url, {
      method: spec.method,
      header: spec.headers,
      extraData,
      expectDataType: http.HttpDataType.ARRAY_BUFFER,
      connectTimeout: spec.timeout,
      readTimeout: spec.timeout,
      usingCache: false,
      remoteValidation: "skip"
    });
  } finally {
    client.destroy();
  }
  const data = res.result instanceof ArrayBuffer ? res.result : void 0;
  const result = new HttpResult();
  result.code = res.responseCode;
  result.url = spec.url;
  let charset = spec.charset;
  const headerObj = res.header;
  if (headerObj) {
    Object.keys(headerObj).forEach((k) => {
      result.headers[k] = `${headerObj[k]}`;
    });
    if (spec.cookieJar) {
      saveSetCookies(spec.url, setCookieLines(headerObj["set-cookie"] ?? headerObj["Set-Cookie"]));
    }
    if (!charset) {
      const ct = `${headerObj["content-type"] ?? headerObj["Content-Type"] ?? ""}`;
      const cm = /charset=([\w-]+)/i.exec(ct);
      charset = cm ? cm[1] : "";
    }
  }
  if (!charset && data) {
    const head = NetworkHttp.decode(data.slice(0, Math.min(data.byteLength, 4096)), "UTF-8");
    const mm = /<meta[^>]+charset\s*=\s*["']?([\w-]+)/i.exec(head);
    charset = mm ? mm[1] : "";
  }
  if (spec.type && data) {
    result.body = bytesHex(new Uint8Array(data));
    return result;
  }
  result.body = data ? NetworkHttp.decode(data, charset || "UTF-8") : typeof res.result === "string" ? res.result : "";
  return result;
}
async function fetchUrl(raw, baseUrl, source, timeout) {
  const spec = buildRequest(raw, baseUrl, source, await resolveJsHeader(source));
  if (timeout !== void 0) {
    spec.timeout = timeout;
  }
  return fetchSpec(spec);
}

// ../harmony-legado/entry/src/main/ets/common/constants/CommonConstants.ets
var CommonConstants = class {
  static {
    /**
     * The main ability tag.
     */
    this.ENTRY_ABILITY_TAG = "EntryAbility";
  }
  static {
    /**
     * The launcher page tag.
     */
    this.LAUNCHER_PAGE_TAG = "LauncherPage";
  }
  static {
    /**
     * The Advertising page tag.
     */
    this.ADVERTISING_PAGE_TAG = "AdvertisingPage";
  }
  static {
    /**
     * The custom dialog component tag.
     */
    this.CUSTOM_DIALOG_TAG = "CustomDialogComponent";
  }
  static {
    /**
     * Preference saved key.
     */
    this.PREFERENCES_KEY_PRIVACY = "isPrivacy";
  }
  static {
    /**
     * Preference saved file name.
     */
    this.PREFERENCES_FILE_NAME = "myStore";
  }
  static {
    /**
     * Launcher page count down.
     */
    this.LAUNCHER_DELAY_TIME = 3e3;
  }
  static {
    /**
     * Image logo top margin.
     */
    this.LAUNCHER_IMAGE_MARGIN_TOP = "16.2%";
  }
  static {
    /**
     * Healthy living text spacing.
     */
    this.LAUNCHER_LIFE_TEXT_SPACING = 0.1;
  }
  static {
    /**
     * Healthy living title text top margin.
     */
    this.LAUNCHER_TEXT_TITLE_MARGIN_TOP = "0.5%";
  }
  static {
    /**
     * Content control height.
     */
    this.LAUNCHER_TEXT_INTRODUCE_HEIGHT = "2.7%";
  }
  static {
    /**
     * Healthy living instructions.
     */
    this.LAUNCHER_TEXT_INTRODUCE_SPACING = 3.4;
  }
  static {
    /**
     * Healthy living content top margin.
     */
    this.LAUNCHER_TEXT_INTRODUCE_MARGIN_TOP = "1.3%";
  }
  static {
    /**
     * Interval execution time.
     */
    this.ADVERTISING_INTERVAL_TIME = 1e3;
  }
  static {
    /**
     * Advertising page url.
     */
    this.ADVERTISING_PAGE_URL = "pages/AdvertisingPage";
  }
  static {
    /**
     * Display countdown seconds.
     */
    this.ADVERTISING_COUNT_DOWN_SECONDS = 2;
  }
  static {
    /**
     * Count down text spacing.
     */
    this.ADVERTISING_TITLE_TEXT_LETTER_SPACING = 0.05;
  }
  static {
    /**
     * Advertising page healthy text spacing.
     */
    this.ADVERTISING_HEALTHY_LIFE_TEXT_SPACING = 0.1;
  }
  static {
    /**
     * Advertising page health description text spacing.
     */
    this.ADVERTISING_TEXT_INTRODUCE_LETTER_SPACING = 3.4;
  }
  static {
    /**
     * Advertising page health description text top margin.
     */
    this.ADVERTISING_TEXT_INTRODUCE_MARGIN_TOP = "0.4%";
  }
  static {
    /**
     * Column container left margin.
     */
    this.ADVERTISING_COLUMN_MARGIN_LEFT = "3.1%";
  }
  static {
    /**
     * Row container bottom margin.
     */
    this.ADVERTISING_ROW_MARGIN_BOTTOM = "3.1%";
  }
  static {
    /**
     * Dialog component width the percentage of the 90.
     */
    this.DIALOG_COMPONENT_WIDTH_PERCENT = "90%";
  }
  static {
    /**
     * Dialog title text weight.
     */
    this.DIALOG_TITLE_FONT_WEIGHT = 600;
  }
  static {
    /**
     * Dialog width the percentage of the 93.3.
     */
    this.DIALOG_WIDTH_PERCENT = "93.3%";
  }
  static {
    /**
     * Dialog border radius.
     */
    this.DIALOG_BORDER_RADIUS = 24;
  }
  static {
    /**
     * Dialog component bottom margin,
     */
    this.DIALOG_ROW_MARGIN_BOTTOM = "3.1%";
  }
  static {
    /**
     * Dialog y-axis offset distance.
     */
    this.DIALOG_CONTROLLER_DY_OFFSET = -24;
  }
  static {
    /**
     * Width the percentage of the 100.
     */
    this.FULL_WIDTH = "100%";
  }
  static {
    /**
     * Height the percentage of the 100.
     */
    this.FULL_HEIGHT = "100%";
  }
  static {
    /**
     * Privacy page url.
     */
    this.PRIVACY_PAGE_URL = "pages/PrivacyPage";
  }
  static {
    /**
     * App home page url.
     */
    this.APP_HOME_PAGE_URL = "pages/AppHomePage";
  }
  static {
    /**
     * Common layout weight.
     */
    this.COMMON_LAYOUT_WEIGHT = 1;
  }
  static {
    /**
     * 标题栏图标大小
     */
    this.TITLE_IMG_SIZE = 24;
  }
  static {
    /**
     * 小说封面大小
     */
    this.NOVEL_IMG_WIDTH = 76;
  }
  static {
    this.NOVEL_IMG_HEIGHT = 102;
  }
  static {
    /**
     * 小说详情封面高度
     */
    this.NOVEL_DETAIL_IMG_HEIGHT = 128;
  }
  static {
    /**
     * 小说详情页作者图标大小
     */
    this.NOVEL_DETAIL_AUTHOR_IMG_SIZE = 16;
  }
  static {
    /**
     * 小说详情页字体大小
     */
    this.FONT_NOVEL_DETAIL_TITLE_SIZE = 20;
  }
  static {
    this.FONT_NOVEL_DETAIL_AUTHOR_SIZE = 12;
  }
  static {
    this.FONT_NOVEL_DETAIL_TAG_SIZE = 10;
  }
  static {
    this.FONT_NOVEL_DETAIL_INFO_SIZE = 14;
  }
  static {
    /**
     * 百分比
     */
    this.PERCENT_94 = "94%";
  }
  static {
    this.PERCENT_90 = "90%";
  }
  static {
    /**
     * space间距
     */
    this.SPACE_2 = 2;
  }
  static {
    this.SPACE_6 = 6;
  }
  static {
    this.SPACE_10 = 10;
  }
  static {
    this.SPACE_12 = 12;
  }
  static {
    this.SPACE_16 = 16;
  }
  static {
    this.SPACE_20 = 20;
  }
  static {
    /**
     * 小说AppStorage存储key
     */
    this.PREFERENCES_BOOK_TYPE_NUMBER = "PREFERENCES_BOOK_TYPE_NUMBER";
  }
  static {
    this.PREFERENCES_BOOK_INIT_KEY = "PREFERENCES_BOOK_INIT_KEY";
  }
  static {
    this.PREFERENCES_BOOK_DATA_KEY = "PREFERENCES_BOOK_DATA_KEY";
  }
  static {
    this.KEY_NOVEL_BOOK_DATA = "KEY_NOVEL_BOOK_DATA";
  }
  static {
    this.KEY_SOUND_BOOK_DATA = "KEY_SOUND_BOOK_DATA";
  }
  static {
    this.KEY_CARTOON_BOOK_DATA = "KEY_CARTOON_BOOK_DATA";
  }
  static {
    this.GROUP_LIST_DATA = "GROUP_LIST_DATA";
  }
  static {
    this.SHELF_LIST_DATA = "SHELF_LIST_DATA";
  }
  static {
    this.HAS_EXPLORE_URL = "HAS_EXPLORE_URL";
  }
  static {
    this.BOOK_IS_BOOK_REFRESHING = "BOOK_IS_BOOK_REFRESHING";
  }
  static {
    this.BOOK_IS_BOOK_GROUPS_REFRESHING = "BOOK_IS_BOOK_GROUPS_REFRESHING";
  }
  static {
    this.BOOK_IS_BOOK_WORKS_BOOK_LIST = "BOOK_IS_BOOK_WORKS_BOOK_LIST";
  }
  static {
    this.BOOK_IS_BOOK_HISTORY_REFRESHING = "BOOK_IS_BOOK_HISTORY_REFRESHING";
  }
  static {
    // 订阅源分组数据
    //分组是否初始化key
    this.RSS_SOURCES_GROUP_INIT = "RSS_SOURCES_GROUP_INIT";
  }
  static {
    //分组key
    this.RSS_SOURCES_GROUP_LIST_DATA_KEY = "RSS_SOURCES_GROUP_LIST_DATA_KEY";
  }
  static {
    //订阅源刷新标识
    this.RSS_SOURCES_REFRESHING = "RSS_SOURCES_REFRESHING";
  }
  static {
    //系统UA'0-Android', '1-Phone', '2-电脑', '3-自定义'
    this.SYSTEM_UA = "SYSTEM_UA";
  }
  static {
    /**
     * 数据库日志标签
     */
    this.RDB_TAG = "RdbTag";
  }
  static {
    /**
     * 数据库配置
     */
    this.STORE_CONFIG = {
      name: "novel.db",
      securityLevel: relationalStore.SecurityLevel.S1
    };
  }
  static {
    /**
     * Default curve value.
     */
    this.UniCurve = curves.springCurve(0, 0.5, 128, 12);
  }
  static {
    /**
     * 字体样式
     */
    this.FAMILY_PingFANG = "PingFang SC";
  }
  static {
    /**
     * 通用宽高
     */
    this.COMMON_WIDTH_45_36 = 45.36;
  }
  static {
    this.COMMON_HEIGHT_21_6 = 21.6;
  }
  static {
    this.COMMON_WIDTH_40 = 40;
  }
  static {
    this.COMMON_HEIGHT_40 = 40;
  }
  static {
    /*
     * 接口请求域名
     * */
    this.BASE_URL = "https://legado.miaogongzi.cc/api/LegadoServer";
  }
};

// ../harmony-legado/entry/src/main/ets/common/utils/DataPreferencesUtils.ets
var bookDataPreferences = class _bookDataPreferences {
  constructor() {
    this.preferencesName = CommonConstants.PREFERENCES_BOOK_DATA_KEY;
  }
  static {
    this.shared = new _bookDataPreferences();
  }
  // 初始化preferences实例
  // 使用时再取 context：模块可能在 EntryAbility 阶段被加载，此时 UI 上下文尚不可用
  initPreferences() {
    this.preferences = kit_default.getPreferencesSync(AppUtil.getContext(), { name: this.preferencesName });
  }
  // 设置数据
  set(key, value) {
    if (!this.preferences) {
      this.initPreferences();
    }
    console.log("setinitPreferences", key, value);
    this.preferences?.putSync(key, value);
    this.preferences?.flush();
  }
  // 获取数据
  get(key) {
    if (!this.preferences) {
      this.initPreferences();
    }
    let value = this.preferences?.getSync(key, null);
    ;
    return value;
  }
  // 删除数据
  delete(key) {
    if (!this.preferences) {
      this.initPreferences();
    }
    if (this.preferences?.hasSync(key)) {
      this.preferences.deleteSync(key);
      this.preferences.flush();
    }
  }
};

// ../harmony-legado/entry/src/main/ets/common/utils/utils.ets
var isNetworkUrl = (url) => {
  return url.startsWith("http://") || url.startsWith("https://");
};
var Gson = class {
  toString(info) {
    if (!info) {
      return void 0;
    }
    return JSON.stringify(info);
  }
  toJson(json) {
    if (!json) {
      return void 0;
    }
    try {
      return JSON.parse(json);
    } catch (error) {
      return void 0;
    }
  }
};
var GSON = new Gson();

// ../harmony-legado/entry/src/main/ets/common/utils/SourceImporter.ets
var HISTORY_KEY = "BOOK_SOURCE_IMPORT_URL_HISTORY";
var HISTORY_MAX = 10;
var SourceImporter = class _SourceImporter {
  /**
   * 解析书源 JSON 文本，失败时抛出带提示文案的 Error
   */
  static parseText(text) {
    let content = (text ?? "").trim();
    if (content.charCodeAt(0) === 65279) {
      content = content.slice(1);
    }
    if (!content) {
      throw new Error("\u5185\u5BB9\u4E3A\u7A7A");
    }
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      throw new Error("\u4E66\u6E90\u89E3\u6790\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 JSON \u683C\u5F0F");
    }
    return _SourceImporter.normalize(parsed);
  }
  /**
   * 将已解析的 JSON 统一为书源数组并过滤无效条目
   */
  static normalize(parsed) {
    const probes = Array.isArray(parsed) ? parsed : [parsed];
    if (probes.length === 0) {
      throw new Error("\u672A\u83B7\u53D6\u5230\u6709\u6548\u4E66\u6E90\u6570\u636E");
    }
    const valid = probes.filter((o) => {
      return !!o && typeof o.bookSourceUrl === "string" && o.bookSourceUrl.length > 0 && typeof o.bookSourceName === "string" && o.bookSourceName.length > 0;
    });
    if (valid.length === 0) {
      const first = probes[0];
      if (first && typeof first.sourceUrl === "string") {
        throw new Error("\u8FD9\u662FRSS\u8BA2\u9605\u6E90\uFF0C\u8BF7\u5230\u3010\u8BA2\u9605\u3011\u9875\u5BFC\u5165");
      }
      throw new Error("\u672A\u89E3\u6790\u5230\u6709\u6548\u4E66\u6E90");
    }
    return valid;
  }
  /**
   * 从网络地址拉取书源（跟随跳转，跳过证书校验）
   */
  static async fetch(url) {
    let body = "";
    try {
      body = (await fetchUrl(url.trim(), url.trim(), null, 6e4)).body;
    } catch (e) {
      throw new Error("\u4E66\u6E90\u5730\u5740\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u94FE\u63A5\u662F\u5426\u53EF\u8BBF\u95EE");
    }
    if (!body.trim()) {
      throw new Error("\u672A\u83B7\u53D6\u5230\u6709\u6548\u4E66\u6E90\u6570\u636E");
    }
    return _SourceImporter.parseText(body);
  }
  /**
   * 自动识别输入：http(s) 地址则拉取，否则按 JSON 文本解析
   */
  static async resolve(input) {
    const text = (input ?? "").trim();
    if (isNetworkUrl(text)) {
      return _SourceImporter.fetch(text);
    }
    return _SourceImporter.parseText(text);
  }
  /**
   * 解析一键导入链接，返回书源地址；非书源导入链接返回 undefined
   * 兼容：yuedu://booksource/importonline?src=、legado://import/bookSource?src=、legado://import/auto?src=
   */
  static parseImportUri(uri) {
    if (!uri) {
      return void 0;
    }
    const lower = uri.toLowerCase();
    if (!lower.startsWith("yuedu://") && !lower.startsWith("legado://")) {
      return void 0;
    }
    const isBookSource = lower.includes("booksource") || lower.includes("/import/auto");
    const srcIndex = uri.indexOf("src=");
    if (!isBookSource || srcIndex < 0) {
      return void 0;
    }
    let src = uri.substring(srcIndex + 4);
    if (!isNetworkUrl(src)) {
      try {
        src = decodeURIComponent(src);
      } catch (e) {
        return void 0;
      }
    }
    return isNetworkUrl(src) ? src : void 0;
  }
  // 网络导入历史地址
  static getHistory() {
    const value = bookDataPreferences.shared.get(HISTORY_KEY);
    if (typeof value !== "string" || !value) {
      return [];
    }
    try {
      const list = JSON.parse(value);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }
  static addHistory(url) {
    const list = _SourceImporter.getHistory().filter((o) => o !== url);
    list.unshift(url);
    bookDataPreferences.shared.set(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)));
  }
  static removeHistory(url) {
    const list = _SourceImporter.getHistory().filter((o) => o !== url);
    bookDataPreferences.shared.set(HISTORY_KEY, JSON.stringify(list));
  }
};

// ../harmony-legado/entry/src/main/ets/common/utils/SourceRepo.ets
var REPO_HOST = "https://www.yckceo.com";
var RepoSource = class {
  constructor() {
    this.id = "";
    this.name = "";
    this.url = "";
    this.date = "";
    // 更新时间（毫秒，解析失败为 0）
    this.time = 0;
    this.version = "";
    this.downloads = 0;
  }
};
function parseDate(text) {
  const full = /(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(text);
  if (full) {
    return new Date(parseInt(full[1], 10), parseInt(full[2], 10) - 1, parseInt(full[3], 10)).getTime();
  }
  const short = /(\d{1,2})\/(\d{1,2})/.exec(text);
  if (short) {
    const now = /* @__PURE__ */ new Date();
    let t = new Date(now.getFullYear(), parseInt(short[1], 10) - 1, parseInt(short[2], 10)).getTime();
    if (t > now.getTime()) {
      t = new Date(now.getFullYear() - 1, parseInt(short[1], 10) - 1, parseInt(short[2], 10)).getTime();
    }
    return t;
  }
  return 0;
}
function decodeEntities(s) {
  return s.replace(/&middot;/g, "\xB7").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function parseSources(html) {
  const out = [];
  const blocks = html.split('class="ylist"').slice(1);
  for (const b of blocks) {
    const m = /shuyuan\/content\/id\/(\d+)\.html">([^<]*)<\/a>\s*<p[^>]*>([^<]*)<\/p>/.exec(b);
    if (!m) {
      continue;
    }
    const r = new RepoSource();
    r.id = m[1];
    const title = decodeEntities(m[2]).trim();
    const um = /\s+(\S+:\/\/\S*)$/.exec(title);
    r.url = um ? um[1] : "";
    r.name = um ? title.slice(0, um.index).trim() : title;
    r.date = m[3].trim();
    r.time = parseDate(r.date);
    const vm = /layui-font-black">([^<]*)</.exec(b);
    r.version = vm ? vm[1].trim() : "";
    const dm = /下载:(\d+)/.exec(b);
    r.downloads = dm ? parseInt(dm[1], 10) : 0;
    out.push(r);
  }
  return out;
}
async function searchRepoSources(keys, page = 1, order = "time") {
  const url = `${REPO_HOST}/yuedu/shuyuan/index.html?keys=${encodeURIComponent(keys)}&ver=3&sousuo=1&order1=${order}&order2=1&page=${page}`;
  return parseSources((await fetchUrl(url, REPO_HOST, null, 3e4)).body).filter((r) => r.version.startsWith("3"));
}
async function searchRepoBoth(keys, page = 1) {
  const lists = await Promise.all([
    searchRepoSources(keys, page, "time").catch(() => []),
    searchRepoSources(keys, page, "down").catch(() => [])
  ]);
  const out = [];
  lists.forEach((list) => {
    list.forEach((r) => {
      if (!out.some((o) => o.id === r.id)) {
        out.push(r);
      }
    });
  });
  return out;
}
function rankRepoSources(list) {
  const now = Date.now();
  const maxDown = Math.max(1, ...list.map((r) => r.downloads));
  const score = (r) => {
    const ageDays = r.time > 0 ? (now - r.time) / 864e5 : 365;
    const recency = Math.max(0, 1 - ageDays / 365);
    const popularity = Math.log10(r.downloads + 1) / Math.log10(maxDown + 1);
    return recency * 0.7 + popularity * 0.3;
  };
  return list.slice().sort((a, b) => score(b) - score(a));
}
async function fetchRepoSource(id) {
  const res = await fetchUrl(`${REPO_HOST}/yuedu/shuyuan/json/id/${id}.json`, REPO_HOST, null, 6e4);
  return SourceImporter.parseText(res.body);
}

// ../harmony-legado/entry/src/main/ets/database/entities/SearchBook.ets
var SearchBook = class {
  constructor() {
    this.bookUrl = "";
    /** 书源 */
    this.origin = "";
    this.originName = "";
    /** BookType */
    this.type = "";
    this.name = "";
    this.author = "";
    this.latestChapterTitle = "";
    /** 目录页Url (toc=table of Contents) */
    this.tocUrl = "";
    this.time = Date.now();
    this.originOrder = 0;
    this.chapterWordCount = -1;
    this.respondTime = -1;
    //数量
    this.belongCount = 1;
    this.sourceList = [];
    // 其他书源中的同一本书
    this.otherOrigins = [];
    this.bookType = 0;
  }
};
SearchBook = __decorateClass([
  Observed
], SearchBook);

// shims/stub.mjs
var noop = () => Promise.resolve(null);
var dao = new Proxy({}, { get: () => noop });
var stub_default = dao;
var showMessage = () => {
};

// ../harmony-legado/entry/src/main/ets/common/utils/TextUtils.ets
function htmlToPlain(html) {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div)>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lrm;|&rlm;/gi, "").replace(/&amp;/gi, "&").replace(/\n{3,}/g, "\n\n").trim();
}

// ../harmony-legado/entry/src/main/ets/common/utils/AnalyzeEngine.ets
var VOID_TAGS = [
  "br",
  "img",
  "input",
  "meta",
  "link",
  "hr",
  "area",
  "base",
  "col",
  "embed",
  "source",
  "track",
  "wbr"
];
var HtmlNode = class _HtmlNode {
  constructor() {
    this.tag = "";
    this.attrs = /* @__PURE__ */ new Map();
    this.children = [];
    this.parent = null;
    this.text = "";
    this.isText = false;
  }
  static textNode(t) {
    const n = new _HtmlNode();
    n.isText = true;
    n.text = t;
    return n;
  }
  attr(name) {
    const v = this.attrs.get(name);
    return v ?? "";
  }
  /** 聚合本节点及后代的全部文本 */
  innerText() {
    if (this.isText) {
      return this.text;
    }
    let out = "";
    for (const c of this.children) {
      if (c.isText) {
        out += c.text;
      } else if (c.tag === "br") {
        out += "\n";
      } else {
        out += c.innerText();
      }
      if (!c.isText && c.tag !== "br" && (c.tag === "p" || c.tag === "div" || c.tag === "li" || c.tag === "h1" || c.tag === "h2" || c.tag === "h3" || c.tag === "h4")) {
        out += "\n";
      }
    }
    return out;
  }
  /** 深度优先收集后代元素；tagName 为空收集全部元素 */
  descendants(tagName) {
    const out = [];
    const walk = (node) => {
      for (const c of node.children) {
        if (c.isText) {
          continue;
        }
        if (tagName === "" || c.tag === tagName) {
          out.push(c);
        }
        walk(c);
      }
    };
    walk(this);
    return out;
  }
};
function decodeEntities2(s) {
  return s.replace(/&nbsp;/gi, " ").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&apos;/gi, "'").replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(parseInt(d, 10))).replace(/&#x([0-9a-fA-F]+);/g, (_m, d) => String.fromCharCode(parseInt(d, 16))).replace(/&amp;/gi, "&");
}
function parseAttrs(attrStr, map) {
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m = re.exec(attrStr);
  while (m) {
    const key = m[1].toLowerCase();
    const val = decodeEntities2(m[2] ?? m[3] ?? m[4] ?? "");
    map.set(key, val);
    m = re.exec(attrStr);
  }
}
function parseHtml(html) {
  let src = html;
  src = src.replace(/<!--[\s\S]*?-->/g, "");
  src = src.replace(/<script[\s\S]*?<\/script>/gi, "");
  src = src.replace(/<style[\s\S]*?<\/style>/gi, "");
  const root = new HtmlNode();
  root.tag = "root";
  let cur = root;
  let i = 0;
  let textBuf = "";
  const flushText = () => {
    if (textBuf.trim().length > 0) {
      const t = HtmlNode.textNode(decodeEntities2(textBuf.replace(/\s+/g, " ")));
      t.parent = cur;
      cur.children.push(t);
    }
    textBuf = "";
  };
  while (i < src.length) {
    const ch = src[i];
    if (ch === "<") {
      let j = i + 1;
      let inQ = "";
      while (j < src.length) {
        const c = src[j];
        if (inQ !== "") {
          if (c === inQ) {
            inQ = "";
          }
        } else if (c === '"' || c === "'") {
          inQ = c;
        } else if (c === ">") {
          break;
        }
        j++;
      }
      if (j >= src.length) {
        textBuf += src.slice(i);
        i = src.length;
        continue;
      }
      const tagStr = src.slice(i + 1, j).trim();
      flushText();
      if (tagStr.startsWith("/")) {
        const closeTag = tagStr.slice(1).trim().toLowerCase();
        let p = cur;
        while (p && p.parent && p.tag !== closeTag) {
          p = p.parent;
        }
        if (p && p.parent) {
          cur = p.parent;
        }
      } else if (!tagStr.startsWith("!") && !tagStr.startsWith("?")) {
        const nameMatch = /^([a-zA-Z][^\s/>]*)/.exec(tagStr);
        if (nameMatch) {
          const tag = nameMatch[1].toLowerCase();
          const node = new HtmlNode();
          node.tag = tag;
          parseAttrs(tagStr.slice(nameMatch[1].length), node.attrs);
          node.parent = cur;
          cur.children.push(node);
          const selfClose = tagStr.endsWith("/") || VOID_TAGS.includes(tag);
          if (!selfClose) {
            cur = node;
          }
        }
      }
      i = j + 1;
    } else {
      textBuf += ch;
      i++;
    }
  }
  flushText();
  return root;
}
function outerHtml(node) {
  if (node.isText) {
    return node.text;
  }
  let attrs = "";
  node.attrs.forEach((v, k) => {
    attrs += ` ${k}="${v.replace(/"/g, "&quot;")}"`;
  });
  if (!node.tag) {
    return node.children.map((c) => outerHtml(c)).join("");
  }
  if (VOID_TAGS.includes(node.tag)) {
    return `<${node.tag}${attrs}>`;
  }
  return `<${node.tag}${attrs}>${node.children.map((c) => outerHtml(c)).join("")}</${node.tag}>`;
}
function isJsRule(rule) {
  if (!rule) {
    return false;
  }
  const r = rule.toLowerCase();
  return r.includes("@js:") || r.includes("<js>") || r.includes("java.") || r.includes("eval(") || r.includes("@cache:") || r.includes("@put:") || r.includes("@base64");
}
function looksLikeJson(text) {
  const t = text.trim();
  return t.startsWith("{") || t.startsWith("[");
}
function splitAtRule(rule) {
  const parts = [];
  let cur = "";
  let depth = 0;
  for (let i = 0; i < rule.length; i++) {
    const c = rule[i];
    if (c === "[") {
      depth++;
    }
    if (c === "]") {
      depth--;
    }
    if (c === "@" && depth === 0) {
      parts.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  parts.push(cur);
  return parts;
}
function segBaseName(seg) {
  const dot = seg.lastIndexOf(".");
  if (dot > 0 && dot < seg.length - 1) {
    const tail = seg.slice(dot + 1);
    if (/^\d+$/.test(tail)) {
      return seg.slice(0, dot);
    }
  }
  return seg;
}
function segIndexNum(seg) {
  const dot = seg.lastIndexOf(".");
  if (dot > 0 && dot < seg.length - 1) {
    const tail = seg.slice(dot + 1);
    if (/^\d+$/.test(tail)) {
      return parseInt(tail, 10);
    }
  }
  return -1;
}
function applyHtmlSeg(cands, seg) {
  const base = segBaseName(seg);
  const index = segIndexNum(seg);
  let result = [];
  if (base.startsWith(".") && /^\.[-\w]+$/.test(base)) {
    return applyHtmlSeg(cands, `class${base}${index >= 0 ? "." + index : ""}`);
  }
  if (base.startsWith("#") && /^#[-\w]+$/.test(base)) {
    return applyHtmlSeg(cands, `id.${base.slice(1)}${index >= 0 ? "." + index : ""}`);
  }
  if (base.startsWith("class.")) {
    const cls = base.slice(6);
    for (const node of cands) {
      for (const d of node.descendants("")) {
        const own = d.attrs.get("class") ?? "";
        if (own.split(/\s+/).includes(cls)) {
          result.push(d);
        }
      }
    }
  } else if (base.startsWith("tag.")) {
    const tname = base.slice(4);
    for (const node of cands) {
      for (const d of node.descendants(tname)) {
        result.push(d);
      }
    }
  } else if (base.startsWith("id.")) {
    const idv = base.slice(3);
    for (const node of cands) {
      for (const d of node.descendants("")) {
        if (d.attr("id") === idv) {
          result.push(d);
        }
      }
    }
  } else if (base.startsWith("children")) {
    for (const node of cands) {
      for (const c of node.children) {
        if (!c.isText) {
          result.push(c);
        }
      }
    }
  } else {
    let tname = base;
    let needAttr = "";
    const bm = /\[([-a-zA-Z0-9_:]+)\]$/.exec(base);
    if (bm) {
      tname = base.slice(0, base.length - bm[0].length);
      needAttr = bm[1].toLowerCase();
    }
    for (const node of cands) {
      const selfMatch = [];
      if (node.tag === tname) {
        selfMatch.push(node);
      }
      for (const d of node.descendants(tname)) {
        selfMatch.push(d);
      }
      for (const d of selfMatch) {
        if (needAttr === "" || d.attrs.has(needAttr)) {
          result.push(d);
        }
      }
    }
  }
  if (index >= 0 && index < result.length) {
    return [result[index]];
  }
  if (index >= 0) {
    return [];
  }
  return result;
}
function jsonFindByKey(obj, key, out, deep) {
  if (obj === null || obj === void 0) {
    return;
  }
  if (Array.isArray(obj)) {
    const arr = obj;
    for (let i = 0; i < arr.length; i++) {
      jsonFindByKey(arr[i], key, out, deep);
    }
    return;
  }
  if (typeof obj !== "object") {
    return;
  }
  const rec = obj;
  const keys = Object.keys(rec);
  if (keys.includes(key)) {
    out.push(rec[key]);
  }
  if (deep) {
    for (let i = 0; i < keys.length; i++) {
      jsonFindByKey(rec[keys[i]], key, out, deep);
    }
  }
}
function jsonApplyIndexes(val, idxStr, out) {
  if (!idxStr) {
    out.push(val);
    return;
  }
  const idxs = [];
  const re = /\[([^\]]*)\]/g;
  let mm = re.exec(idxStr);
  while (mm) {
    idxs.push(mm[1].trim().replace(/^['"]|['"]$/g, ""));
    mm = re.exec(idxStr);
  }
  let stack = [val];
  for (const idx of idxs) {
    const nextStack = [];
    for (const cur of stack) {
      if (Array.isArray(cur)) {
        const ca = cur;
        if (idx === "*") {
          for (let i = 0; i < ca.length; i++) {
            nextStack.push(ca[i]);
          }
        } else {
          let n = parseInt(idx, 10);
          if (!isNaN(n) && n < 0) {
            n += ca.length;
          }
          if (!isNaN(n) && n >= 0 && n < ca.length) {
            nextStack.push(ca[n]);
          }
        }
      } else if (typeof cur === "object" && cur !== null) {
        const rec = cur;
        if (idx === "*") {
          Object.keys(rec).forEach((k) => {
            nextStack.push(rec[k]);
          });
        } else if (Object.keys(rec).includes(idx)) {
          nextStack.push(rec[idx]);
        }
      }
    }
    stack = nextStack;
  }
  for (const v of stack) {
    out.push(v);
  }
}
function jsonNavigate(obj, path2, out) {
  if (obj === null || obj === void 0 || typeof obj !== "object") {
    return;
  }
  const am = /^([^[]*)((?:\[[^\]]*\])*)$/.exec(path2);
  if (!am) {
    return;
  }
  const vals = [];
  if (am[1] === "*") {
    if (Array.isArray(obj)) {
      obj.forEach((v) => {
        vals.push(v);
      });
    } else {
      const rec = obj;
      Object.keys(rec).forEach((k) => {
        vals.push(rec[k]);
      });
    }
  } else if (am[1] === "") {
    vals.push(obj);
  } else if (Array.isArray(obj)) {
    const arr = obj;
    const n = parseInt(am[1], 10);
    if (!isNaN(n) && n < arr.length) {
      vals.push(arr[n]);
    }
  } else {
    const rec = obj;
    if (Object.keys(rec).includes(am[1])) {
      vals.push(rec[am[1]]);
    }
  }
  for (const v of vals) {
    if (v !== null && v !== void 0) {
      jsonApplyIndexes(v, am[2], out);
    }
  }
}
function jsonPick(source, rule) {
  if (source === null || source === void 0) {
    return [];
  }
  let r = rule.trim();
  if (r.startsWith("@json:")) {
    r = r.slice(6);
  }
  if (r.startsWith("$")) {
    r = r.slice(1);
  }
  if (r === "" || r === "*") {
    return [source];
  }
  const segs = [];
  let i = 0;
  let first = true;
  while (i < r.length) {
    let deep = false;
    if (r[i] === ".") {
      if (r[i + 1] === ".") {
        deep = true;
        i += 2;
      } else {
        i += 1;
      }
    } else if (!first) {
      break;
    }
    first = false;
    let k = "";
    while (i < r.length && r[i] !== ".") {
      if (r[i] === "[") {
        const e = r.indexOf("]", i);
        if (e < 0) {
          k += r.slice(i);
          i = r.length;
          break;
        }
        k += r.slice(i, e + 1);
        i = e + 1;
        continue;
      }
      k += r[i];
      i++;
    }
    if (k.length > 0) {
      segs.push((deep ? ".." : ".") + k);
    }
  }
  if (segs.length === 0) {
    return [];
  }
  let cur = [source];
  for (const seg of segs) {
    const out = [];
    if (seg.startsWith("..")) {
      const dm = /^([^[]*)((?:\[[^\]]*\])*)$/.exec(seg.slice(2));
      const keyName = dm ? dm[1] : seg.slice(2);
      const found = [];
      for (const obj of cur) {
        jsonFindByKey(obj, keyName, found, true);
      }
      found.forEach((f) => {
        jsonApplyIndexes(f, dm ? dm[2] : "", out);
      });
    } else {
      const path2 = seg.slice(1);
      for (const obj of cur) {
        jsonNavigate(obj, path2, out);
      }
    }
    cur = out;
    if (cur.length === 0) {
      break;
    }
  }
  return cur;
}
function jsonToStr(v) {
  if (v === null || v === void 0) {
    return "";
  }
  if (typeof v === "string") {
    return v;
  }
  if (typeof v === "number" || typeof v === "boolean") {
    return `${v}`;
  }
  return JSON.stringify(v);
}
function applyFilter(text, filter) {
  if (!filter || filter.length === 0) {
    return text;
  }
  try {
    let rule = filter;
    const first = rule.endsWith("###");
    if (first) {
      rule = rule.slice(0, -3);
    }
    const idx = rule.indexOf("##");
    const pattern = idx >= 0 ? rule.slice(0, idx) : rule;
    const repl = idx >= 0 ? rule.slice(idx + 2) : "";
    if (!pattern) {
      return text;
    }
    if (first) {
      const m = new RegExp(pattern).exec(text);
      return m ? m[0].replace(new RegExp(pattern), repl) : "";
    }
    return text.replace(new RegExp(pattern, "g"), repl);
  } catch (e) {
    return text;
  }
}
function pickList(htmlRoot, json, rule) {
  const r = (rule ?? "").trim();
  if (isJsRule(r)) {
    return [];
  }
  const branches = r.split("||");
  for (const br0 of branches) {
    let br = br0.trim();
    const hh = br.indexOf("##");
    if (hh > 0) {
      br = br.slice(0, hh);
    }
    const am = br.indexOf("&&");
    if (am > 0) {
      br = br.slice(0, am);
    }
    if (json !== null && json !== void 0 && (br.startsWith("$") || br.startsWith("@json:") || br.startsWith("..") || /^[a-zA-Z_]/.test(br))) {
      const raw = jsonPick(json, br);
      const out = [];
      for (const o of raw) {
        if (Array.isArray(o)) {
          const arr = o;
          for (let i = 0; i < arr.length; i++) {
            out.push(arr[i]);
          }
        } else {
          out.push(o);
        }
      }
      if (out.length > 0) {
        return out;
      }
    }
    if (htmlRoot) {
      const segs = splitAtRule(br).filter((s) => s.length > 0);
      if (segs.length === 0) {
        continue;
      }
      let cands = [htmlRoot];
      for (let k = 0; k < segs.length; k++) {
        const seg = segs[k];
        if (seg === "text" || seg.startsWith("text.")) {
          break;
        }
        cands = applyHtmlSeg(cands, seg);
        if (cands.length === 0) {
          break;
        }
      }
      if (cands.length > 0) {
        const out = [];
        for (const c of cands) {
          out.push(c);
        }
        return out;
      }
    }
  }
  return [];
}
function pickStr(item, rule) {
  const r = (rule ?? "").trim();
  if (isJsRule(r)) {
    return "";
  }
  if (r.length === 0) {
    if (item instanceof HtmlNode) {
      return item.innerText().trim();
    }
    return jsonToStr(item).trim();
  }
  const branches = r.split("||");
  for (const branch of branches) {
    let br = branch.trim();
    let filter = "";
    const hh = br.indexOf("##");
    if (hh >= 0) {
      filter = br.slice(hh + 2);
      br = br.slice(0, hh);
    }
    let val = "";
    if (item instanceof HtmlNode) {
      const segs = splitAtRule(br).filter((s) => s.length > 0);
      let cands = [item];
      let done = false;
      for (let k = 0; k < segs.length; k++) {
        const seg = segs[k];
        if (seg === "text" || seg.startsWith("text.")) {
          val = cands.map((c) => c.innerText()).join("\n");
          done = true;
          break;
        }
        if (seg === "textNodes" || seg === "ownText") {
          const sep = seg === "textNodes" ? "\n" : "";
          val = cands.map((c) => c.children.filter((t) => t.isText).map((t) => t.text.trim()).filter((t) => t.length > 0).join(sep)).join("\n");
          done = true;
          break;
        }
        if (seg === "html" || seg === "all") {
          val = cands.map((c) => outerHtml(c)).join("\n");
          done = true;
          break;
        }
        const isLast = k === segs.length - 1;
        if (isLast && /^[a-zA-Z][-\w]*$/.test(seg) && !seg.startsWith("class.") && !seg.startsWith("tag.") && !seg.startsWith("id.") && seg !== "children") {
          const attrVals = cands.map((c) => c.attr(seg)).filter((s) => s.length > 0);
          if (attrVals.length > 0) {
            val = attrVals[0];
            done = true;
            break;
          }
        }
        cands = applyHtmlSeg(cands, seg);
        if (cands.length === 0) {
          break;
        }
      }
      if (!done && !val && cands.length > 0) {
        val = cands.map((c) => c.innerText()).join("\n");
      }
    } else {
      if (br.startsWith("@js:") || br.startsWith("<js>")) {
        continue;
      }
      const objs = jsonPick(item, br);
      if (objs.length > 0) {
        const parts = [];
        for (const o of objs) {
          parts.push(jsonToStr(o));
        }
        val = parts.join(" ");
      }
    }
    val = val.trim();
    if (val.length > 0) {
      return applyFilter(val, filter);
    }
  }
  return "";
}
var AnalyzeSource = class {
  constructor(content, baseUrl) {
    this.htmlRoot = null;
    this.json = null;
    this.content = "";
    this.baseUrl = "";
    this.content = content;
    this.baseUrl = baseUrl;
    if (looksLikeJson(content)) {
      try {
        this.json = JSON.parse(content);
      } catch (e) {
        this.json = null;
      }
    }
    if (this.json === null) {
      this.htmlRoot = parseHtml(content);
    }
  }
  list(rule) {
    return pickList(this.htmlRoot, this.json, rule);
  }
  /** item 为 null 时从文档根（HTML）或 JSON 根提取 */
  str(item, rule) {
    if (item === null || item === void 0) {
      if (this.htmlRoot) {
        return pickStr(this.htmlRoot, rule);
      }
      return pickStr(this.json, rule);
    }
    return pickStr(item, rule);
  }
};

// shims/jsengine.mjs
import { newQuickJSAsyncWASMModule } from "quickjs-emscripten";
var SCRIPT_TIMEOUT_MS = 6e4;
var MEMORY_LIMIT = 128 * 1024 * 1024;
var idle = [];
async function acquire() {
  const reused = idle.pop();
  if (reused) {
    return reused;
  }
  const rt = (await newQuickJSAsyncWASMModule()).newRuntime();
  rt.setMemoryLimit(MEMORY_LIMIT);
  rt.setMaxStackSize(4 * 1024 * 1024);
  const slot = { rt, deadline: 0, host: null, contexts: /* @__PURE__ */ new Map() };
  rt.setInterruptHandler(() => Date.now() > slot.deadline);
  return slot;
}
function errorText(vm, handle) {
  const e = vm.dump(handle);
  handle.dispose();
  if (typeof e !== "object" || e === null) {
    return `${e}`;
  }
  const at = `${e.stack ?? ""}`.split("\n").find((l) => l.trim().startsWith("at ")) ?? "";
  return `${e.message ?? JSON.stringify(e)}${at ? ` (${at.trim()})` : ""}`;
}
var CONTEXT_CACHE_MAX = 4;
function contextFor(slot, prelude) {
  let entry = slot.contexts.get(prelude);
  if (entry) {
    slot.contexts.delete(prelude);
    slot.contexts.set(prelude, entry);
    return entry;
  }
  const vm = slot.rt.newContext();
  const hostFn = vm.newAsyncifiedFunction("__host", async (m, a) => {
    const method = vm.getString(m);
    const args = vm.getString(a);
    try {
      const r = await slot.host(method, args);
      return vm.newString(r === void 0 || r === null ? "" : `${r}`);
    } catch (e) {
      return { error: vm.newError(`${e?.message ?? e}`) };
    }
  });
  vm.setProp(vm.global, "__host", hostFn);
  hostFn.dispose();
  entry = { vm, ready: false };
  slot.contexts.set(prelude, entry);
  if (slot.contexts.size > CONTEXT_CACHE_MAX) {
    const [oldKey, old] = slot.contexts.entries().next().value;
    slot.contexts.delete(oldKey);
    old.vm.dispose();
  }
  return entry;
}
function dropContext(slot, prelude) {
  const entry = slot.contexts.get(prelude);
  if (entry) {
    slot.contexts.delete(prelude);
    entry.vm.dispose();
  }
}
async function evaluate(prelude, script, bindings, host) {
  const slot = await acquire();
  slot.deadline = Date.now() + SCRIPT_TIMEOUT_MS;
  slot.host = host;
  const entry = contextFor(slot, prelude);
  const vm = entry.vm;
  const run2 = async (code) => {
    const r = await vm.evalCodeAsync(code);
    if (r.error) {
      throw new Error(errorText(vm, r.error));
    }
    return r.value;
  };
  const call = (name, arg) => {
    const fn = vm.getProp(vm.global, name);
    const r = vm.callFunction(fn, vm.undefined, arg);
    fn.dispose();
    if (r.error) {
      throw new Error(errorText(vm, r.error));
    }
    return r.value;
  };
  try {
    if (!entry.ready) {
      ;
      (await run2(prelude)).dispose();
      entry.ready = true;
    }
    const b = vm.newString(bindings);
    call("__init", b).dispose();
    b.dispose();
    const value = await run2(script);
    const out = call("__out", value);
    value.dispose();
    const text = vm.getString(out);
    out.dispose();
    return text;
  } catch (e) {
    if (!entry.ready || /interrupted|out of memory/i.test(e.message)) {
      dropContext(slot, prelude);
    }
    throw e;
  } finally {
    slot.host = null;
    idle.push(slot);
  }
}

// ../harmony-legado/entry/src/main/ets/common/utils/JsPrelude.ets
var JS_PRELUDE = `
(function (g) {
  function call(name, args) {
    var r = __host(name, JSON.stringify(args || []));
    if (r === undefined || r === null || r === '') { return undefined; }
    return JSON.parse(r);
  }
  function str(x) {
    if (x === undefined || x === null) { return x; }
    if (typeof x === 'object' && !(x instanceof String)) {
      if (isBytes(x)) { return bytesToUtf8(x); }
      return JSON.stringify(x);
    }
    return String(x);
  }
  function isBytes(x) {
    return x instanceof Uint8Array || (Array.isArray(x) && x.__bytes === true);
  }
  function markBytes(arr) {
    var a = Array.prototype.slice.call(arr);
    Object.defineProperty(a, '__bytes', { value: true, enumerable: false });
    // String(\u5B57\u8282\u6570\u7EC4) \u5F97\u5230 UTF-8 \u6587\u672C\uFF08\u4E66\u6E90\u5E38\u5199 String(cipher.doFinal(...))\uFF09\uFF0C\u800C\u4E0D\u662F\u9017\u53F7\u5206\u9694\u7684\u6570\u5B57
    Object.defineProperty(a, 'toString', { value: function () { return bytesToUtf8(this); }, enumerable: false });
    return a;
  }
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var WEBVIEW_UA = 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36';
  function bytesToB64(bytes) {
    var out = '', i;
    for (i = 0; i < bytes.length; i += 3) {
      var b0 = bytes[i] & 255, b1 = i + 1 < bytes.length ? bytes[i + 1] & 255 : -1, b2 = i + 2 < bytes.length ? bytes[i + 2] & 255 : -1;
      out += B64[b0 >> 2] + B64[((b0 & 3) << 4) | (b1 < 0 ? 0 : b1 >> 4)];
      out += b1 < 0 ? '=' : B64[((b1 & 15) << 2) | (b2 < 0 ? 0 : b2 >> 6)];
      out += b2 < 0 ? '=' : B64[b2 & 63];
    }
    return out;
  }
  function b64ToBytes(s) {
    s = String(s).replace(/[^A-Za-z0-9+/\\-_]/g, '').replace(/-/g, '+').replace(/_/g, '/');
    var out = [], buf = 0, bits = 0, i;
    for (i = 0; i < s.length; i++) {
      buf = (buf << 6) | B64.indexOf(s[i]);
      bits += 6;
      if (bits >= 8) { bits -= 8; out.push((buf >> bits) & 255); }
    }
    return markBytes(out);
  }
  function utf8ToBytes(s) {
    s = String(s);
    var out = [], i;
    for (i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c >= 0xd800 && c < 0xdc00 && i + 1 < s.length) {
        c = 0x10000 + ((c - 0xd800) << 10) + (s.charCodeAt(++i) - 0xdc00);
      }
      if (c < 0x80) { out.push(c); }
      else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 63)); }
      else if (c < 0x10000) { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
      else { out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
    }
    return markBytes(out);
  }
  // \u4E0E Java new String(bytes, UTF-8) \u4E00\u81F4\uFF1A\u975E\u6CD5\u6216\u622A\u65AD\u7684\u5B57\u8282\u5E8F\u5217\u66FF\u6362\u4E3A U+FFFD\uFF0C\u4E0D\u629B\u9519
  function bytesToUtf8(b) {
    var out = '', i = 0, n = b.length;
    function cont(k) { return k < n && ((b[k] & 0xc0) === 0x80); }
    while (i < n) {
      var c = b[i] & 255, cp = -1, len = 1;
      if (c < 0x80) { cp = c; }
      else if (c >= 0xc2 && c < 0xe0 && cont(i + 1)) { cp = ((c & 31) << 6) | (b[i + 1] & 63); len = 2; }
      else if (c >= 0xe0 && c < 0xf0 && cont(i + 1) && cont(i + 2)) {
        cp = ((c & 15) << 12) | ((b[i + 1] & 63) << 6) | (b[i + 2] & 63); len = 3;
        if (cp < 0x800 || (cp >= 0xd800 && cp < 0xe000)) { cp = -1; }
      } else if (c >= 0xf0 && c < 0xf5 && cont(i + 1) && cont(i + 2) && cont(i + 3)) {
        cp = ((c & 7) << 18) | ((b[i + 1] & 63) << 12) | ((b[i + 2] & 63) << 6) | (b[i + 3] & 63); len = 4;
        if (cp < 0x10000 || cp > 0x10ffff) { cp = -1; }
      }
      if (cp < 0) { out += '\uFFFD'; i += 1; } else { out += String.fromCodePoint(cp); i += len; }
    }
    return out;
  }
  function bytesToHex(b) {
    var out = '', i;
    for (i = 0; i < b.length; i++) { out += ((b[i] & 255) < 16 ? '0' : '') + (b[i] & 255).toString(16); }
    return out;
  }
  function hexToBytes(h) {
    var out = [], i;
    h = String(h);
    for (i = 0; i + 1 < h.length; i += 2) { out.push(parseInt(h.substr(i, 2), 16)); }
    return markBytes(out);
  }
  function toBytes(x) {
    if (x === undefined || x === null) { return markBytes([]); }
    if (isBytes(x) || Array.isArray(x)) { return markBytes(x); }
    return utf8ToBytes(x);
  }
  function pad(n, l) { n = String(n); while (n.length < (l || 2)) { n = '0' + n; } return n; }
  function formatTime(t, fmt, offsetHours) {
    var d = new Date(Number(t) + (offsetHours === undefined ? 0 : Number(offsetHours) * 3600000));
    var utc = offsetHours !== undefined;
    var Y = utc ? d.getUTCFullYear() : d.getFullYear(), M = (utc ? d.getUTCMonth() : d.getMonth()) + 1,
      D = utc ? d.getUTCDate() : d.getDate(), H = utc ? d.getUTCHours() : d.getHours(),
      m = utc ? d.getUTCMinutes() : d.getMinutes(), s = utc ? d.getUTCSeconds() : d.getSeconds();
    return String(fmt || 'yyyy/MM/dd HH:mm').replace('yyyy', Y).replace('MM', pad(M)).replace('dd', pad(D))
      .replace('HH', pad(H)).replace('mm', pad(m)).replace('ss', pad(s));
  }
  function wrapResponse(r) {
    r = r || {};
    return {
      body: function () { return r.body; },
      code: function () { return r.code; },
      statusCode: function () { return r.code; },
      url: function () { return r.url; },
      headers: function () { return r.headers || {}; },
      header: function (n) {
        var h = r.headers || {}, k;
        for (k in h) { if (k.toLowerCase() === String(n).toLowerCase()) { return h[k]; } }
        return null;
      },
      cookies: function () { return {}; },
      // Rhino \u4E2D raw() \u8FD4\u56DE okhttp Response\uFF0C\u5E38\u89C1\u7528\u6CD5 raw().request().url()
      raw: function () {
        return {
          code: function () { return r.code; },
          request: function () { return { url: function () { return r.url; } }; },
          headers: function () { return r.headers || {}; }
        };
      },
      __response: true,
      toString: function () { return r.body; }
    };
  }
  // \u5BF9\u79F0\u52A0\u89E3\u5BC6\uFF1Atransformation \u5F62\u5982 AES/CBC/PKCS5Padding
  function crypt(mode, transformation, key, iv, data) {
    return b64ToBytes(call('crypto.symmetric', [mode, String(transformation), bytesToB64(toBytes(key)),
      iv === undefined || iv === null ? '' : bytesToB64(toBytes(iv)), bytesToB64(toBytes(data))]));
  }
  function SymmetricCrypto(transformation, key, iv) {
    this.t = transformation; this.k = key; this.i = iv;
  }
  SymmetricCrypto.prototype.setIv = function (iv) { this.i = iv; return this; };
  SymmetricCrypto.prototype.decrypt = function (d) { return crypt('decrypt', this.t, this.k, this.i, isBytes(d) ? d : b64ToBytes(d)); };
  SymmetricCrypto.prototype.decryptStr = function (d) { return bytesToUtf8(this.decrypt(d)); };
  SymmetricCrypto.prototype.encrypt = function (d) { return crypt('encrypt', this.t, this.k, this.i, d); };
  SymmetricCrypto.prototype.encryptBase64 = function (d) { return bytesToB64(this.encrypt(d)); };
  SymmetricCrypto.prototype.encryptHex = function (d) { return bytesToHex(this.encrypt(d)); };

  var java = {
    ajax: function (u) { return call('ajax', [str(u)]); },
    ajaxAll: function (urls) { var out = [], i; for (i = 0; i < urls.length; i++) { out.push(wrapResponse(call('connect', [str(urls[i])]))); } return out; },
    connect: function (u, header) { return wrapResponse(call('connect', [str(u), str(header)])); },
    get: function (a, headers) {
      if (arguments.length >= 2) { return wrapResponse(call('http', ['GET', str(a), '', headers || {}])); }
      return call('get', [str(a)]);
    },
    post: function (u, body, headers) { return wrapResponse(call('http', ['POST', str(u), str(body), headers || {}])); },
    head: function (u, headers) { return wrapResponse(call('http', ['HEAD', str(u), '', headers || {}])); },
    put: function (k, v) { call('put', [str(k), str(v)]); return v; },
    getString: function (rule, content, isUrl) { return call('rule.getString', [str(rule), content === undefined || content === null ? null : str(content), !!isUrl]); },
    getStringList: function (rule, content, isUrl) { return call('rule.getStringList', [str(rule), content === undefined || content === null ? null : str(content), !!isUrl]); },
    getElements: function (rule) { return call('rule.getElements', [str(rule)]); },
    getElement: function (rule) { var l = call('rule.getElements', [str(rule)]); return l && l.length ? l[0] : null; },
    setContent: function (content, baseUrl) { call('rule.setContent', [str(content), baseUrl === undefined ? null : str(baseUrl)]); },
    md5Encode: function (s) { return call('md5', [str(s)]); },
    md5Encode16: function (s) { return call('md5', [str(s)]).substring(8, 24); },
    digestHex: function (s, alg) { return call('digest', [str(s), str(alg)]); },
    HMacHex: function (s, alg, key) { return call('hmac', [str(s), str(alg), str(key), 'hex']); },
    HMacBase64: function (s, alg, key) { return call('hmac', [str(s), str(alg), str(key), 'base64']); },
    base64Encode: function (s) { return bytesToB64(toBytes(s)); },
    base64Decode: function (s) { return bytesToUtf8(b64ToBytes(s)); },
    base64DecodeToByteArray: function (s) { return b64ToBytes(s); },
    hexDecodeToString: function (h) { return bytesToUtf8(hexToBytes(h)); },
    hexDecodeToByteArray: function (h) { return hexToBytes(h); },
    hexEncodeToString: function (s) { return bytesToHex(toBytes(s)); },
    strToBytes: function (s) { return utf8ToBytes(s); },
    bytesToStr: function (b) { return bytesToUtf8(b); },
    encodeURI: function (s, enc) { return encodeURIComponent(String(s)); },
    utf8ToGbk: function (s) { return String(s); },
    timeFormat: function (t) { return formatTime(t); },
    timeFormatUTC: function (t, fmt, sh) { return formatTime(t, fmt, sh === undefined ? 0 : sh); },
    randomUUID: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
      });
    },
    androidId: function () { return '0000000000000000'; },
    t2s: function (s) { return String(s); },
    s2t: function (s) { return String(s); },
    toNumChapter: function (s) { return s; },
    htmlFormat: function (s) { return String(s).replace(/<br\\s*\\/?>/gi, '\\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '); },
    toURL: function (u) {
      var m = /^(\\w+):\\/\\/([^/:?#]+)(?::(\\d+))?([^?#]*)(\\?[^#]*)?/.exec(String(u)) || [];
      return { protocol: m[1], host: m[2], port: m[3], path: m[4], query: (m[5] || '').slice(1), url: String(u) };
    },
    log: function (m) { call('log', [str(m)]); return m; },
    logType: function (m) { call('log', [typeof m]); },
    toast: function (m) { call('toast', [str(m)]); },
    longToast: function (m) { call('toast', [str(m)]); },
    getCookie: function (tag, key) { return call('cookie.get', [str(tag), key === undefined ? null : str(key)]); },
    createSymmetricCrypto: function (t, key, iv) { return new SymmetricCrypto(t, key, iv); },
    aesDecodeToString: function (d, key, t, iv) { return bytesToUtf8(crypt('decrypt', t, key, iv, b64ToBytes(d))); },
    aesBase64DecodeToString: function (d, key, t, iv) { return bytesToUtf8(crypt('decrypt', t, key, iv, b64ToBytes(d))); },
    aesDecodeToByteArray: function (d, key, t, iv) { return crypt('decrypt', t, key, iv, b64ToBytes(d)); },
    aesEncodeToString: function (d, key, t, iv) { return bytesToUtf8(crypt('encrypt', t, key, iv, d)); },
    aesEncodeToBase64String: function (d, key, t, iv) { return bytesToB64(crypt('encrypt', t, key, iv, d)); },
    desEncodeToBase64String: function (d, key, t, iv) { return bytesToB64(crypt('encrypt', t, key, iv, d)); },
    desDecodeToString: function (d, key, t, iv) { return bytesToUtf8(crypt('decrypt', t, key, iv, b64ToBytes(d))); },
    tripleDESEncodeBase64Str: function (d, key, mode, padding, iv) { return bytesToB64(crypt('encrypt', 'DESede/' + mode + '/' + padding, key, iv, d)); },
    tripleDESDecodeStr: function (d, key, mode, padding, iv) { return bytesToUtf8(crypt('decrypt', 'DESede/' + mode + '/' + padding, key, iv, b64ToBytes(d))); },
    getWebViewUA: function () { return WEBVIEW_UA; },
    getUserAgent: function () { return WEBVIEW_UA; },
    deviceID: function () { return '0000000000000000'; },
    getStrResponse: function (u, header) { return wrapResponse(call('connect', [str(u), str(header)])); },
    urlEncode: function (s) { return encodeURIComponent(String(s)); },
    // \u5F00\u6E90\u9605\u8BFB\u4E2D\u8BFB\u53D6\u8FDC\u7A0B / \u672C\u5730\u811A\u672C\u6587\u672C\uFF0C\u5E38\u89C1\u7528\u6CD5 eval(String(java.importScript(url)))
    importScript: function (p) { return /^https?:/i.test(String(p)) ? call('ajax', [str(p)]) : ''; },
    // \u754C\u9762\u7C7B\u64CD\u4F5C\uFF1A\u672C\u5BA2\u6237\u7AEF\u65E0\u5BF9\u5E94\u754C\u9762\u65F6\u5FFD\u7565
    refreshTocUrl: function () {}, refreshExplore: function () {}, refreshBookToc: function () {},
    refreshContent: function () {}, refreshBookInfo: function () {}, reUiView: function () {}, reLoginView: function () {},
    upLoginData: function () {}, copyText: function () {}, openUrl: function () {}, open: function () {},
    showPhoto: function () {}, openVideoPlayer: function () {},
    // \u9700\u8981\u5185\u7F6E\u6D4F\u89C8\u5668\u6216\u4EBA\u5DE5\u8F93\u5165\u9A8C\u8BC1\u7801\uFF1A\u660E\u786E\u62A5\u9519\uFF0C\u4FBF\u4E8E\u5B9A\u4F4D
    startBrowser: function () { throw new Error('\u6682\u4E0D\u652F\u6301\u5185\u7F6E\u6D4F\u89C8\u5668\uFF08java.startBrowser\uFF09'); },
    startBrowserAwait: function () { throw new Error('\u6682\u4E0D\u652F\u6301\u5185\u7F6E\u6D4F\u89C8\u5668\uFF08java.startBrowserAwait\uFF09'); },
    startBrowserDp: function () { throw new Error('\u6682\u4E0D\u652F\u6301\u5185\u7F6E\u6D4F\u89C8\u5668\uFF08java.startBrowserDp\uFF09'); },
    showBrowser: function () { throw new Error('\u6682\u4E0D\u652F\u6301\u5185\u7F6E\u6D4F\u89C8\u5668\uFF08java.showBrowser\uFF09'); },
    showReadingBrowser: function () { throw new Error('\u6682\u4E0D\u652F\u6301\u5185\u7F6E\u6D4F\u89C8\u5668\uFF08java.showReadingBrowser\uFF09'); },
    webView: function () { throw new Error('\u6682\u4E0D\u652F\u6301\u5185\u7F6E\u6D4F\u89C8\u5668\uFF08java.webView\uFF09'); },
    webViewGetOverrideUrl: function () { throw new Error('\u6682\u4E0D\u652F\u6301\u5185\u7F6E\u6D4F\u89C8\u5668\uFF08java.webViewGetOverrideUrl\uFF09'); },
    getVerificationCode: function () { throw new Error('\u6682\u4E0D\u652F\u6301\u9A8C\u8BC1\u7801\u8F93\u5165\uFF08java.getVerificationCode\uFF09'); }
  };
  g.java = java;

  // ---------- Rhino Java \u7C7B\u4EFF\u771F\uFF1APackages / JavaImporter / importClass \u4E0E\u9876\u5C42 java\u3001javax\u3001org\u3001android\u3001cn\u3001com \u5305 ----------
  // \u603B\u662F\u8FD4\u56DE String \u5BF9\u8C61\uFF1Anew java.lang.String(bytes) \u82E5\u8FD4\u56DE\u539F\u59CB\u5B57\u7B26\u4E32\u4F1A\u88AB new \u5FFD\u7565\uFF0C\u5F97\u5230\u7A7A\u5BF9\u8C61
  function JString(x, charset) {
    var v = isBytes(x) || x instanceof Uint8Array ? bytesToUtf8(x) : String(x === undefined ? '' : x);
    var s = new String(v);
    s.getBytes = function () { return utf8ToBytes(v); };
    return s;
  }
  JString.valueOf = function (x) { return String(x); };
  JString.format = function (fmt) {
    var args = Array.prototype.slice.call(arguments, 1), i = 0;
    return String(fmt).replace(/%(\\d+\\$)?[-#+ 0,(]*\\d*(\\.\\d+)?[sdfxXc%]/g, function (m) {
      if (m === '%%') { return '%'; }
      var v = args[i++];
      if (/[xX]$/.test(m)) { return Number(v).toString(16); }
      if (/f$/.test(m)) { var p = /\\.(\\d+)/.exec(m); return Number(v).toFixed(p ? Number(p[1]) : 6); }
      return String(v);
    });
  };
  function StringBuilder(s) { this.s = s === undefined ? '' : String(s); }
  StringBuilder.prototype.append = function (x) { this.s += String(x); return this; };
  StringBuilder.prototype.toString = function () { return this.s; };
  StringBuilder.prototype.length = function () { return this.s.length; };
  StringBuilder.prototype.reverse = function () { this.s = this.s.split('').reverse().join(''); return this; };
  StringBuilder.prototype.insert = function (i, x) { this.s = this.s.slice(0, i) + String(x) + this.s.slice(i); return this; };
  StringBuilder.prototype.deleteCharAt = function (i) { this.s = this.s.slice(0, i) + this.s.slice(i + 1); return this; };
  StringBuilder.prototype.setLength = function (n) { this.s = this.s.slice(0, n); };
  StringBuilder.prototype.charAt = function (i) { return this.s.charAt(i); };

  function HashMap() { this.m = {}; }
  HashMap.prototype.put = function (k, v) { var o = this.m[k]; this.m[k] = v; return o === undefined ? null : o; };
  HashMap.prototype.get = function (k) { var v = this.m[k]; return v === undefined ? null : v; };
  HashMap.prototype.getOrDefault = function (k, d) { return k in this.m ? this.m[k] : d; };
  HashMap.prototype.containsKey = function (k) { return Object.prototype.hasOwnProperty.call(this.m, k); };
  HashMap.prototype.remove = function (k) { var v = this.m[k]; delete this.m[k]; return v === undefined ? null : v; };
  HashMap.prototype.size = function () { return Object.keys(this.m).length; };
  HashMap.prototype.isEmpty = function () { return this.size() === 0; };
  HashMap.prototype.keySet = function () { return new ArrayList(Object.keys(this.m)); };
  HashMap.prototype.values = function () { var m = this.m; return new ArrayList(Object.keys(m).map(function (k) { return m[k]; })); };
  HashMap.prototype.putAll = function (o) { var src = o instanceof HashMap ? o.m : o, k; for (k in src) { this.m[k] = src[k]; } };
  HashMap.prototype.clear = function () { this.m = {}; };
  HashMap.prototype.toJSON = function () { return this.m; };
  HashMap.prototype.toString = function () { return JSON.stringify(this.m); };

  function ArrayList(init) {
    var a = [];
    if (init && typeof init.length === 'number') { a.push.apply(a, Array.prototype.slice.call(init)); }
    a.add = function (i, v) { if (arguments.length > 1) { a.splice(i, 0, v); } else { a.push(i); } return true; };
    a.get = function (i) { return a[i]; };
    a.set = function (i, v) { var o = a[i]; a[i] = v; return o; };
    a.size = function () { return a.length; };
    a.isEmpty = function () { return a.length === 0; };
    a.contains = function (v) { return a.indexOf(v) >= 0; };
    a.remove = function (i) { return typeof i === 'number' ? a.splice(i, 1)[0] : (a.indexOf(i) >= 0 ? (a.splice(a.indexOf(i), 1), true) : false); };
    a.addAll = function (o) { a.push.apply(a, Array.prototype.slice.call(o)); return true; };
    a.clear = function () { a.length = 0; };
    a.toArray = function () { return a.slice(); };
    a.stream = function () { return a; };
    return a;
  }

  function BigInteger(v, radix) {
    if (!(this instanceof BigInteger)) { return new BigInteger(v, radix); }
    if (typeof v === 'bigint') { this.v = v; return; }
    // new BigInteger(signum, \u5B57\u8282\u6570\u7EC4)\uFF1A\u6309\u65E0\u7B26\u53F7\u5927\u7AEF\u89E3\u6790
    if (typeof v === 'number' && radix && typeof radix !== 'number') {
      this.v = BigInt(v) * bytesToBig(radix, false);
      return;
    }
    // new BigInteger(\u5B57\u8282\u6570\u7EC4)\uFF1A\u6309\u4E8C\u8FDB\u5236\u8865\u7801\u5927\u7AEF\u89E3\u6790
    if (isBytes(v) || v instanceof Uint8Array || (Array.isArray(v) && v.length && typeof v[0] === 'number')) {
      this.v = bytesToBig(v, true);
      return;
    }
    if (v instanceof BigInteger) { this.v = v.v; return; }
    var s = String(v).trim(), neg = s.charAt(0) === '-';
    if (neg) { s = s.slice(1); }
    var r = radix ? Number(radix) : 10, n = BigInt(0), i;
    for (i = 0; i < s.length; i++) { n = n * BigInt(r) + BigInt(parseInt(s.charAt(i), r)); }
    this.v = neg ? -n : n;
  }
  function bytesToBig(b, signed) {
    var n = BigInt(0), i;
    for (i = 0; i < b.length; i++) { n = (n << BigInt(8)) | BigInt(b[i] & 255); }
    if (signed && b.length && (b[0] & 128)) { n -= BigInt(1) << BigInt(8 * b.length); }
    return n;
  }
  function bi(x) { return x instanceof BigInteger ? x.v : BigInt(typeof x === 'number' ? Math.trunc(x) : String(x)); }
  BigInteger.valueOf = function (n) { return new BigInteger(BigInt(Math.trunc(Number(n)))); };
  BigInteger.ZERO = new BigInteger(BigInt(0)); BigInteger.ONE = new BigInteger(BigInt(1));
  BigInteger.TWO = new BigInteger(BigInt(2)); BigInteger.TEN = new BigInteger(BigInt(10));
  BigInteger.prototype.add = function (o) { return new BigInteger(this.v + bi(o)); };
  BigInteger.prototype.subtract = function (o) { return new BigInteger(this.v - bi(o)); };
  BigInteger.prototype.multiply = function (o) { return new BigInteger(this.v * bi(o)); };
  BigInteger.prototype.divide = function (o) { return new BigInteger(this.v / bi(o)); };
  BigInteger.prototype.mod = function (o) { var m = bi(o), r = this.v % m; return new BigInteger(r < 0 ? r + m : r); };
  BigInteger.prototype.remainder = function (o) { return new BigInteger(this.v % bi(o)); };
  BigInteger.prototype.pow = function (e) { return new BigInteger(this.v ** BigInt(Number(e))); };
  BigInteger.prototype.modPow = function (e, m) {
    var base = this.v, exp = bi(e), mod = bi(m), r = BigInt(1);
    base = ((base % mod) + mod) % mod;
    while (exp > 0) { if (exp & BigInt(1)) { r = r * base % mod; } exp = exp >> BigInt(1); base = base * base % mod; }
    return new BigInteger(r);
  };
  BigInteger.prototype.negate = function () { return new BigInteger(-this.v); };
  BigInteger.prototype.abs = function () { return new BigInteger(this.v < 0 ? -this.v : this.v); };
  BigInteger.prototype.and = function (o) { return new BigInteger(this.v & bi(o)); };
  BigInteger.prototype.or = function (o) { return new BigInteger(this.v | bi(o)); };
  BigInteger.prototype.xor = function (o) { return new BigInteger(this.v ^ bi(o)); };
  BigInteger.prototype.shiftLeft = function (n) { return new BigInteger(this.v << BigInt(Number(n))); };
  BigInteger.prototype.shiftRight = function (n) { return new BigInteger(this.v >> BigInt(Number(n))); };
  BigInteger.prototype.compareTo = function (o) { var b = bi(o); return this.v < b ? -1 : (this.v > b ? 1 : 0); };
  BigInteger.prototype.equals = function (o) { return this.compareTo(o) === 0; };
  BigInteger.prototype.intValue = function () { return Number(BigInt.asIntN(32, this.v)); };
  BigInteger.prototype.longValue = function () { return Number(BigInt.asIntN(64, this.v)); };
  BigInteger.prototype.doubleValue = function () { return Number(this.v); };
  BigInteger.prototype.toString = function (radix) { return this.v.toString(radix ? Number(radix) : 10); };
  BigInteger.prototype.toJSON = function () { return this.v.toString(); };
  BigInteger.prototype.signum = function () { return this.v > 0 ? 1 : (this.v < 0 ? -1 : 0); };
  BigInteger.prototype.not = function () { return new BigInteger(~this.v); };
  BigInteger.prototype.andNot = function (o) { return new BigInteger(this.v & ~bi(o)); };
  BigInteger.prototype.testBit = function (n) { return ((this.v >> BigInt(Number(n))) & BigInt(1)) === BigInt(1); };
  BigInteger.prototype.bitLength = function () { var x = this.v < 0 ? ~this.v : this.v; return x === BigInt(0) ? 0 : x.toString(2).length; };
  BigInteger.prototype.max = function (o) { return this.compareTo(o) >= 0 ? this : new BigInteger(bi(o)); };
  BigInteger.prototype.min = function (o) { return this.compareTo(o) <= 0 ? this : new BigInteger(bi(o)); };
  // \u4E8C\u8FDB\u5236\u8865\u7801\u3001\u5927\u7AEF\u3001\u6700\u77ED\u8868\u793A\uFF08\u4E0E Java \u4E00\u81F4\uFF09
  BigInteger.prototype.toByteArray = function () {
    var len = Math.floor(this.bitLength() / 8) + 1, out = [], x = this.v, i;
    for (i = 0; i < len; i++) { out.unshift(Number(x & BigInt(255))); x >>= BigInt(8); }
    return signedBytes(out);
  };

  function JURL(u) {
    var m = /^(\\w+):\\/\\/([^/:?#]+)(?::(\\d+))?([^?#]*)(\\?[^#]*)?(#.*)?/.exec(String(u)) || [];
    this.u = String(u);
    this.getProtocol = function () { return m[1] || ''; };
    this.getHost = function () { return m[2] || ''; };
    this.getPort = function () { return m[3] ? Number(m[3]) : -1; };
    this.getPath = function () { return m[4] || ''; };
    this.getQuery = function () { return m[5] ? m[5].slice(1) : null; };
    this.getFile = function () { return (m[4] || '') + (m[5] || ''); };
    this.getRef = function () { return m[6] ? m[6].slice(1) : null; };
    this.getAuthority = function () { return (m[2] || '') + (m[3] ? ':' + m[3] : ''); };
    this.toString = function () { return this.u; };
    this.toExternalForm = this.toString;
  }

  function MessageDigest(alg) { this.alg = String(alg).replace('-', ''); this.buf = []; }
  MessageDigest.getInstance = function (alg) { return new MessageDigest(alg); };
  MessageDigest.prototype.update = function (b) { this.buf = this.buf.concat(Array.prototype.slice.call(toBytes(b))); };
  MessageDigest.prototype.reset = function () { this.buf = []; };
  MessageDigest.prototype.digest = function (b) {
    if (b !== undefined) { this.update(b); }
    var out = b64ToBytes(call('digest.bytes', [this.alg, bytesToB64(this.buf)]));
    this.buf = [];
    return out;
  };

  function Mac(alg) { this.alg = String(alg).replace(/^Hmac/i, ''); this.key = []; this.buf = []; }
  Mac.getInstance = function (alg) { return new Mac(alg); };
  Mac.prototype.init = function (key) { this.key = key.key || toBytes(key); };
  Mac.prototype.update = function (b) { this.buf = this.buf.concat(Array.prototype.slice.call(toBytes(b))); };
  Mac.prototype.doFinal = function (b) {
    if (b !== undefined) { this.update(b); }
    var hex = call('hmac', [bytesToUtf8(this.buf), this.alg, bytesToUtf8(this.key), 'hex']);
    this.buf = [];
    return hexToBytes(hex);
  };

  function Cipher(t) { this.t = String(t).indexOf('/') < 0 ? String(t) + '/ECB/PKCS5Padding' : String(t); this.mode = 2; this.key = null; this.iv = null; }
  Cipher.ENCRYPT_MODE = 1; Cipher.DECRYPT_MODE = 2;
  Cipher.getInstance = function (t) { return new Cipher(t); };
  Cipher.prototype.init = function (mode, key, iv) { this.mode = mode; this.key = key.key || toBytes(key); this.iv = iv ? (iv.iv || toBytes(iv)) : null; };
  Cipher.prototype.doFinal = function (data) { return crypt(this.mode === 1 ? 'encrypt' : 'decrypt', this.t, this.key, this.iv, data); };

  // android.util.Base64 \u6807\u5FD7\u4F4D\uFF1ANO_PADDING 1\u3001NO_WRAP 2\u3001URL_SAFE 8
  function b64Flags(s, flags) {
    flags = Number(flags) || 0;
    if (flags & 8) { s = s.replace(/\\+/g, '-').replace(/\\//g, '_'); }
    if (flags & 1) { s = s.replace(/=+$/, ''); }
    return s;
  }
  var AndroidBase64 = {
    DEFAULT: 0, NO_PADDING: 1, NO_WRAP: 2, CRLF: 4, URL_SAFE: 8,
    encodeToString: function (b, flags) { return b64Flags(bytesToB64(toBytes(b)), flags); },
    encode: function (b, flags) { return utf8ToBytes(b64Flags(bytesToB64(toBytes(b)), flags)); },
    decode: function (s) { return b64ToBytes(isBytes(s) ? bytesToUtf8(s) : s); }
  };
  var JavaBase64 = {
    getDecoder: function () { return { decode: function (s) { return b64ToBytes(isBytes(s) ? bytesToUtf8(s) : s); } }; },
    getEncoder: function () { return { encodeToString: function (b) { return bytesToB64(toBytes(b)); }, encode: function (b) { return utf8ToBytes(bytesToB64(toBytes(b))); } }; },
    getUrlEncoder: function () { return { encodeToString: function (b) { return b64Flags(bytesToB64(toBytes(b)), 8); } }; },
    getMimeDecoder: function () { return JavaBase64.getDecoder(); },
    getUrlDecoder: function () { return JavaBase64.getDecoder(); }
  };
  function hutoolDigest(alg) { return function (s) { return call('digest', [str(s), alg]); }; }
  var DigestAlgorithm = { MD5: 'MD5', SHA1: 'SHA1', SHA256: 'SHA256', SHA384: 'SHA384', SHA512: 'SHA512' };
  function Digester(alg) { this.alg = String(alg && alg.name ? alg.name : alg); }
  Digester.prototype.digestHex = function (s) { return call('digest', [str(s), this.alg]); };
  Digester.prototype.digest = function (s) { return hexToBytes(this.digestHex(s)); };
  var hutoolBase64 = {
    encode: function (b) { return bytesToB64(toBytes(b)); },
    encodeUrlSafe: function (b) { return b64Flags(bytesToB64(toBytes(b)), 9); },
    decode: function (s) { return b64ToBytes(s); },
    decodeStr: function (s) { return bytesToUtf8(b64ToBytes(s)); }
  };
  var SecureUtil = {
    md5: hutoolDigest('MD5'), sha1: hutoolDigest('SHA1'), sha256: hutoolDigest('SHA256'),
    aes: function (key) { return new SymmetricCrypto('AES/ECB/PKCS5Padding', key); },
    des: function (key) { return new SymmetricCrypto('DES/ECB/PKCS5Padding', key); }
  };
  var JsonPath = {
    read: function (json, path) { return call('rule.getStringList', [str(path), typeof json === 'string' ? json : JSON.stringify(json), false]); },
    parse: function (json) { return { read: function (path) { return JsonPath.read(json, path); } }; }
  };
  var SecureRandom = function () {};
  SecureRandom.prototype.nextBytes = function (arr) { var i; for (i = 0; i < arr.length; i++) { arr[i] = Math.floor(Math.random() * 256) - 128; } };
  SecureRandom.prototype.nextInt = function (n) { return Math.floor(Math.random() * (n === undefined ? 4294967296 : n)); };
  SecureRandom.getInstance = function () { return new SecureRandom(); };
  function secretKeySpec(bytes, alg) { return { key: toBytes(bytes), alg: alg, getEncoded: function () { return toBytes(bytes); } }; }

  // ---------- \u5B57\u8282\u6D41\u4E0E GZIP\uFF08\u7EAF JS \u5B9E\u73B0 inflate\uFF0C\u5BA2\u6237\u7AEF\u4E0E\u670D\u52A1\u7AEF\u884C\u4E3A\u4E00\u81F4\uFF09 ----------
  function inflateRaw(src, pos) {
    var out = [], bitBuf = 0, bitCnt = 0;
    function bits(n) {
      while (bitCnt < n) { bitBuf |= (src[pos++] & 255) << bitCnt; bitCnt += 8; }
      var v = bitBuf & ((1 << n) - 1); bitBuf >>>= n; bitCnt -= n; return v;
    }
    function build(lengths, n) {
      var counts = [], offs = [], syms = [], i, len;
      for (i = 0; i < 16; i++) { counts[i] = 0; }
      for (i = 0; i < n; i++) { counts[lengths[i]]++; }
      counts[0] = 0; offs[1] = 0;
      for (i = 1; i < 15; i++) { offs[i + 1] = offs[i] + counts[i]; }
      for (i = 0; i < n; i++) { len = lengths[i]; if (len) { syms[offs[len]++] = i; } }
      return { counts: counts, syms: syms };
    }
    function decode(h) {
      var code = 0, first = 0, index = 0, len, count;
      for (len = 1; len < 16; len++) {
        code |= bits(1); count = h.counts[len];
        if (code - count < first) { return h.syms[index + (code - first)]; }
        index += count; first += count; first <<= 1; code <<= 1;
      }
      throw new Error('GZIP \u6570\u636E\u635F\u574F');
    }
    var LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
    var LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
    var DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
    var DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
    var ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var last, type, i;
    do {
      last = bits(1); type = bits(2);
      if (type === 0) {
        bitBuf = 0; bitCnt = 0;
        var len = (src[pos] & 255) | ((src[pos + 1] & 255) << 8); pos += 4;
        for (i = 0; i < len; i++) { out.push(src[pos++] & 255); }
        continue;
      }
      var lit, dist;
      if (type === 1) {
        var l = [];
        for (i = 0; i < 288; i++) { l[i] = i < 144 ? 8 : (i < 256 ? 9 : (i < 280 ? 7 : 8)); }
        lit = build(l, 288);
        var d = []; for (i = 0; i < 30; i++) { d[i] = 5; }
        dist = build(d, 30);
      } else if (type === 2) {
        var hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4, cl = [], lens = [];
        for (i = 0; i < 19; i++) { cl[i] = 0; }
        for (i = 0; i < hclen; i++) { cl[ORDER[i]] = bits(3); }
        var clh = build(cl, 19);
        while (lens.length < hlit + hdist) {
          var sym = decode(clh), rep, val;
          if (sym < 16) { lens.push(sym); continue; }
          if (sym === 16) { val = lens[lens.length - 1]; rep = 3 + bits(2); }
          else if (sym === 17) { val = 0; rep = 3 + bits(3); }
          else { val = 0; rep = 11 + bits(7); }
          while (rep--) { lens.push(val); }
        }
        lit = build(lens.slice(0, hlit), hlit);
        dist = build(lens.slice(hlit), hdist);
      } else {
        throw new Error('GZIP \u6570\u636E\u635F\u574F');
      }
      for (;;) {
        var s = decode(lit);
        if (s < 256) { out.push(s); continue; }
        if (s === 256) { break; }
        s -= 257;
        var length = LBASE[s] + bits(LEXT[s]), ds = decode(dist), back = DBASE[ds] + bits(DEXT[ds]), start = out.length - back;
        for (i = 0; i < length; i++) { out.push(out[start + i]); }
      }
    } while (!last);
    return out;
  }
  function gunzipBytes(b) {
    var src = Array.prototype.slice.call(b), pos = 10, flg = src[3] & 255;
    if ((src[0] & 255) !== 0x1f || (src[1] & 255) !== 0x8b) { return inflateRaw(src, 2); }
    if (flg & 4) { pos += 2 + ((src[pos] & 255) | ((src[pos + 1] & 255) << 8)); }
    if (flg & 8) { while (src[pos++] !== 0) {} }
    if (flg & 16) { while (src[pos++] !== 0) {} }
    if (flg & 2) { pos += 2; }
    return inflateRaw(src, pos);
  }
  function signedBytes(arr) { return markBytes(arr.map(function (v) { v &= 255; return v > 127 ? v - 256 : v; })); }
  function ByteArrayInputStream(b) { this.b = Array.prototype.slice.call(b); this.p = 0; }
  ByteArrayInputStream.prototype.read = function (buf, off, len) {
    if (buf === undefined) { return this.p < this.b.length ? (this.b[this.p++] & 255) : -1; }
    off = off || 0; len = len === undefined ? buf.length - off : len;
    if (this.p >= this.b.length) { return -1; }
    var n = Math.min(len, this.b.length - this.p), i;
    for (i = 0; i < n; i++) { var v = this.b[this.p++] & 255; buf[off + i] = v > 127 ? v - 256 : v; }
    return n;
  };
  ByteArrayInputStream.prototype.available = function () { return this.b.length - this.p; };
  ByteArrayInputStream.prototype.close = function () {};
  function GZIPInputStream(input) { ByteArrayInputStream.call(this, gunzipBytes(input.b)); }
  GZIPInputStream.prototype = Object.create(ByteArrayInputStream.prototype);
  function ByteArrayOutputStream() { this.b = []; }
  ByteArrayOutputStream.prototype.write = function (x, off, len) {
    if (typeof x === 'number') { this.b.push(x & 255); return; }
    off = off || 0; len = len === undefined ? x.length - off : len;
    for (var i = 0; i < len; i++) { this.b.push(x[off + i] & 255); }
  };
  ByteArrayOutputStream.prototype.toByteArray = function () { return signedBytes(this.b); };
  ByteArrayOutputStream.prototype.toString = function () { return bytesToUtf8(this.b); };
  ByteArrayOutputStream.prototype.size = function () { return this.b.length; };
  ByteArrayOutputStream.prototype.reset = function () { this.b = []; };
  ByteArrayOutputStream.prototype.close = function () {};
  ByteArrayOutputStream.prototype.flush = function () {};
  java.gunzip = function (b) { return signedBytes(gunzipBytes(toBytes(b))); };

  // \u5305\u7ED3\u6784\uFF1A\u53F6\u5B50\u4E3A\u7C7B\uFF0CJavaImporter / importPackage \u6309\u5305\u5BFC\u5165\u5176\u4E2D\u7684\u7C7B
  var Pkg = function (classes) { var k; for (k in classes) { this[k] = classes[k]; } };
  var jsoupHolder = {};
  var packages = {
    java: {
      lang: new Pkg({
        String: JString, StringBuilder: StringBuilder, StringBuffer: StringBuilder,
        Thread: { sleep: function (ms) { call('sleep', [Number(ms) || 0]); } },
        System: {
          currentTimeMillis: function () { return Date.now(); }, nanoTime: function () { return Date.now() * 1e6; },
          arraycopy: function (src, sp, dest, dp, n) { var i, tmp = Array.prototype.slice.call(src, sp, sp + n); for (i = 0; i < n; i++) { dest[dp + i] = tmp[i]; } }
        },
        Integer: { parseInt: function (s, r) { return parseInt(s, r || 10); }, valueOf: function (s, r) { return parseInt(s, r || 10); }, toHexString: function (n) { return (Number(n) >>> 0).toString(16); }, toString: function (n, r) { return Number(n).toString(r || 10); }, MAX_VALUE: 2147483647 },
        Long: { parseLong: function (s, r) { return parseInt(s, r || 10); }, valueOf: function (s) { return Number(s); }, toString: function (n, r) { return Number(n).toString(r || 10); } },
        Math: Math, Character: { isDigit: function (c) { return /\\d/.test(String(c)); } }
      }),
      util: new Pkg({
        Base64: JavaBase64, HashMap: HashMap, LinkedHashMap: HashMap, ArrayList: ArrayList, LinkedList: ArrayList,
        UUID: { randomUUID: function () { var u = java.randomUUID(); return { toString: function () { return u; } }; } },
        Arrays: {
          copyOfRange: function (arr, from, to) { return markBytes(Array.prototype.slice.call(arr, from, to)); },
          copyOf: function (arr, n) { var a = Array.prototype.slice.call(arr, 0, n); while (a.length < n) { a.push(0); } return markBytes(a); },
          toString: function (arr) { return '[' + Array.prototype.join.call(arr, ', ') + ']'; },
          asList: function () { return new ArrayList(arguments.length === 1 && arguments[0] && arguments[0].length !== undefined ? arguments[0] : arguments); }
        },
        Date: Date, Random: function () { this.nextInt = function (n) { return Math.floor(Math.random() * n); }; }
      }),
      net: new Pkg({
        URL: JURL,
        URLEncoder: { encode: function (s) { return encodeURIComponent(String(s)).replace(/%20/g, '+'); } },
        URLDecoder: { decode: function (s) { return decodeURIComponent(String(s).replace(/\\+/g, ' ')); } }
      }),
      math: new Pkg({ BigInteger: BigInteger }),
      security: new Pkg({ MessageDigest: MessageDigest, SecureRandom: SecureRandom }),
      io: new Pkg({ ByteArrayInputStream: ByteArrayInputStream, ByteArrayOutputStream: ByteArrayOutputStream }),
      nio: { charset: new Pkg({ StandardCharsets: { UTF_8: 'UTF-8' }, Charset: { forName: function (n) { return String(n); } } }) }
    },
    javax: {
      crypto: new Pkg({ Cipher: Cipher, Mac: Mac }),
      net: {}
    },
    android: { util: new Pkg({ Base64: AndroidBase64 }) },
    cn: { hutool: {
      core: { codec: new Pkg({ Base64: hutoolBase64 }) },
      crypto: new Pkg({ SecureUtil: SecureUtil, digest: new Pkg({ Digester: Digester, DigestAlgorithm: DigestAlgorithm, DigestUtil: { md5Hex: hutoolDigest('MD5'), sha1Hex: hutoolDigest('SHA1'), sha256Hex: hutoolDigest('SHA256') } }) })
    } },
    com: { jayway: { jsonpath: new Pkg({ JsonPath: JsonPath }) } },
    org: { jsoup: jsoupHolder }
  };
  packages.java.util.zip = new Pkg({ GZIPInputStream: GZIPInputStream });
  packages.javax.crypto.spec = new Pkg({ SecretKeySpec: secretKeySpec, IvParameterSpec: function (b) { return { iv: toBytes(b) }; } });
  // jsoup \u7531 JsJsoup \u63D0\u4F9B\uFF08\u82E5\u5DF2\u52A0\u8F7D\uFF09
  if (typeof __jsoupFactory === 'function') {
    var J = __jsoupFactory(g);
    jsoupHolder.Jsoup = J.Jsoup;
    jsoupHolder.nodes = new Pkg({ Document: J.Document, Element: J.Element, TextNode: J.TextNode });
    jsoupHolder.select = new Pkg({ Elements: J.Elements });
  }
  g.Packages = packages;
  g.javax = packages.javax; g.org = packages.org; g.android = packages.android; g.cn = packages.cn; g.com = packages.com;
  // \u5F00\u6E90\u9605\u8BFB\u4E2D java \u6307\u5411\u6269\u5C55\u5BF9\u8C61\uFF1B\u5728\u5176\u4E0A\u8865\u5145\u5305\uFF0C\u517C\u5BB9 java.util.UUID \u8FD9\u7C7B\u5199\u6CD5
  java.lang = packages.java.lang; java.util = packages.java.util; java.net = packages.java.net;
  java.math = packages.java.math; java.io = packages.java.io; java.security = packages.java.security; java.nio = packages.java.nio;

  function importInto(target, x) {
    var k;
    if (x instanceof Pkg) { for (k in x) { if (!(x[k] instanceof Pkg)) { target[k] = x[k]; } } return; }
    if (x && typeof x === 'object' && !(x instanceof Pkg)) { for (k in x) { if (x[k] instanceof Pkg) { importInto(target, x[k]); } } return; }
    if (x) {
      // \u7C7B\uFF1A\u5728\u5305\u6811\u91CC\u627E\u5230\u5B83\u7684\u540D\u5B57
      (function find(node) {
        var n;
        for (n in node) {
          if (node[n] === x) { target[n] = x; return true; }
          if (node[n] && typeof node[n] === 'object' && node[n] !== Math && find(node[n])) { return true; }
        }
        return false;
      })(packages);
    }
  }
  g.JavaImporter = function () {
    var o = {}, i;
    for (i = 0; i < arguments.length; i++) { importInto(o, arguments[i]); }
    o.importPackage = function () { for (var j = 0; j < arguments.length; j++) { importInto(o, arguments[j]); } };
    o.importClass = o.importPackage;
    return o;
  };
  g.importPackage = function () { var i; for (i = 0; i < arguments.length; i++) { importInto(g, arguments[i]); } };
  g.importClass = g.importPackage;

  function vars(scope) {
    return {
      get: function (k) { return call('var.get', [scope, str(k)]); },
      put: function (k, v) { call('var.put', [scope, str(k), str(v)]); return v; }
    };
  }
  g.__init = function (json) {
    var b = JSON.parse(json || '{}'), k;
    for (k in b) { if (k !== 'source' && k !== 'book' && k !== 'chapter') { g[k] = b[k]; } }
    if (b.resultIsNode && typeof g.result === 'string' && packages.org.jsoup.Jsoup) {
      var el = packages.org.jsoup.Jsoup.parseBodyFragment(g.result).body().child(0);
      if (el) { g.result = el; }
    }
    delete g.resultIsNode;
    // \u5217\u8868\u9879\u5728\u5F00\u6E90\u9605\u8BFB\u4E2D\u5E38\u662F JSON \u5B57\u7B26\u4E32\uFF0C\u4E66\u6E90\u4F1A\u5199 JSON.parse(String(result))\uFF1A\u8BA9\u5BF9\u8C61\u8F6C\u5B57\u7B26\u4E32\u65F6\u5F97\u5230 JSON
    if (g.result && typeof g.result === 'object' && Object.getPrototypeOf(g.result) === Object.prototype) {
      Object.defineProperty(g.result, 'toString', { value: function () { return JSON.stringify(this); }, enumerable: false });
    }
    var sv = vars('source'), bv = vars('book'), cv = vars('chapter');
    var src = b.source || {};
    src.getKey = function () { return src.bookSourceUrl; };
    src.getVariable = function () { return sv.get('__variable') || ''; };
    src.setVariable = function (v) { sv.put('__variable', v); };
    src.get = sv.get; src.put = sv.put;
    src.getLoginInfo = function () { return sv.get('__loginInfo') || ''; };
    src.getLoginInfoMap = function () { var s = src.getLoginInfo(); try { return s ? JSON.parse(s) : {}; } catch (e) { return {}; } };
    src.putLoginInfo = function (v) { sv.put('__loginInfo', v); };
    src.getLoginHeader = function () { return sv.get('__loginHeader') || ''; };
    src.getLoginHeaderMap = function () { var s = src.getLoginHeader(); try { return s ? JSON.parse(s) : {}; } catch (e) { return {}; } };
    src.putLoginHeader = function (v) { sv.put('__loginHeader', v); };
    src.removeLoginHeader = function () { sv.put('__loginHeader', ''); };
    g.source = src;
    var book = b.book || {};
    book.getVariable = function (k) { return bv.get(k === undefined ? '__variable' : k) || ''; };
    book.putVariable = function (k, v) { return bv.put(k, v); };
    book.setVariable = function (v) { bv.put('__variable', v); };
    book.setReverseToc = function () {};
    book.setUseReplaceRule = function () {};
    g.book = book;
    var chapter = b.chapter || {};
    chapter.getVariable = function (k) { return cv.get(k === undefined ? '__variable' : k) || ''; };
    chapter.putVariable = function (k, v) { return cv.put(k, v); };
    g.chapter = chapter;
    g.cookie = {
      getCookie: function (u) { return call('cookie.get', [str(u), null]) || ''; },
      getKey: function (u, k) { return call('cookie.get', [str(u), str(k)]) || ''; },
      setCookie: function (u, c) { call('cookie.set', [str(u), str(c)]); },
      replaceCookie: function (u, c) { call('cookie.replace', [str(u), str(c)]); },
      removeCookie: function (u) { call('cookie.remove', [str(u)]); }
    };
    var cv2 = vars('cache');
    g.cache = {
      get: function (k) { return cv2.get(k); },
      put: function (k, v) { cv2.put(k, v); },
      getFromMemory: function (k) { return cv2.get(k); },
      putMemory: function (k, v) { cv2.put(k, v); },
      delete: function (k) { cv2.put(k, ''); },
      deleteMemory: function (k) { cv2.put(k, ''); }
    };
  };
  g.__out = function (v) {
    if (v === undefined || v === null) { return JSON.stringify({ t: 'null' }); }
    if (typeof v === 'object' && !(v instanceof String)) {
      if (isBytes(v)) { return JSON.stringify({ t: 's', v: bytesToUtf8(v) }); }
      if (typeof v.body === 'function' && v.__response) { return JSON.stringify({ t: 's', v: String(v.body()) }); }
      // jsoup \u5143\u7D20 / \u5143\u7D20\u96C6\u5408\uFF1A\u8F93\u51FA HTML\uFF08\u4E0E\u5F00\u6E90\u9605\u8BFB\u628A Element \u4F20\u7ED9\u4E0B\u4E00\u6B65\u89C4\u5219\u4E00\u81F4\uFF09
      if (typeof v.outerHtml === 'function') {
        if (Array.isArray(v)) { return JSON.stringify({ t: 'j', v: Array.prototype.map.call(v, function (e) { return e.outerHtml(); }) }); }
        return JSON.stringify({ t: 's', v: v.outerHtml() });
      }
      if (v instanceof HashMap || v instanceof BigInteger) { return JSON.stringify({ t: 'j', v: JSON.parse(JSON.stringify(v)) }); }
      return JSON.stringify({ t: 'j', v: v });
    }
    return JSON.stringify({ t: 's', v: String(v) });
  };
})(this);
`;

// ../harmony-legado/entry/src/main/ets/common/utils/JsJsoup.ets
var JS_JSOUP = `
function __jsoupFactory(g) {
  'use strict';
  function mk(list) { var o = {}; list.split(',').forEach(function (k) { o[k] = 1; }); return o; }
  var VOID = mk('area,base,br,col,embed,hr,img,input,keygen,link,meta,param,source,track,wbr,frame,basefont,bgsound,command');
  var RAW = mk('script,style,textarea,title,xmp,iframe,noembed,noframes,plaintext');
  var DATA = mk('script,style,xmp,iframe,noembed,noframes,plaintext');
  var BLOCK = mk('html,body,div,p,h1,h2,h3,h4,h5,h6,ul,ol,li,dl,dt,dd,table,tr,td,th,thead,tbody,tfoot,caption,form,section,article,header,footer,nav,aside,blockquote,pre,address,hr,fieldset,figure,figcaption,main,center,option,select,head,title,legend,menu,dir,noscript,details,summary,optgroup,colgroup,frameset,hgroup');
  var CLOSE_P = mk('address,article,aside,blockquote,center,details,dir,div,dl,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,hr,main,menu,nav,ol,p,pre,section,summary,table,ul,li,dd,dt,listing');
  var HEADTAG = mk('title,meta,link,style,script,base,noscript');
  var ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\xA0', copy: '\xA9', reg: '\xAE', trade: '\u2122',
    hellip: '\u2026', mdash: '\u2014', ndash: '\u2013', lsquo: '\u2018', rsquo: '\u2019', ldquo: '\u201C', rdquo: '\u201D',
    middot: '\xB7', bull: '\u2022', times: '\xD7', divide: '\xF7', laquo: '\xAB', raquo: '\xBB', yen: '\xA5',
    euro: '\u20AC', pound: '\xA3', cent: '\xA2', sect: '\xA7', deg: '\xB0', plusmn: '\xB1', para: '\xB6',
    ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009', zwnj: '\u200C', zwj: '\u200D', lrm: '\u200E', rlm: '\u200F',
    iexcl: '\xA1', shy: '\xAD', larr: '\u2190', rarr: '\u2192', uarr: '\u2191', darr: '\u2193', hearts: '\u2665', star: '\u2606' };

  function decode(s) {
    if (s.indexOf('&') < 0) { return s; }
    return s.replace(/&(#[xX][0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);?/g, function (m, e) {
      if (e.charAt(0) === '#') {
        var n = e.charAt(1) === 'x' || e.charAt(1) === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        if (!(n > 0) || n > 0x10ffff) { return '\uFFFD'; }
        if (n < 0x10000) { return String.fromCharCode(n); }
        n -= 0x10000; return String.fromCharCode(0xd800 + (n >> 10), 0xdc00 + (n & 1023));
      }
      var v = ENT[e] || ENT[e.toLowerCase()];
      return v === undefined ? m : v;
    });
  }
  function escText(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\xA0/g, '&nbsp;'); }
  function escAttr(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/\xA0/g, '&nbsp;'); }
  function isWs(c) { return c === ' ' || c === '\\t' || c === '\\n' || c === '\\r' || c === '\\f' || c === '\xA0'; }
  function normWs(s) { return s.replace(/[ \\t\\n\\r\\f\xA0]+/g, ' '); }
  function trim(s) { return s.replace(/^[ \\t\\n\\r\\f\xA0]+|[ \\t\\n\\r\\f\xA0]+$/g, ''); }

  // ---------- URL ----------
  function resolveUrl(base, rel) {
    rel = trim(String(rel == null ? '' : rel));
    if (/^[a-zA-Z][a-zA-Z0-9+.\\-]*:/.test(rel)) { return rel; }
    var m = /^([a-zA-Z][a-zA-Z0-9+.\\-]*:)\\/\\/([^\\/?#]*)([^?#]*)(\\?[^#]*)?/.exec(base || '');
    if (!m) { return ''; }
    var origin = m[1] + '//' + m[2], path = m[3] || '/', q = m[4] || '';
    if (rel === '') { return origin + path + q; }
    if (rel.slice(0, 2) === '//') { return m[1] + rel; }
    if (rel.charAt(0) === '#') { return origin + path + q + rel; }
    if (rel.charAt(0) === '?') { return origin + path + rel; }
    var p = rel.charAt(0) === '/' ? rel : path.replace(/[^\\/]*$/, '') + rel;
    var tail = '', k = p.search(/[?#]/);
    if (k >= 0) { tail = p.slice(k); p = p.slice(0, k); }
    var segs = p.split('/'), out = [];
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      if (s === '..') { if (out.length > 1) { out.pop(); } if (i === segs.length - 1) { out.push(''); } }
      else if (s === '.') { if (i === segs.length - 1) { out.push(''); } }
      else { out.push(s); }
    }
    p = out.join('/');
    if (p.charAt(0) !== '/') { p = '/' + p; }
    return origin + p + tail;
  }

  // ---------- Nodes ----------
  function Node() {}
  Node.prototype.parent = function () { return this._parent || null; };
  Node.prototype.siblingIndex = function () { return this._parent ? this._parent._nodes.indexOf(this) : 0; };
  Node.prototype.remove = function () {
    var p = this._parent;
    if (p) { var i = p._nodes.indexOf(this); if (i >= 0) { p._nodes.splice(i, 1); } this._parent = null; }
    return this;
  };
  Node.prototype.nextSibling = function () { var p = this._parent; if (!p) { return null; } return p._nodes[p._nodes.indexOf(this) + 1] || null; };
  Node.prototype.previousSibling = function () { var p = this._parent; if (!p) { return null; } return p._nodes[p._nodes.indexOf(this) - 1] || null; };
  Node.prototype.ownerDocument = function () { var n = this; while (n._parent) { n = n._parent; } return n instanceof Document ? n : null; };
  Node.prototype.baseUri = function () { var n = this; while (n) { if (n._base) { return n._base; } n = n._parent; } return ''; };
  Node.prototype.toString = function () { return this.outerHtml(); };

  function TextNode(text, isData) { this._text = text; this._data = !!isData; this._parent = null; }
  TextNode.prototype = Object.create(Node.prototype);
  TextNode.prototype.constructor = TextNode;
  TextNode.prototype.nodeName = function () { return this._data ? '#data' : '#text'; };
  TextNode.prototype.text = function (v) {
    if (arguments.length) { this._text = String(v); return this; }
    return normWs(this._text);
  };
  TextNode.prototype.getWholeText = function () { return this._text; };
  TextNode.prototype.isBlank = function () { return trim(this._text) === ''; };
  TextNode.prototype.outerHtml = function () {
    if (this._data) { return this._text; }
    return escText(this._text);
  };

  function Comment(t) { this._text = t; this._parent = null; }
  Comment.prototype = Object.create(Node.prototype);
  Comment.prototype.constructor = Comment;
  Comment.prototype.nodeName = function () { return '#comment'; };
  Comment.prototype.getData = function () { return this._text; };
  Comment.prototype.outerHtml = function () { return '<!--' + this._text + '-->'; };

  function Attribute(k, v) { this.key = k; this.value = v; }
  Attribute.prototype.getKey = function () { return this.key; };
  Attribute.prototype.getValue = function () { return this.value; };
  Attribute.prototype.html = function () { return this.key + '="' + escAttr(this.value) + '"'; };

  function Element(tag, attrs) {
    this._tag = String(tag).toLowerCase();
    this._attrs = attrs || [];
    this._nodes = [];
    this._parent = null;
  }
  Element.prototype = Object.create(Node.prototype);
  Element.prototype.constructor = Element;
  var EP = Element.prototype;
  EP.tagName = function () { return this._tag; };
  EP.nodeName = EP.tagName;
  EP.isBlock = function () { return !!BLOCK[this._tag]; };
  EP._find = function (k) {
    k = String(k).toLowerCase();
    for (var i = 0; i < this._attrs.length; i++) { if (this._attrs[i].key === k) { return this._attrs[i]; } }
    return null;
  };
  EP.attr = function (k, v) {
    if (arguments.length > 1) {
      var a = this._find(k);
      if (a) { a.value = String(v); } else { this._attrs.push(new Attribute(String(k).toLowerCase(), String(v))); }
      return this;
    }
    k = String(k);
    if (k.slice(0, 4).toLowerCase() === 'abs:') { return this.absUrl(k.slice(4)); }
    var f = this._find(k);
    return f ? f.value : '';
  };
  EP.hasAttr = function (k) {
    k = String(k);
    if (k.slice(0, 4).toLowerCase() === 'abs:') { return this.hasAttr(k.slice(4)) && this.absUrl(k.slice(4)) !== ''; }
    return !!this._find(k);
  };
  EP.removeAttr = function (k) { var a = this._find(k); if (a) { this._attrs.splice(this._attrs.indexOf(a), 1); } return this; };
  EP.absUrl = function (k) { var a = this._find(k); return a ? resolveUrl(this.baseUri(), a.value) : ''; };
  EP.attributes = function () {
    var list = this._attrs.slice();
    list.size = function () { return list.length; };
    list.get = function (k) { for (var i = 0; i < list.length; i++) { if (list[i].key === String(k).toLowerCase()) { return list[i].value; } } return ''; };
    list.hasKey = function (k) { for (var i = 0; i < list.length; i++) { if (list[i].key === String(k).toLowerCase()) { return true; } } return false; };
    list.asList = function () { return list.slice(); };
    list.iterator = function () { return iter(list); };
    return list;
  };
  EP.id = function () { return this.attr('id'); };
  EP.className = function () { return trim(this.attr('class')); };
  EP.classNames = function () { var c = this.className(); return c ? c.split(/[ \\t\\n\\r\\f]+/) : []; };
  EP.hasClass = function (c) {
    c = String(c).toLowerCase();
    return this.classNames().some(function (x) { return x.toLowerCase() === c; });
  };
  EP.val = function (v) {
    if (arguments.length) { return this.attr('value', v); }
    return this._tag === 'textarea' ? this.text() : this.attr('value');
  };
  EP.childNodes = function () { return this._nodes.slice(); };
  EP.childNode = function (i) { return this._nodes[i] || null; };
  EP.childNodeSize = function () { return this._nodes.length; };
  EP._kids = function () { return this._nodes.filter(function (n) { return n instanceof Element; }); };
  EP.children = function () { return els(this._kids()); };
  EP.childrenSize = function () { return this._kids().length; };
  EP.child = function (i) { return this._kids()[i] || null; };
  EP.firstElementChild = function () { return this._kids()[0] || null; };
  EP.lastElementChild = function () { var k = this._kids(); return k[k.length - 1] || null; };
  EP.parent = function () { var p = this._parent; return p instanceof Element ? p : null; };
  EP.parents = function () { var r = els(), p = this.parent(); while (p && !(p instanceof Document)) { r.push(p); p = p.parent(); } return r; };
  EP.is = function (q) { return matchAny(this, compile(q), this); };
  EP._sibs = function () { return this._parent ? this._parent._kids() : [this]; };
  EP.elementSiblingIndex = function () { return this._sibs().indexOf(this); };
  EP.nextElementSibling = function () { var s = this._sibs(); return s[s.indexOf(this) + 1] || null; };
  EP.previousElementSibling = function () { var s = this._sibs(); return s[s.indexOf(this) - 1] || null; };
  EP.siblingElements = function () { var me = this; return els(this._parent ? this._sibs().filter(function (e) { return e !== me; }) : []); };
  EP._walk = function (fn, self) {
    if (self !== false) { fn(this); }
    for (var i = 0; i < this._nodes.length; i++) { var n = this._nodes[i]; if (n instanceof Element) { n._walk(fn, true); } }
  };
  EP._collect = function (pred) { var r = els(); this._walk(function (e) { if (pred(e)) { r.push(e); } }); return r; };
  EP.getAllElements = function () { return this._collect(function () { return true; }); };
  EP.getElementsByTag = function (t) { t = String(t).toLowerCase(); return this._collect(function (e) { return e._tag === t; }); };
  EP.getElementsByClass = function (c) { return this._collect(function (e) { return e.hasClass(c); }); };
  EP.getElementById = function (id) { return this._collect(function (e) { return e.id() === String(id); })[0] || null; };
  EP.getElementsByAttribute = function (k) { return this._collect(function (e) { return e.hasAttr(k); }); };
  EP.getElementsByAttributeValue = function (k, v) { return this._collect(function (e) { return e.hasAttr(k) && e.attr(k) === String(v); }); };
  EP.getElementsContainingText = function (t) { t = String(t).toLowerCase(); return this._collect(function (e) { return e.text().toLowerCase().indexOf(t) >= 0; }); };
  EP.select = function (q) { return select(q, this); };
  EP.selectFirst = function (q) { return this.select(q)[0] || null; };

  function preserve(n) { var d = 0; while (n && d < 6) { if (n._tag === 'pre' || n._tag === 'textarea') { return true; } n = n._parent; d++; } return false; }
  function lastWs(a) { return a.length === 0 || isWs(a[a.length - 1].slice(-1)); }
  function appendText(acc, tn) {
    var t = tn._text;
    if (preserve(tn._parent)) { acc.push(t); return; }
    t = normWs(t);
    if (t.charAt(0) === ' ' && lastWs(acc)) { t = t.slice(1); }
    if (t) { acc.push(t); }
  }
  EP.text = function (v) {
    if (arguments.length) { this._nodes.forEach(function (n) { n._parent = null; }); this._nodes = []; this.appendChild(new TextNode(String(v))); return this; }
    var acc = [];
    (function rec(el) {
      for (var i = 0; i < el._nodes.length; i++) {
        var n = el._nodes[i];
        if (n instanceof TextNode) { if (!n._data) { appendText(acc, n); } }
        else if (n instanceof Element) {
          if ((BLOCK[n._tag] || n._tag === 'br') && !lastWs(acc)) { acc.push(' '); }
          rec(n);
          if (BLOCK[n._tag] && el._nodes[i + 1] instanceof TextNode && !lastWs(acc)) { acc.push(' '); }
        }
      }
    })(this);
    return trim(acc.join(''));
  };
  EP.ownText = function () {
    var acc = [];
    this._nodes.forEach(function (n) {
      if (n instanceof TextNode) { if (!n._data) { appendText(acc, n); } }
      else if (n instanceof Element && n._tag === 'br' && !lastWs(acc)) { acc.push(' '); }
    });
    return trim(acc.join(''));
  };
  EP.wholeText = function () {
    var acc = [];
    (function rec(el) {
      el._nodes.forEach(function (n) {
        if (n instanceof TextNode) { acc.push(n._text); }
        else if (n instanceof Element) { if (n._tag === 'br') { acc.push('\\n'); } rec(n); }
      });
    })(this);
    return acc.join('');
  };
  EP.hasText = function () { return this.text() !== ''; };
  EP.textNodes = function () { return this._nodes.filter(function (n) { return n instanceof TextNode && !n._data; }); };
  EP.dataNodes = function () { return this._nodes.filter(function (n) { return n instanceof TextNode && n._data; }); };
  EP.data = function () {
    var acc = [];
    (function rec(el) {
      el._nodes.forEach(function (n) {
        if (n instanceof TextNode) { if (n._data) { acc.push(n._text); } }
        else if (n instanceof Comment) { acc.push(n._text); }
        else if (n instanceof Element) { rec(n); }
      });
    })(this);
    return acc.join('');
  };
  EP.html = function (v) {
    if (arguments.length) { this.empty(); this.append(String(v)); return this; }
    return this._nodes.map(function (n) { return n.outerHtml(); }).join('');
  };
  EP.outerHtml = function () {
    var s = '<' + this._tag + this._attrs.map(function (a) { return ' ' + a.html(); }).join('');
    if (VOID[this._tag] && !this._nodes.length) { return s + '>'; }
    return s + '>' + this.html() + '</' + this._tag + '>';
  };
  EP.empty = function () { this._nodes.forEach(function (n) { n._parent = null; }); this._nodes = []; return this; };
  EP.appendChild = function (n) { n.remove(); n._parent = this; this._nodes.push(n); return this; };
  EP.append = function (h) { var me = this; fragment(String(h), this).forEach(function (n) { me.appendChild(n); }); return this; };
  EP.appendElement = function (t) { var e = new Element(t); this.appendChild(e); return e; };
  EP.appendText = function (t) { return this.appendChild(new TextNode(String(t))); };

  function Document(base) { Element.call(this, '#root'); this._base = base || ''; }
  Document.prototype = Object.create(Element.prototype);
  Document.prototype.constructor = Document;
  var DP = Document.prototype;
  DP.nodeName = function () { return '#document'; };
  DP.outerHtml = function () { return this.html(); };
  DP._first = function (t) { return this.getElementsByTag(t)[0] || null; };
  DP.head = function () { return this._first('head'); };
  DP.body = function () { return this._first('body') || this._first('frameset'); };
  DP.title = function (v) {
    var t = this._first('title');
    if (arguments.length) { if (!t) { t = this.head().appendElement('title'); } t.text(v); return this; }
    return t ? trim(normWs(t.text())) : '';
  };
  DP.location = function () { return this._base; };

  // ---------- Elements ----------
  class Elements extends Array {}
  function els(arr) { var r = new Elements(); if (arr) { for (var i = 0; i < arr.length; i++) { r.push(arr[i]); } } return r; }
  function iter(a) { var i = 0; return { hasNext: function () { return i < a.length; }, next: function () { return a[i++]; } }; }
  var LP = Elements.prototype, AP = Array.prototype;
  LP.size = function () { return this.length; };
  LP.get = function (i) { return this[i] === undefined ? null : this[i]; };
  LP.first = function () { return this.length ? this[0] : null; };
  LP.last = function () { return this.length ? this[this.length - 1] : null; };
  LP.isEmpty = function () { return this.length === 0; };
  LP.iterator = function () { return iter(this); };
  LP.toArray = function () { return Array.prototype.slice.call(this); };
  LP.text = function () { return AP.map.call(this, function (e) { return e.text(); }).filter(function (t) { return t !== ''; }).join(' '); };
  LP.eachText = function () { return AP.map.call(this, function (e) { return e.text(); }).filter(function (t) { return t !== ''; }); };
  LP.html = function () { return AP.map.call(this, function (e) { return e.html(); }).join('\\n'); };
  LP.outerHtml = function () { return AP.map.call(this, function (e) { return e.outerHtml(); }).join('\\n'); };
  LP.toString = LP.outerHtml;
  LP.attr = function (k, v) {
    var i;
    if (arguments.length > 1) { for (i = 0; i < this.length; i++) { this[i].attr(k, v); } return this; }
    for (i = 0; i < this.length; i++) { if (this[i].hasAttr(k)) { return this[i].attr(k); } }
    return '';
  };
  LP.eachAttr = function (k) { var r = []; for (var i = 0; i < this.length; i++) { if (this[i].hasAttr(k)) { r.push(this[i].attr(k)); } } return r; };
  LP.hasAttr = function (k) { return AP.some.call(this, function (e) { return e.hasAttr(k); }); };
  LP.hasClass = function (c) { return AP.some.call(this, function (e) { return e.hasClass(c); }); };
  LP.hasText = function () { return AP.some.call(this, function (e) { return e.hasText(); }); };
  LP.select = function (q) {
    var seen = [], r = els();
    for (var i = 0; i < this.length; i++) {
      var s = this[i].select(q);
      for (var j = 0; j < s.length; j++) { if (seen.indexOf(s[j]) < 0) { seen.push(s[j]); r.push(s[j]); } }
    }
    return r;
  };
  LP.not = function (q) { var s = this.select(q); return els(AP.filter.call(this, function (e) { return s.indexOf(e) < 0; })); };
  LP.is = function (q) { var c = compile(q); return AP.some.call(this, function (e) { return matchAny(e, c, e); }); };
  LP.eq = function (i) { if (i < 0) { i += this.length; } return els(this[i] ? [this[i]] : []); };
  LP.remove = function () { for (var i = 0; i < this.length; i++) { this[i].remove(); } return this; };
  LP.parents = function () { var r = els(); AP.forEach.call(this, function (e) { e.parents().forEach(function (p) { if (r.indexOf(p) < 0) { r.push(p); } }); }); return r; };

  // ---------- Parser ----------
  function fragment(html, ctx) {
    var d = parseInternal('<body>' + html, ctx ? ctx.baseUri() : '', true);
    var b = d.body(), n = b._nodes.slice();
    n.forEach(function (x) { x._parent = null; });
    return n;
  }
  function inStack(stack, tags, stop) {
    for (var i = stack.length - 1; i > 0; i--) {
      var t = stack[i]._tag;
      if (tags[t]) { return i; }
      if (stop[t]) { return -1; }
    }
    return -1;
  }
  var S_P = mk('button,td,th,table,caption,html,body,applet,marquee,object,template'),
    S_LI = mk('ul,ol,table,td,th,body,html'), S_D = mk('dl,table,td,th,body,html'),
    S_ROW = mk('table,body,html'), S_CELL = mk('tr,table,body,html'), S_OPT = mk('select,body,html'),
    T_P = mk('p'), T_LI = mk('li'), T_D = mk('dd,dt'), T_ROW = mk('tr'), T_CELL = mk('td,th'), T_OPT = mk('option'),
    T_SEC = mk('thead,tbody,tfoot'), T_H = mk('h1,h2,h3,h4,h5,h6'), T_A = mk('a'), S_A = mk('table,td,th,body,html'), S_ANY = mk('html');

  function parseInternal(html, base, bodyMode) {
    html = String(html == null ? '' : html);
    var doc = new Document(base), root = new Element('html'), head = new Element('head'), body = new Element('body');
    doc.appendChild(root); root.appendChild(head); root.appendChild(body);
    var stack = [doc, root, bodyMode ? body : head], inHead = !bodyMode;
    var len = html.length, i = 0;
    function cur() { return stack[stack.length - 1]; }
    function popTo(idx) { stack.length = idx; }
    function toBody() { if (inHead) { inHead = false; stack = [doc, root, body]; } }
    function addText(t, data) {
      if (!t) { return; }
      if (inHead && !data && /[^ \\t\\n\\r\\f]/.test(t) && cur() === head) { toBody(); }
      var c = cur(), last = c._nodes[c._nodes.length - 1];
      if (inHead && cur() === head && !data) { return; }
      if (last instanceof TextNode && !last._data && !data) { last._text += t; } else { c.appendChild(new TextNode(t, data)); }
    }
    function closeIdx(k) { if (k > 1) { popTo(k); } }
    function open(tag, attrs, selfClose) {
      if (tag === 'html') { mergeAttrs(root, attrs); return; }
      if (tag === 'head') { if (inHead) { mergeAttrs(head, attrs); } return; }
      if (tag === 'body' || tag === 'frameset') { if (inHead) { toBody(); } mergeAttrs(body, attrs); return; }
      if (inHead && cur() === head && !HEADTAG[tag]) { toBody(); }
      if (CLOSE_P[tag]) { closeIdx(inStack(stack, T_P, S_P)); }
      if (tag === 'li') { closeIdx(inStack(stack, T_LI, S_LI)); }
      else if (tag === 'dd' || tag === 'dt') { closeIdx(inStack(stack, T_D, S_D)); }
      else if (tag === 'tr') { closeIdx(inStack(stack, T_ROW, S_ROW)); }
      else if (tag === 'td' || tag === 'th') { closeIdx(inStack(stack, T_CELL, S_CELL)); }
      else if (tag === 'option' || tag === 'optgroup') { closeIdx(inStack(stack, T_OPT, S_OPT)); }
      else if (T_SEC[tag]) { closeIdx(inStack(stack, T_SEC, S_ROW)); }
      else if (T_H[tag] && T_H[cur()._tag]) { stack.pop(); }
      else if (tag === 'a') { closeIdx(inStack(stack, T_A, S_A)); }
      if (tag === 'tr' && cur()._tag === 'table') { var tb = new Element('tbody'); cur().appendChild(tb); stack.push(tb); }
      if ((tag === 'td' || tag === 'th') && (cur()._tag === 'table' || T_SEC[cur()._tag])) {
        if (cur()._tag === 'table') { var tb2 = new Element('tbody'); cur().appendChild(tb2); stack.push(tb2); }
        var tr = new Element('tr'); cur().appendChild(tr); stack.push(tr);
      }
      var el = new Element(tag, attrs);
      cur().appendChild(el);
      if (tag === 'base' && !doc._baseSet && el.hasAttr('href')) { doc._base = resolveUrl(doc._base, el.attr('href')) || el.attr('href'); doc._baseSet = true; }
      if (!VOID[tag] && !selfClose) { stack.push(el); }
    }
    function mergeAttrs(el, attrs) { attrs.forEach(function (a) { if (!el._find(a.key)) { el._attrs.push(a); } }); }
    function close(tag) {
      if (tag === 'br') { open('br', [], true); return; }
      if (tag === 'head') { toBody(); return; }
      if (tag === 'body' || tag === 'html') { return; }
      if (tag === 'p' && inStack(stack, T_P, S_P) < 0) { open('p', [], true); return; }
      var k = -1;
      for (var j = stack.length - 1; j > 1; j--) { if (stack[j]._tag === tag) { k = j; break; } if (stack[j] === head || stack[j] === body) { break; } }
      if (k > 1) { popTo(k); }
    }
    var reName = /^[a-zA-Z][^\\s\\/>]*/;
    while (i < len) {
      var lt = html.indexOf('<', i);
      if (lt < 0) { addText(decode(html.slice(i)), false); break; }
      if (lt > i) { addText(decode(html.slice(i, lt)), false); }
      i = lt;
      var c1 = html.charAt(i + 1);
      if (html.substr(i, 4) === '<!--') {
        var ce = html.indexOf('-->', i + 4);
        var ct = html.slice(i + 4, ce < 0 ? len : ce);
        cur().appendChild(new Comment(ct));
        i = ce < 0 ? len : ce + 3;
      } else if (c1 === '!' || c1 === '?') {
        var ge = html.indexOf('>', i);
        i = ge < 0 ? len : ge + 1;
      } else if (c1 === '/') {
        var m = reName.exec(html.slice(i + 2, i + 200));
        var ge2 = html.indexOf('>', i);
        if (m) { close(m[0].toLowerCase()); }
        else if (html.charAt(i + 2) !== '>') { addText('</', false); i += 2; continue; }
        i = ge2 < 0 ? len : ge2 + 1;
      } else if (/[a-zA-Z]/.test(c1)) {
        var nm = reName.exec(html.slice(i + 1, i + 200))[0];
        var tag = nm.toLowerCase(), attrs = [], p = i + 1 + nm.length, selfClose = false;
        while (p < len) {
          while (p < len && /[\\s\\/]/.test(html.charAt(p))) { if (html.charAt(p) === '/' && html.charAt(p + 1) === '>') { selfClose = true; } p++; }
          if (p >= len || html.charAt(p) === '>') { break; }
          var an = /^[^\\s\\/>=]+|^=/.exec(html.slice(p, p + 500));
          var key = an[0]; p += key.length;
          while (p < len && /\\s/.test(html.charAt(p))) { p++; }
          var val = '';
          if (html.charAt(p) === '=') {
            p++;
            while (p < len && /\\s/.test(html.charAt(p))) { p++; }
            var q = html.charAt(p);
            if (q === '"' || q === "'") {
              var qe = html.indexOf(q, p + 1); if (qe < 0) { qe = len; }
              val = html.slice(p + 1, qe); p = qe + 1;
            } else {
              var uv = /^[^\\s>]*/.exec(html.slice(p, p + 2000))[0];
              val = uv; p += uv.length;
            }
          }
          key = key.toLowerCase();
          if (!attrs.some(function (a) { return a.key === key; })) { attrs.push(new Attribute(key, decode(val))); }
        }
        i = p + 1;
        if (RAW[tag] && !selfClose) {
          var re = new RegExp('</' + tag + '[\\\\s>/]', 'ig'); re.lastIndex = i;
          var rm = re.exec(html), end = rm ? rm.index : len;
          var content = html.slice(i, end);
          open(tag, attrs, false);
          if (content) { cur().appendChild(DATA[tag] ? new TextNode(content, true) : new TextNode(decode(content))); }
          stack.pop();
          if (rm) { var ge3 = html.indexOf('>', end); i = ge3 < 0 ? len : ge3 + 1; } else { i = len; }
        } else {
          open(tag, attrs, selfClose);
        }
      } else {
        addText('<', false); i++;
      }
    }
    return doc;
  }

  // ---------- Selector ----------
  var cache = {};
  function unq(s) { s = trim(s); var c = s.charAt(0); return (c === '"' || c === "'") && s.slice(-1) === c ? s.slice(1, -1) : s; }
  function splitTop(q, ch) {
    var out = [], depth = 0, quote = '', last = 0;
    for (var i = 0; i < q.length; i++) {
      var c = q.charAt(i);
      if (quote) { if (c === quote) { quote = ''; } continue; }
      if (c === '"' || c === "'") { quote = c; } else if (c === '(' || c === '[') { depth++; } else if (c === ')' || c === ']') { depth--; } else if (c === ch && depth === 0) { out.push(q.slice(last, i)); last = i + 1; }
    }
    out.push(q.slice(last));
    return out;
  }
  function compile(q) {
    q = String(q);
    if (cache[q]) { return cache[q]; }
    var groups = splitTop(q, ',').map(function (s) { return parseChain(trim(s)); });
    if (!groups.length || groups.some(function (g2) { return !g2.length; })) { throw new Error('Jsoup: bad selector ' + q); }
    cache[q] = groups;
    return groups;
  }
  function parseChain(s) {
    var parts = [], i = 0, comb = null, len = s.length;
    if (/^[>+~]/.test(s)) { parts.push({ c: [{ t: 'scope' }], k: null }); }
    while (i < len) {
      var ws = false;
      while (i < len && /\\s/.test(s.charAt(i))) { i++; ws = true; }
      if (i >= len) { break; }
      var ch = s.charAt(i);
      if (ch === '>' || ch === '+' || ch === '~') { comb = ch; i++; continue; }
      if (ws && parts.length && !comb) { comb = ' '; }
      var r = parseCompound(s, i);
      if (!r.c.length) { throw new Error('Jsoup: bad selector ' + s); }
      parts.push({ c: r.c, k: parts.length ? (comb || ' ') : null });
      comb = null; i = r.i;
    }
    return parts;
  }
  function readParen(s, i) {
    var depth = 0, quote = '', st = i;
    for (; i < s.length; i++) {
      var c = s.charAt(i);
      if (quote) { if (c === '\\\\') { i++; } else if (c === quote) { quote = ''; } continue; }
      if (c === '"' || c === "'") { quote = c; } else if (c === '(') { depth++; } else if (c === ')') { depth--; if (depth === 0) { return { v: s.slice(st + 1, i), i: i + 1 }; } }
    }
    throw new Error('Jsoup: unbalanced () in ' + s);
  }
  function parseCompound(s, i) {
    var c = [], len = s.length, m;
    var idre = /^(?:\\\\.|[\\w\xA0-\uFFFF\\-])+/;
    while (i < len) {
      var ch = s.charAt(i), rest = s.slice(i);
      if (ch === '*') { c.push({ t: 'any' }); i++; }
      else if (ch === '#') { m = idre.exec(rest.slice(1)); c.push({ t: 'id', v: m[0].replace(/\\\\/g, '') }); i += 1 + m[0].length; }
      else if (ch === '.') { m = idre.exec(rest.slice(1)); c.push({ t: 'cls', v: m[0].replace(/\\\\/g, '') }); i += 1 + m[0].length; }
      else if (ch === '[') {
        var e = s.indexOf(']', i); var inner = s.slice(i + 1, e);
        var am = /^\\s*([^\\s~^$*!=|]+)\\s*([~^$*!]?=)?\\s*([\\s\\S]*?)\\s*$/.exec(inner);
        var nm = am[1].toLowerCase();
        if (nm.charAt(0) === '^') { c.push({ t: 'apre', v: nm.slice(1) }); }
        else { c.push({ t: 'attr', k: nm, op: am[2] || '', v: am[2] ? unq(am[3]) : '' }); }
        i = e + 1;
      }
      else if (ch === ':') {
        m = /^[\\w\\-]+/.exec(rest.slice(1)); var name = m[0].toLowerCase(); i += 1 + m[0].length;
        var arg = null;
        if (s.charAt(i) === '(') { var pr = readParen(s, i); arg = pr.v; i = pr.i; }
        c.push(pseudo(name, arg));
      }
      else if ((m = /^[\\w\\-|]*[\\w\\-]/.exec(rest)) && c.length === 0) { c.push({ t: 'tag', v: m[0].toLowerCase().replace(/^.*\\|/, '') }); i += m[0].length; }
      else { break; }
    }
    return { c: c, i: i };
  }
  function nth(arg) {
    arg = trim(String(arg)).toLowerCase().replace(/\\s+/g, '');
    if (arg === 'odd') { return [2, 1]; }
    if (arg === 'even') { return [2, 0]; }
    var m = /^([+-]?\\d*)n([+-]\\d+)?$/.exec(arg);
    if (m) { var a = m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : parseInt(m[1], 10); return [a, m[2] ? parseInt(m[2], 10) : 0]; }
    return [0, parseInt(arg, 10)];
  }
  function pseudo(name, arg) {
    var p = { t: 'ps', n: name };
    if (/^nth-/.test(name)) { p.ab = nth(arg); }
    else if (name === 'has' || name === 'not' || name === 'is') { p.sel = compile(arg); }
    else if (/^(matches|matchesown|matchtext)$/.test(name)) { p.re = new RegExp(unq(arg)); }
    else if (name === 'eq' || name === 'lt' || name === 'gt') { p.v = parseInt(arg, 10); }
    else if (arg !== null) { p.v = unq(arg).toLowerCase(); }
    return p;
  }
  function nthOk(ab, i) { var a = ab[0], b = ab[1]; if (a === 0) { return i === b; } return (i - b) / a >= 0 && (i - b) % a === 0; }
  function ofType(el) { return el._sibs().filter(function (x) { return x._tag === el._tag; }); }
  function matchSimple(el, s, root) {
    switch (s.t) {
      case 'any': return true;
      case 'scope': return el === root;
      case 'tag': return el._tag === s.v;
      case 'id': return el.id() === s.v;
      case 'cls': return el.hasClass(s.v);
      case 'apre': return el._attrs.some(function (a) { return a.key.indexOf(s.v) === 0; });
      case 'attr':
        if (!el._find(s.k)) { return false; }
        var av = trim(el.attr(s.k)).toLowerCase(), v = s.v.toLowerCase();
        switch (s.op) {
          case '': return true;
          case '=': return av === v;
          case '!=': return av !== v;
          case '^=': return av.indexOf(v) === 0;
          case '$=': return av.slice(av.length - v.length) === v;
          case '*=': return av.indexOf(v) >= 0;
          case '~=': return new RegExp(s.v).test(el.attr(s.k));
        }
        return false;
      case 'ps': return matchPseudo(el, s, root);
    }
    return false;
  }
  function matchPseudo(el, s, root) {
    var n = s.n, sib, i;
    switch (n) {
      case 'first-child': return el._parent instanceof Element && !(el._parent instanceof Document) && el.elementSiblingIndex() === 0;
      case 'last-child': sib = el._sibs(); return el._parent instanceof Element && !(el._parent instanceof Document) && sib[sib.length - 1] === el;
      case 'only-child': return el._parent && !(el._parent instanceof Document) && el._sibs().length === 1;
      case 'nth-child': return nthOk(s.ab, el.elementSiblingIndex() + 1);
      case 'nth-last-child': return nthOk(s.ab, el._sibs().length - el.elementSiblingIndex());
      case 'nth-of-type': return nthOk(s.ab, ofType(el).indexOf(el) + 1);
      case 'nth-last-of-type': sib = ofType(el); return nthOk(s.ab, sib.length - sib.indexOf(el));
      case 'first-of-type': return el._parent && !(el._parent instanceof Document) && ofType(el)[0] === el;
      case 'last-of-type': sib = ofType(el); return el._parent && !(el._parent instanceof Document) && sib[sib.length - 1] === el;
      case 'only-of-type': return el._parent && !(el._parent instanceof Document) && ofType(el).length === 1;
      case 'eq': return el.elementSiblingIndex() === s.v;
      case 'lt': return el.elementSiblingIndex() < s.v;
      case 'gt': return el.elementSiblingIndex() > s.v;
      case 'contains': return el.text().toLowerCase().indexOf(s.v) >= 0;
      case 'containsown': return el.ownText().toLowerCase().indexOf(s.v) >= 0;
      case 'containsdata': return el.data().toLowerCase().indexOf(s.v) >= 0;
      case 'matches': case 'matchtext': return s.re.test(el.text());
      case 'matchesown': return s.re.test(el.ownText());
      case 'has':
        var found = false;
        el._walk(function (d) { if (!found && matchAny(d, s.sel, el)) { found = true; } }, false);
        return found;
      case 'not': return !matchAny(el, s.sel, root);
      case 'is': return matchAny(el, s.sel, root);
      case 'root': var r = root instanceof Document ? root.child(0) : root; return el === r;
      case 'empty':
        for (i = 0; i < el._nodes.length; i++) { var c = el._nodes[i]; if (c instanceof Element || (c instanceof TextNode && !c.isBlank())) { return false; } }
        return true;
    }
    throw new Error('Jsoup: unsupported pseudo :' + n);
  }
  function matchComp(el, c, root) { for (var i = 0; i < c.length; i++) { if (!matchSimple(el, c[i], root)) { return false; } } return true; }
  function matchAt(el, parts, idx, root) {
    if (!matchComp(el, parts[idx].c, root)) { return false; }
    if (idx === 0) { return true; }
    var k = parts[idx].k, p, s, j;
    if (k === '>') { p = el._parent; return el !== root && up(p, root) && matchAt(p, parts, idx - 1, root); }
    if (k === ' ') {
      if (el === root) { return false; }
      p = el._parent;
      while (up(p, root)) { if (matchAt(p, parts, idx - 1, root)) { return true; } if (p === root) { break; } p = p._parent; }
      return false;
    }
    s = el._sibs(); j = s.indexOf(el);
    if (k === '+') { return j > 0 && matchAt(s[j - 1], parts, idx - 1, root); }
    for (j = j - 1; j >= 0; j--) { if (matchAt(s[j], parts, idx - 1, root)) { return true; } }
    return false;
  }
  function up(p, root) { return p instanceof Element && (!(p instanceof Document) || p === root); }
  function matchAny(el, groups, root) { for (var i = 0; i < groups.length; i++) { if (matchAt(el, groups[i], groups[i].length - 1, root)) { return true; } } return false; }
  function select(q, root) {
    var groups = compile(trim(String(q))), r = els();
    root._walk(function (e) { if (!(e instanceof Document) && matchAny(e, groups, root)) { r.push(e); } });
    return r;
  }

  // ---------- Jsoup ----------
  function fetch(url, headers, method, body) {
    var java = g && g.java;
    if (!java) { throw new Error('Jsoup.connect: java bridge unavailable'); }
    var hasH = false, k; for (k in headers) { hasH = true; break; }
    if (method === 'POST' && java.post) { return java.post(url, body || '', headers); }
    if (hasH && java.get) { var r = java.get(url, headers); if (r && typeof r.body === 'function') { return r; } }
    var b = java.ajax(url);
    return { body: function () { return b; }, statusCode: function () { return 200; }, url: function () { return url; }, headers: function () { return {}; }, header: function () { return null; } };
  }
  function Connection(url) { this._url = String(url); this._h = {}; this._data = []; this._body = null; this._method = 'GET'; }
  var CP = Connection.prototype;
  ['timeout', 'ignoreContentType', 'ignoreHttpErrors', 'followRedirects', 'maxBodySize', 'proxy', 'postDataCharset'].forEach(function (n) { CP[n] = function () { return this; }; });
  CP.url = function (u) { this._url = String(u); return this; };
  CP.header = function (k, v) { this._h[k] = String(v); return this; };
  CP.headers = function (o) { for (var k in o) { this._h[k] = String(o[k]); } return this; };
  CP.userAgent = function (v) { return this.header('User-Agent', v); };
  CP.referrer = function (v) { return this.header('Referer', v); };
  CP.cookie = function (k, v) { this._h.Cookie = (this._h.Cookie ? this._h.Cookie + '; ' : '') + k + '=' + v; return this; };
  CP.cookies = function (o) { for (var k in o) { this.cookie(k, o[k]); } return this; };
  CP.method = function (m) { this._method = String(m && m.name ? m.name() : m).toUpperCase(); return this; };
  CP.requestBody = function (b) { this._body = String(b); return this; };
  CP.data = function (k, v) {
    if (typeof k === 'object') { for (var x in k) { this._data.push(encodeURIComponent(x) + '=' + encodeURIComponent(k[x])); } }
    else if (arguments.length > 1) { this._data.push(encodeURIComponent(k) + '=' + encodeURIComponent(v)); }
    return this;
  };
  CP.execute = function () {
    var url = this._url, body = this._body, data = this._data.join('&');
    if (this._method === 'GET' && data) { url += (url.indexOf('?') < 0 ? '?' : '&') + data; }
    if (this._method !== 'GET' && body === null) { body = data; }
    var r = fetch(url, this._h, this._method, body), fin = (r.url && r.url()) || url;
    return {
      body: function () { var b = r.body(); return b == null ? '' : String(b); },
      statusCode: function () { return r.statusCode ? r.statusCode() : 200; },
      statusMessage: function () { return 'OK'; },
      url: function () { return fin; },
      header: function (n) { return r.header ? r.header(n) : null; },
      headers: function () { return r.headers ? r.headers() : {}; },
      cookies: function () { return r.cookies ? r.cookies() : {}; },
      contentType: function () { return (r.header && r.header('Content-Type')) || 'text/html'; },
      charset: function () { return 'UTF-8'; },
      parse: function () { return parseInternal(this.body(), fin, false); }
    };
  };
  CP.get = function () { this._method = 'GET'; return this.execute().parse(); };
  CP.post = function () { this._method = 'POST'; return this.execute().parse(); };

  var Jsoup = {
    parse: function (html, base) { return parseInternal(html, base == null ? '' : String(base), false); },
    parseBodyFragment: function (html, base) { return parseInternal(html, base == null ? '' : String(base), true); },
    connect: function (url) { return new Connection(url); },
  };
  return { Jsoup: Jsoup, Document: Document, Element: Element, Elements: Elements, TextNode: TextNode, Comment: Comment, Attribute: Attribute, resolveUrl: resolveUrl };
}
`;

// ../harmony-legado/entry/src/main/ets/common/utils/JsEngine.ets
var JsScope = class {
  constructor() {
    this.source = null;
    this.baseUrl = "";
    this.result = null;
    this.src = "";
    this.key = "";
    this.page = 1;
    this.title = "";
    this.book = null;
    this.chapter = null;
    // result 是否为 HTML 元素（prelude 中转为 jsoup Element）
    this.resultIsNode = false;
  }
};
var JsValue = class {
  constructor() {
    this.t = "null";
    this.v = null;
  }
  asString() {
    if (this.v === null || this.v === void 0) {
      return "";
    }
    return typeof this.v === "string" ? this.v : JSON.stringify(this.v);
  }
};
var memVars = /* @__PURE__ */ new Map();
var varPrefs = null;
var varPrefsUnavailable = false;
function persistentVars() {
  if (varPrefs === null && !varPrefsUnavailable) {
    try {
      varPrefs = preferences.getPreferencesSync(AppUtil.getContext(), { name: "book_source_variables" });
    } catch (e) {
      varPrefsUnavailable = true;
    }
  }
  return varPrefs;
}
var VarStore = class {
  get(key) {
    const v = memVars.get(key);
    if (v !== void 0) {
      return v;
    }
    const stored = persistentVars()?.getSync(key, "");
    if (stored) {
      memVars.set(key, stored);
      return stored;
    }
    return void 0;
  }
  set(key, value) {
    memVars.set(key, value);
    const store2 = persistentVars();
    if (store2 !== null && key.length < 1e3) {
      store2.putSync(key, value);
      store2.flush().catch(() => {
      });
    }
  }
};
var varStore = new VarStore();
function varKey(scope, kind, key) {
  let owner = "";
  if (kind === "book") {
    owner = `${scope.book?.["bookUrl"] ?? ""}`;
  } else if (kind === "chapter") {
    owner = `${scope.chapter?.["url"] ?? ""}`;
  } else if (kind === "source") {
    owner = scope.source?.bookSourceUrl ?? "";
  }
  return `${kind}${owner}${key}`;
}
function getVariable(source, key) {
  return varStore.get(`source${source?.bookSourceUrl ?? ""}${key}`) ?? "";
}
function putVariable(source, key, value) {
  varStore.set(`source${source?.bookSourceUrl ?? ""}${key}`, value);
}
function utf8Bytes(s) {
  return new util.TextEncoder().encodeInto(s);
}
function b64ToBytes(s) {
  return s ? new util.Base64Helper().decodeSync(s) : new Uint8Array(0);
}
function bytesToB64(b) {
  return new util.Base64Helper().encodeToStringSync(b);
}
function bytesToHex(b) {
  let out = "";
  b.forEach((v) => {
    out += (v < 16 ? "0" : "") + v.toString(16);
  });
  return out;
}
function digest(alg, text) {
  return digestBytes(alg, utf8Bytes(text));
}
function digestBytes(alg, data) {
  const md = cryptoFramework.createMd(alg);
  md.updateSync({ data });
  return md.digestSync().data;
}
function normalizeHashAlg(alg) {
  return (alg || "MD5").toUpperCase().replace("-", "");
}
function hmac(text, alg, key) {
  const generator = cryptoFramework.createSymKeyGenerator("HMAC");
  const symKey = generator.convertKeySync({ data: utf8Bytes(key) });
  const mac = cryptoFramework.createMac(normalizeHashAlg(alg).replace("HMAC", ""));
  mac.initSync(symKey);
  mac.updateSync({ data: utf8Bytes(text) });
  return mac.doFinalSync().data;
}
function symmetric(mode, transformation, key, iv, data) {
  const parts = transformation.split("/");
  const alg = parts[0].toUpperCase();
  const block = (parts[1] ?? "ECB").toUpperCase();
  let padding = (parts[2] ?? "PKCS5Padding").toUpperCase();
  padding = padding.startsWith("NO") ? "NoPadding" : "PKCS7";
  let keyAlg = "";
  if (alg === "AES") {
    keyAlg = `AES${key.length * 8}`;
  } else if (alg === "DESEDE" || alg === "3DES") {
    keyAlg = "3DES192";
  } else {
    throw new Error(`\u4E0D\u652F\u6301\u7684\u52A0\u5BC6\u7B97\u6CD5\uFF1A${transformation}`);
  }
  const symKey = cryptoFramework.createSymKeyGenerator(keyAlg).convertKeySync({ data: key });
  const cipher = cryptoFramework.createCipher(`${keyAlg}|${block}|${padding}`);
  const opMode = mode === "encrypt" ? cryptoFramework.CryptoMode.ENCRYPT_MODE : cryptoFramework.CryptoMode.DECRYPT_MODE;
  if (block === "ECB") {
    cipher.initSync(opMode, symKey, null);
  } else {
    const ivSpec = { algName: "IvParamsSpec", iv: { data: iv } };
    cipher.initSync(opMode, symKey, ivSpec);
  }
  return cipher.doFinalSync({ data }).data;
}
var ResponseJson = class {
  constructor() {
    this.body = "";
    this.code = 0;
    this.url = "";
    this.headers = {};
  }
};
function toResponseJson(r) {
  const out = new ResponseJson();
  out.body = r.body;
  out.code = r.code;
  out.url = r.url;
  out.headers = r.headers;
  return out;
}
async function request(scope, raw) {
  return fetchSpec(buildRequest(raw, scope.baseUrl, scope.source, await resolveJsHeader(scope.source)));
}
async function dispatch(scope, method, args) {
  const s = (i) => {
    const v = args[i];
    return v === null || v === void 0 ? "" : `${v}`;
  };
  switch (method) {
    case "ajax": {
      try {
        return (await request(scope, s(0))).body;
      } catch (e) {
        return `${e?.message ?? e}`;
      }
    }
    case "connect":
      return toResponseJson(await request(scope, s(0)));
    case "http": {
      const spec = buildRequest(s(1), scope.baseUrl, scope.source, await resolveJsHeader(scope.source));
      spec.method = s(0);
      spec.body = s(2);
      const headers = args[3];
      if (headers) {
        Object.keys(headers).forEach((k) => spec.headers[k] = `${headers[k]}`);
      }
      return toResponseJson(await fetchSpec(spec));
    }
    case "put":
      varStore.set(varKey(scope, "source", s(0)), s(1));
      return null;
    case "get":
      return varStore.get(varKey(scope, "source", s(0))) ?? "";
    case "var.get":
      return varStore.get(varKey(scope, s(0), s(1))) ?? null;
    case "var.put":
      varStore.set(varKey(scope, s(0), s(1)), s(2));
      return null;
    case "md5":
      return bytesToHex(digest("MD5", s(0)));
    case "digest":
      return bytesToHex(digest(normalizeHashAlg(s(1)), s(0)));
    case "hmac": {
      const out = hmac(s(0), s(1), s(2));
      return s(3) === "base64" ? bytesToB64(out) : bytesToHex(out);
    }
    case "crypto.symmetric":
      return bytesToB64(symmetric(s(0), s(1), b64ToBytes(s(2)), b64ToBytes(s(3)), b64ToBytes(s(4))));
    case "log":
      console.info("[\u4E66\u6E90JS] " + s(0));
      return null;
    case "toast":
      showMessage(s(0));
      return null;
    case "cookie.get":
      return args[1] === null || args[1] === void 0 ? getCookie(s(0)) : getCookieKey(s(0), s(1));
    case "cookie.set":
      setCookie(s(0), s(1));
      return null;
    case "cookie.replace":
      replaceCookie(s(0), s(1));
      return null;
    case "cookie.remove":
      removeCookie(s(0));
      return null;
    case "sleep":
      await new Promise((resolve) => setTimeout(resolve, Math.min(Math.max(Number(args[0]) || 0, 0), 1e4)));
      return null;
    case "digest.bytes":
      return bytesToB64(digestBytes(normalizeHashAlg(s(0)), b64ToBytes(s(1))));
    default:
      if (method.startsWith("rule.") && scope.ruleHost) {
        return scope.ruleHost(method, args);
      }
      throw new Error(`\u6682\u4E0D\u652F\u6301\u7684\u4E66\u6E90\u51FD\u6570\uFF1A${method}`);
  }
}
function uses(script, jsLib, name) {
  const re = new RegExp(`\\b${name}\\b`);
  return re.test(script) || re.test(jsLib);
}
function bindingsOf(scope, script) {
  const source = scope.source;
  const jsLib = source?.jsLib ?? "";
  const needResult = uses(script, jsLib, "result");
  const bindings = {
    "result": needResult ? scope.result : null,
    "baseUrl": scope.baseUrl,
    "src": uses(script, jsLib, "src") ? scope.src : null,
    "key": scope.key,
    "page": scope.page,
    "title": scope.title,
    "book": scope.book,
    "chapter": scope.chapter,
    "resultIsNode": needResult && scope.resultIsNode
  };
  const json = JSON.stringify(bindings);
  if (!source) {
    return json;
  }
  return `${json.slice(0, -1)},"source":${sourceJson(source)}}`;
}
var sourceJsonCache = /* @__PURE__ */ new Map();
function sourceJson(source) {
  const key = `${source.bookSourceUrl}@${source.lastUpdateTime ?? 0}`;
  let json = sourceJsonCache.get(key);
  if (json === void 0) {
    const lib = source.jsLib;
    source.jsLib = "";
    json = JSON.stringify(source);
    source.jsLib = lib;
    if (sourceJsonCache.size > 64) {
      sourceJsonCache.clear();
    }
    sourceJsonCache.set(key, json);
  }
  return json;
}
var BASE_PRELUDE = JS_JSOUP + "\n;\n" + JS_PRELUDE;
async function evalJs(script, scope) {
  let prelude = BASE_PRELUDE;
  const jsLib = scope.source?.jsLib ?? "";
  if (jsLib.trim() && !jsLib.trim().startsWith("{")) {
    prelude = BASE_PRELUDE + "\n;\n" + jsLib;
  }
  const host = (method, argsJson) => {
    const args = JSON.parse(argsJson || "[]");
    return dispatch(scope, method, args).then((v) => {
      return v === null || v === void 0 ? "" : JSON.stringify(v);
    });
  };
  try {
    const wrapped = `(function () { return eval(${JSON.stringify(script)}); })()`;
    const raw = await evaluate(prelude, wrapped, bindingsOf(scope, script), host);
    const env = JSON.parse(raw);
    const out = new JsValue();
    out.t = env.t;
    out.v = env.v ?? null;
    return out;
  } catch (e) {
    const msg = `${e?.message ?? e}`;
    console.warn(`\u4E66\u6E90JS\u6267\u884C\u5931\u8D25\uFF1A${msg.slice(0, 500)}
\u811A\u672C\uFF1A${script.slice(0, 200)}`);
    throw new Error(msg);
  }
}
setHeaderJsEvaluator(async (source) => {
  const raw = (source.header ?? "").trim();
  const code = raw.startsWith("@js:") ? raw.slice(4) : raw.replace(/^<js>/i, "").replace(/<\/js>$/i, "");
  const scope = new JsScope();
  scope.source = source;
  scope.baseUrl = source.bookSourceUrl;
  return (await evalJs(code, scope)).asString();
});

// ../harmony-legado/entry/src/main/ets/common/utils/RuleRunner.ets
var JS_MARK = /<js>|@js:|\{\{|@get:\{|@put:\{/i;
function needsAsync(rule) {
  return !!rule && JS_MARK.test(rule);
}
var RuleContext = class {
  constructor(content, baseUrl, source) {
    this.key = "";
    this.page = 1;
    this.book = null;
    this.chapter = null;
    this.source = source;
    this.baseUrl = baseUrl || sourceBaseUrl(source);
    this.analyze = new AnalyzeSource(content, this.baseUrl);
  }
};
var ROOT = 0;
var NODE = 1;
var JSON_OBJ = 2;
var STR = 3;
var LIST = 4;
var RVal = class _RVal {
  constructor() {
    this.kind = ROOT;
    this.obj = null;
    this.s = "";
    this.list = [];
  }
  static of(item) {
    const v = new _RVal();
    if (item === null || item === void 0) {
      v.kind = ROOT;
    } else if (item instanceof HtmlNode) {
      v.kind = NODE;
      v.obj = item;
    } else if (typeof item === "string") {
      v.kind = STR;
      v.s = item;
    } else {
      v.kind = JSON_OBJ;
      v.obj = item;
    }
    return v;
  }
  static str(s) {
    const v = new _RVal();
    v.kind = STR;
    v.s = s;
    return v;
  }
  static ofList(list) {
    const v = new _RVal();
    v.kind = LIST;
    v.list = list;
    return v;
  }
};
var Seg = class {
  constructor(js, text) {
    // JS 段后的 ## 替换规则（开源阅读对 JS 结果同样应用 ## 替换）
    this.filter = "";
    this.js = js;
    this.text = text;
    if (js) {
      const idx = text.indexOf("##");
      if (idx >= 0) {
        this.text = text.slice(0, idx);
        this.filter = text.slice(idx + 2);
      }
    }
  }
};
function splitJs(rule) {
  const segs = [];
  const lower = rule.toLowerCase();
  let i = 0;
  while (i < rule.length) {
    const tag = lower.indexOf("<js>", i);
    const at = lower.indexOf("@js:", i);
    if (at >= 0 && (tag < 0 || at < tag)) {
      segs.push(new Seg(false, rule.slice(i, at)));
      segs.push(new Seg(true, rule.slice(at + 4)));
      break;
    }
    if (tag >= 0) {
      segs.push(new Seg(false, rule.slice(i, tag)));
      let end = lower.indexOf("</js>", tag + 4);
      if (end < 0) {
        end = rule.length;
      }
      segs.push(new Seg(true, rule.slice(tag + 4, end)));
      i = end + 5;
      continue;
    }
    segs.push(new Seg(false, rule.slice(i)));
    break;
  }
  return segs.filter((s) => s.js || s.text.trim().length > 0);
}
function toJsResult(ctx, v) {
  switch (v.kind) {
    case ROOT:
      return ctx.analyze.content;
    case NODE:
      return outerHtml(v.obj);
    case JSON_OBJ:
      return v.obj;
    case LIST:
      return v.list.map((o) => o instanceof HtmlNode ? outerHtml(o) : o);
    default:
      return v.s;
  }
}
function fromJs(r) {
  if (r.t === "j" && r.v !== null) {
    if (Array.isArray(r.v)) {
      return RVal.ofList(r.v);
    }
    return RVal.of(r.v);
  }
  return RVal.str(r.t === "null" ? "" : r.asString());
}
function scopeOf(ctx, result, v) {
  const scope = new JsScope();
  scope.resultIsNode = v !== void 0 && v.kind === NODE;
  scope.source = ctx.source;
  scope.baseUrl = ctx.baseUrl;
  scope.result = result;
  scope.src = ctx.analyze.content;
  scope.key = ctx.key;
  scope.page = ctx.page;
  scope.book = ctx.book;
  scope.chapter = ctx.chapter;
  scope.ruleHost = (method, args) => ruleHost(ctx, method, args);
  return scope;
}
async function ruleHost(ctx, method, args) {
  const rule = `${args[0] ?? ""}`;
  const content = args[1];
  let target = ctx;
  if (method === "rule.setContent") {
    ctx.analyze = new AnalyzeSource(rule, args[1] ? `${args[1]}` : ctx.baseUrl);
    return null;
  }
  if (content !== null && content !== void 0 && `${content}`.length > 0) {
    target = new RuleContext(`${content}`, ctx.baseUrl, ctx.source);
    target.key = ctx.key;
    target.page = ctx.page;
  }
  if (method === "rule.getString") {
    return ruleString(target, null, rule);
  }
  const list = await ruleList(target, null, rule);
  return list.map((o) => {
    if (o instanceof HtmlNode) {
      return method === "rule.getElements" ? outerHtml(o) : o.innerText().trim();
    }
    return typeof o === "string" ? o : JSON.stringify(o);
  });
}
function isRuleExpr(expr) {
  return expr.startsWith("@") || expr.startsWith("$.") || expr.startsWith("$[") || expr.startsWith("//");
}
async function fillTemplate(ctx, v, text) {
  const re = /@get:\{([^}]+?)\}|\{\{([\s\S]*?)\}\}/g;
  let out = "";
  let last = 0;
  let m = re.exec(text);
  while (m !== null) {
    out += text.slice(last, m.index);
    last = m.index + m[0].length;
    if (m[1] !== void 0) {
      out += getVariable(ctx.source, m[1].trim());
    } else {
      const expr = (m[2] ?? "").trim();
      if (expr === "page") {
        out += `${ctx.page}`;
      } else if (expr === "key") {
        out += ctx.key;
      } else if (isRuleExpr(expr)) {
        out += await runString(ctx, v, expr.startsWith("@@") ? expr.slice(2) : expr);
      } else {
        out += (await evalJs(expr, scopeOf(ctx, toJsResult(ctx, v), v))).asString();
      }
    }
    m = re.exec(text);
  }
  return out + text.slice(last);
}
function parsePutMap(text) {
  const obj = parseLooseJson(text);
  if (obj !== null && typeof obj === "object") {
    const rec = obj;
    return Object.keys(rec).map((k) => [k, `${rec[k]}`]);
  }
  const out = [];
  text.trim().replace(/^\{|\}$/g, "").split(",").forEach((part) => {
    const idx = part.indexOf(":");
    if (idx > 0) {
      const unquote = (x) => x.trim().replace(/^["']|["']$/g, "");
      out.push([unquote(part.slice(0, idx)), unquote(part.slice(idx + 1))]);
    }
  });
  return out;
}
async function applyPut(ctx, v, rule) {
  const re = /@put:(\{[^}]+?\})/gi;
  let m = re.exec(rule);
  while (m !== null) {
    for (const pair of parsePutMap(m[1])) {
      putVariable(ctx.source, pair[0], await runString(ctx, v, pair[1]));
    }
    m = re.exec(rule);
  }
  return rule.replace(/@put:\{[^}]+?\}/gi, "");
}
function applyRule(ctx, v, rule, asList) {
  switch (v.kind) {
    case ROOT:
      return asList ? RVal.ofList(ctx.analyze.list(rule)) : RVal.str(ctx.analyze.str(null, rule));
    case NODE:
      return asList ? RVal.ofList(pickList(v.obj, null, rule)) : RVal.str(pickStr(v.obj, rule));
    case JSON_OBJ:
      return asList ? RVal.ofList(pickList(null, v.obj, rule)) : RVal.str(pickStr(v.obj, rule));
    case LIST: {
      if (asList) {
        const out = [];
        v.list.forEach((o) => {
          const found = o instanceof HtmlNode ? pickList(o, null, rule) : pickList(null, o, rule);
          found.forEach((f) => out.push(f));
        });
        return RVal.ofList(out);
      }
      return RVal.str(v.list.map((o) => pickStr(o, rule)).filter((s) => s.length > 0).join("\n"));
    }
    default: {
      const src = new AnalyzeSource(v.s, ctx.baseUrl);
      return asList ? RVal.ofList(src.list(rule)) : RVal.str(src.str(null, rule));
    }
  }
}
async function run(ctx, start, rule, asList) {
  let v = start;
  const body = await applyPut(ctx, v, rule);
  for (const seg of splitJs(body)) {
    if (seg.js) {
      const code = await fillTemplate(ctx, v, seg.text);
      v = fromJs(await evalJs(code, scopeOf(ctx, toJsResult(ctx, v), v)));
      if (seg.filter) {
        v = RVal.str(applyFilter(v.kind === STR ? v.s : await runString(ctx, v, ""), seg.filter));
      }
    } else {
      const text = seg.text.trim();
      if (/\{\{|@get:\{/i.test(text)) {
        v = RVal.str(await fillTemplate(ctx, v, text));
      } else {
        v = applyRule(ctx, v, text, asList);
      }
    }
  }
  return v;
}
async function runString(ctx, v, rule) {
  const r = await run(ctx, v, rule, false);
  switch (r.kind) {
    case STR:
      return r.s.trim();
    case LIST:
      return r.list.map((o) => o instanceof HtmlNode ? o.innerText().trim() : typeof o === "string" ? o : JSON.stringify(o)).join("\n");
    case NODE:
      return r.obj.innerText().trim();
    case JSON_OBJ:
      return JSON.stringify(r.obj);
    default:
      return ctx.analyze.content;
  }
}
async function ruleString(ctx, item, rule) {
  const r = (rule ?? "").trim();
  if (!r) {
    return "";
  }
  if (!needsAsync(r)) {
    return ctx.analyze.str(item, r);
  }
  return runString(ctx, RVal.of(item), r);
}
async function ruleStringSafe(ctx, item, rule) {
  try {
    return await ruleString(ctx, item, rule);
  } catch (e) {
    console.warn(`\u89C4\u5219\u53D6\u503C\u5931\u8D25\uFF08\u5DF2\u5FFD\u7565\uFF09\uFF1A${e?.message ?? e}`);
    return "";
  }
}
async function ruleList(ctx, item, rule) {
  const r = (rule ?? "").trim();
  if (!r) {
    return [];
  }
  if (!needsAsync(r)) {
    return item === null ? ctx.analyze.list(r) : applyRule(ctx, RVal.of(item), r, true).list;
  }
  const v = await run(ctx, RVal.of(item), r, true);
  switch (v.kind) {
    case LIST:
      return v.list.map((o) => {
        if (typeof o === "string" && /^\s*[\[{]/.test(o)) {
          const parsed = parseLooseJson(o);
          return parsed !== null && typeof parsed === "object" ? parsed : o;
        }
        return o;
      });
    case NODE:
    case JSON_OBJ:
      return v.obj !== null ? [v.obj] : [];
    case STR: {
      const parsed = parseLooseJson(v.s);
      return Array.isArray(parsed) ? parsed : [];
    }
    default:
      return [];
  }
}
async function ruleInit(ctx, rule) {
  const r = (rule ?? "").trim();
  if (!r) {
    return null;
  }
  const v = await run(ctx, RVal.of(null), r, true);
  switch (v.kind) {
    case LIST:
      return v.list.length > 0 ? v.list[0] : null;
    case NODE:
    case JSON_OBJ:
      return v.obj;
    case STR: {
      const parsed = parseLooseJson(v.s);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
      ctx.analyze = new AnalyzeSource(v.s, ctx.baseUrl);
      return null;
    }
    default:
      return null;
  }
}
async function evalUrl(ctx, rawUrl) {
  let url = (rawUrl ?? "").trim();
  if (/<js>|@js:/i.test(url)) {
    let result = "";
    for (const seg of splitJs(url)) {
      if (seg.js) {
        result = (await evalJs(seg.text, scopeOf(ctx, result))).asString();
      } else {
        result = seg.text.trim().replace("@result", result);
      }
    }
    url = result.trim();
  }
  url = url.replace(/<([^<>]*,[^<>]*)>/g, (_, inner) => {
    const pages = inner.split(",");
    return pages[Math.min(Math.max(ctx.page, 1), pages.length) - 1].trim();
  });
  if (/\{\{|@get:\{/.test(url)) {
    url = await fillTemplate(ctx, RVal.str(url), url);
  }
  return url;
}

// ../harmony-legado/entry/src/main/ets/common/utils/OnlineBookSource.ets
var ExploredBook = class {
  constructor() {
    this.name = "";
    this.author = "";
    this.intro = "";
    this.kind = "";
    this.wordCount = "";
    this.lastChapter = "";
    this.bookUrl = "";
    this.coverUrl = "";
  }
};
async function loadSource(bookSourceUrl) {
  return stub_default.getCachedSource(bookSourceUrl);
}
async function parseExploreUrl(source) {
  let raw = (source.exploreUrl ?? "").trim();
  if (!raw) {
    return [];
  }
  if (/^(@js:|<js>)/i.test(raw)) {
    raw = (await evalUrl(new RuleContext("", sourceBaseUrl(source), source), raw)).trim();
  }
  if (raw.startsWith("[")) {
    const parsed = parseLooseJson(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((o) => !!o && typeof o.title === "string");
    }
  }
  const items = [];
  raw.split(/&&|\n/).forEach((line) => {
    const l = line.trim();
    if (!l) {
      return;
    }
    const sep = l.indexOf("::");
    const item = sep >= 0 ? { title: l.slice(0, sep).trim(), url: l.slice(sep + 2).trim() } : { title: l, url: "" };
    items.push(item);
  });
  return items;
}
async function exploreBooks(bookSourceUrl, rule, rawUrl, page, pageSize, src) {
  const source = src ?? await loadSource(bookSourceUrl);
  if (!rule || !rule.bookList) {
    return [];
  }
  const urlCtx = new RuleContext("", sourceBaseUrl(source), source);
  urlCtx.page = page;
  const reqUrl = await evalUrl(urlCtx, rawUrl);
  let content = "";
  let pageUrl = absoluteRuleUrl(urlCtx.baseUrl, reqUrl);
  try {
    const res = await fetchUrl(reqUrl, urlCtx.baseUrl, source);
    content = res.body;
    pageUrl = res.url;
  } catch (e) {
    if (!needsAsync(rule.bookList)) {
      throw new Error(`\u53D1\u73B0\u9875\u8BF7\u6C42\u5931\u8D25\uFF1A${e?.message ?? e}`);
    }
  }
  const ctx = new RuleContext(content, pageUrl, source);
  ctx.page = page;
  const items = (await ruleList(ctx, null, rule.bookList)).slice(0, pageSize > 0 ? pageSize : 100);
  const out = [];
  for (const it of items) {
    const b = new ExploredBook();
    b.name = await ruleString(ctx, it, rule.name);
    if (!b.name) {
      continue;
    }
    b.author = await ruleStringSafe(ctx, it, rule.author);
    b.intro = htmlToPlain(await ruleStringSafe(ctx, it, rule.intro));
    b.kind = await ruleStringSafe(ctx, it, rule.kind);
    b.wordCount = await ruleStringSafe(ctx, it, rule.wordCount);
    b.lastChapter = await ruleStringSafe(ctx, it, rule.lastChapter);
    const rawUrl2 = await ruleString(ctx, it, rule.bookUrl);
    b.bookUrl = rawUrl2 ? absoluteRuleUrl(pageUrl, rawUrl2) : "";
    const rawCover = await ruleStringSafe(ctx, it, rule.coverUrl);
    b.coverUrl = rawCover ? absoluteRuleUrl(pageUrl, rawCover) : "";
    out.push(b);
  }
  return out;
}
async function searchBooks(source, key, page) {
  const rule = source.ruleSearch;
  if (!rule || !rule.bookList || !source.searchUrl) {
    return [];
  }
  const urlCtx = new RuleContext("", sourceBaseUrl(source), source);
  urlCtx.key = key;
  urlCtx.page = page;
  const reqUrl = await evalUrl(urlCtx, source.searchUrl);
  const res = await fetchUrl(reqUrl, urlCtx.baseUrl, source);
  const ctx = new RuleContext(res.body, res.url, source);
  ctx.key = key;
  ctx.page = page;
  const items = await ruleList(ctx, null, rule.bookList);
  const books = [];
  for (const it of items) {
    const book = new SearchBook();
    book.name = await ruleString(ctx, it, rule.name);
    const bookUrl = await ruleString(ctx, it, rule.bookUrl);
    if (!book.name || !bookUrl) {
      continue;
    }
    book.bookUrl = absoluteRuleUrl(res.url, bookUrl);
    book.tocUrl = book.bookUrl;
    book.author = await ruleStringSafe(ctx, it, rule.author);
    book.intro = htmlToPlain(await ruleStringSafe(ctx, it, rule.intro));
    book.kind = await ruleStringSafe(ctx, it, rule.kind);
    book.wordCount = await ruleStringSafe(ctx, it, rule.wordCount);
    book.latestChapterTitle = await ruleStringSafe(ctx, it, rule.lastChapter);
    const cover = await ruleStringSafe(ctx, it, rule.coverUrl);
    book.coverUrl = cover ? absoluteRuleUrl(res.url, cover) : "";
    book.origin = source.bookSourceUrl;
    book.originName = source.bookSourceName;
    book.bookType = source.bookSourceType;
    book.source = source;
    books.push(book);
  }
  return books;
}

// ../harmony-legado/entry/src/main/ets/common/utils/OnlineReader.ets
var OnlineChapter = class {
  constructor() {
    this.title = "";
    this.url = "";
    this.index = 0;
  }
};
var OnlineBookInfo = class {
  constructor() {
    this.name = "";
    this.author = "";
    this.intro = "";
    this.kind = "";
    this.coverUrl = "";
    this.wordCount = "";
    this.lastChapter = "";
    this.tocUrl = "";
  }
};
function md5Hex(text) {
  const md = cryptoFramework.createMd("MD5");
  md.updateSync({ data: new util.TextEncoder().encodeInto(text) });
  let out = "";
  md.digestSync().data.forEach((v) => {
    out += (v < 16 ? "0" : "") + v.toString(16);
  });
  return out;
}
function cacheDir(bookUrl) {
  const dir = `${AppUtil.getContext().filesDir}/online/${md5Hex(bookUrl)}`;
  if (!fileIo.accessSync(dir)) {
    fileIo.mkdirSync(dir, true);
  }
  return dir;
}
function readText(path2) {
  try {
    return fileIo.accessSync(path2) ? fileIo.readTextSync(path2) : "";
  } catch (e) {
    return "";
  }
}
function writeText(path2, text) {
  try {
    const file = fileIo.openSync(path2, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC);
    fileIo.writeSync(file.fd, text);
    fileIo.closeSync(file);
  } catch (e) {
    console.warn("\u5728\u7EBF\u4E66\u7C4D\u7F13\u5B58\u5199\u5165\u5931\u8D25\uFF1A" + path2);
  }
}
function saveToc(bookUrl, chapters) {
  writeText(`${cacheDir(bookUrl)}/toc.json`, JSON.stringify(chapters));
}
function bookBinding(book, tocUrl) {
  return {
    "bookUrl": book.bookUrl ?? "",
    "tocUrl": tocUrl,
    "name": book.bookName,
    "author": book.author,
    "origin": book.origin ?? "",
    "intro": book.intro ?? ""
  };
}
function htmlToText(html) {
  return html.replace(/\r/g, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|h\d)>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&amp;/gi, "&");
}
async function applyReplaceRegex(ctx, text, rule) {
  const r = (rule ?? "").trim();
  if (!r) {
    return text;
  }
  if (needsAsync(r)) {
    return ruleString(ctx, text, r);
  }
  const parts = r.replace(/^##/, "").split("##");
  let out = text;
  for (let i = 0; i < parts.length; i += 2) {
    const pattern = parts[i];
    if (!pattern) {
      continue;
    }
    const repl = (parts[i + 1] ?? "").replace(/#$/, "");
    try {
      out = out.replace(new RegExp(pattern, "g"), repl);
    } catch (e) {
      console.warn("\u6B63\u6587\u66FF\u6362\u89C4\u5219\u65E0\u6548\uFF1A" + pattern);
    }
  }
  return out;
}
async function fetchBookInfo(source, book) {
  const info = new OnlineBookInfo();
  const bookUrl = book.bookUrl ?? "";
  const res = await fetchUrl(bookUrl, sourceBaseUrl(source), source);
  const rule = source.ruleBookInfo;
  info.tocUrl = bookUrl;
  if (!rule) {
    return [info, res.body];
  }
  const ctx = new RuleContext(res.body, res.url, source);
  ctx.book = bookBinding(book, bookUrl);
  const item = rule.init ? await ruleInit(ctx, rule.init) : null;
  info.name = await ruleStringSafe(ctx, item, rule.name);
  info.author = await ruleStringSafe(ctx, item, rule.author);
  info.intro = htmlToPlain(await ruleStringSafe(ctx, item, rule.intro));
  info.kind = await ruleStringSafe(ctx, item, rule.kind);
  info.wordCount = await ruleStringSafe(ctx, item, rule.wordCount);
  info.lastChapter = await ruleStringSafe(ctx, item, rule.lastChapter);
  const cover = await ruleStringSafe(ctx, item, rule.coverUrl);
  info.coverUrl = cover ? absoluteRuleUrl(res.url, cover) : "";
  const toc = await ruleString(ctx, item, rule.tocUrl);
  info.tocUrl = toc ? absoluteRuleUrl(res.url, toc) : bookUrl;
  return [info, res.body];
}
async function fetchChapterList(source, book, tocUrl, firstPage, useCache = true) {
  const rule = source.ruleToc;
  if (!rule || !rule.chapterList) {
    throw new Error("\u4E66\u6E90\u7F3A\u5C11\u76EE\u5F55\u89C4\u5219");
  }
  let listRule = rule.chapterList.trim();
  let reverse = false;
  if (listRule.startsWith("-")) {
    reverse = true;
    listRule = listRule.slice(1);
  } else if (listRule.startsWith("+")) {
    listRule = listRule.slice(1);
  }
  const chapters = [];
  const queue = [tocUrl];
  const visited = /* @__PURE__ */ new Set();
  while (queue.length > 0 && visited.size < 100) {
    const url = queue.shift();
    if (visited.has(url)) {
      continue;
    }
    visited.add(url);
    let body = "";
    let pageUrl = url;
    if (visited.size === 1 && firstPage !== void 0 && url === book.bookUrl) {
      body = firstPage;
    } else {
      const res = await fetchUrl(url, sourceBaseUrl(source), source);
      body = res.body;
      pageUrl = res.url;
    }
    const ctx = new RuleContext(body, pageUrl, source);
    ctx.book = bookBinding(book, tocUrl);
    const items = await ruleList(ctx, null, listRule);
    for (const it of items) {
      const title = (await ruleString(ctx, it, rule.chapterName)).replace(/\s+/g, " ").trim();
      if (!title) {
        continue;
      }
      const raw = await ruleString(ctx, it, rule.chapterUrl);
      const chapter = new OnlineChapter();
      chapter.title = title;
      chapter.url = raw ? absoluteRuleUrl(pageUrl, raw) : pageUrl;
      chapters.push(chapter);
    }
    if (rule.nextTocUrl) {
      const next = await ruleString(ctx, null, rule.nextTocUrl);
      next.split("\n").map((u) => u.trim()).filter((u) => u.length > 0).forEach((u) => queue.push(absoluteRuleUrl(pageUrl, u)));
    }
  }
  if (reverse) {
    chapters.reverse();
  }
  chapters.forEach((c, i) => c.index = i);
  if (chapters.length > 0 && useCache) {
    saveToc(book.bookUrl ?? "", chapters);
  }
  return chapters;
}
async function fetchChapterContent(source, book, chapters, index, useCache = true) {
  const chapter = chapters[index];
  const cachePath = useCache ? `${cacheDir(book.bookUrl ?? "")}/${index}.txt` : "";
  const cached = useCache ? readText(cachePath) : "";
  if (cached) {
    return cached;
  }
  const rule = source.ruleContent;
  if (!rule || !rule.content) {
    throw new Error("\u4E66\u6E90\u7F3A\u5C11\u6B63\u6587\u89C4\u5219");
  }
  const nextChapterUrl = index + 1 < chapters.length ? chapters[index + 1].url : "";
  let url = chapter.url;
  let merged = "";
  const visited = /* @__PURE__ */ new Set();
  let lastCtx = null;
  while (url && !visited.has(url) && visited.size < 20) {
    visited.add(url);
    const res = await fetchUrl(url, sourceBaseUrl(source), source);
    const ctx = new RuleContext(res.body, res.url, source);
    ctx.book = bookBinding(book, book.toUrl ?? "");
    ctx.chapter = { "url": chapter.url, "title": chapter.title, "index": index };
    lastCtx = ctx;
    const text = htmlToText(await ruleString(ctx, null, rule.content)).trim();
    if (text) {
      merged += (merged ? "\n" : "") + text;
    }
    if (!rule.nextContentUrl) {
      break;
    }
    const next = (await ruleString(ctx, null, rule.nextContentUrl)).split("\n")[0].trim();
    url = next ? absoluteRuleUrl(res.url, next) : "";
    if (url && url === nextChapterUrl) {
      break;
    }
  }
  if (lastCtx !== null) {
    merged = await applyReplaceRegex(lastCtx, merged, rule.replaceRegex);
  }
  merged = merged.split("\n").map((l) => l.trim()).filter((l) => l.length > 0).join("\n");
  if (merged && useCache) {
    writeText(cachePath, merged);
  }
  return merged;
}

// ../harmony-legado/entry/src/main/ets/database/entities/Books.ets
var Books = class {
  constructor() {
    // 书籍名称(书源获取) 或则自定义书籍名称
    this.bookName = "";
    // // 作者名称(书源获取)
    this.author = "";
    //在导入的情况下或则未分组默认为2 未分组
    this.bookGroup = 3;
    // 最新章节标题更新时间
    this.latestChapterTime = 0;
    //书籍目录总数
    this.totalChapterNum = 0;
    //当前章节索引
    this.durChapterIndex = 0;
    //当前阅读的进度(首行字符的索引位置)
    this.durChapterPos = 0;
    //本地书籍阅读的进度
    this.localBookDurChapterPos = null;
    //最近一次阅读书籍的时间(打开正文的时间)
    this.durChapterTime = 0;
    //刷新书架时更新书籍信息
    this.canUpdate = true;
    //排序
    this.sort = 0;
    //书源排序
    this.originOrder = 0;
    //同步时间
    this.syncTime = 0;
    //小说0/漫画1/有声2
    this.bookType = 0;
    //是否置顶
    this.isTop = false;
    //创建时间
    this.createTime = 0;
    //更新时间
    this.updateTime = 0;
    //是否加入书架
    this.isJoin = false;
    //是否本地导入
    this.isLocalBook = false;
    this.sourceList = [];
  }
};
Books = __decorateClass([
  Observed
], Books);
export {
  BRANDS,
  Books,
  SourceImporter,
  exploreBooks,
  fetchBookInfo,
  fetchChapterContent,
  fetchChapterList,
  fetchRepoSource,
  parseExploreUrl,
  rankRepoSources,
  searchBooks,
  searchRepoBoth,
  searchRepoSources
};
