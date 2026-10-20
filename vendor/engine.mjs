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

// shims/stub.mjs
var noop = () => Promise.resolve(null);
var dao = new Proxy({}, { get: () => noop });
var stub_default = dao;
var showMessage = () => {
};

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

// ../harmony-legado/entry/src/main/ets/common/utils/TextUtils.ets
function htmlToPlain(html) {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div)>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lrm;|&rlm;/gi, "").replace(/&amp;/gi, "&").replace(/\n{3,}/g, "\n\n").trim();
}

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

// ../harmony-legado/entry/src/main/ets/common/utils/AnalyzeUrl.ets
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
var RequestSpec = class {
  constructor() {
    this.url = "";
    this.method = "GET";
    this.body = "";
    this.headers = {};
    this.charset = "";
    this.timeout = 1e4;
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
function sourceHeaders(source) {
  const out = { "User-Agent": DEFAULT_UA };
  const raw = source?.header ?? "";
  if (raw.trim() && !raw.trim().startsWith("@js:") && !raw.trim().startsWith("<js>")) {
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
function buildRequest(raw, baseUrl, source) {
  const spec = new RequestSpec();
  const parts = splitUrlOption(raw);
  const base = baseUrl || sourceBaseUrl(source);
  spec.url = absoluteUrl(base, parts[0]);
  spec.headers = sourceHeaders(source);
  const opt = parts[1];
  if (opt !== null) {
    toHeaderRecord(opt.headers, spec.headers);
    spec.method = (opt.method ?? "GET").toUpperCase();
    if (opt.body !== void 0 && opt.body !== null) {
      spec.body = typeof opt.body === "string" ? opt.body : JSON.stringify(opt.body);
    }
    spec.charset = opt.charset ?? "";
  }
  return spec;
}
function hasHeader(headers, name) {
  const lower = name.toLowerCase();
  return Object.keys(headers).some((k) => k.toLowerCase() === lower);
}
async function fetchSpec(spec) {
  let extraData = void 0;
  if (spec.method === "POST" || spec.method === "PUT") {
    if (!hasHeader(spec.headers, "Content-Type")) {
      const b = spec.body.trim();
      spec.headers["Content-Type"] = b.startsWith("{") || b.startsWith("[") ? "application/json; charset=UTF-8" : "application/x-www-form-urlencoded";
    }
    extraData = spec.body;
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
  result.body = data ? NetworkHttp.decode(data, charset || "UTF-8") : typeof res.result === "string" ? res.result : "";
  return result;
}
async function fetchUrl(raw, baseUrl, source, timeout) {
  const spec = buildRequest(raw, baseUrl, source);
  if (timeout !== void 0) {
    spec.timeout = timeout;
  }
  return fetchSpec(spec);
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
function decodeEntities(s) {
  return s.replace(/&nbsp;/gi, " ").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&apos;/gi, "'").replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(parseInt(d, 10))).replace(/&#x([0-9a-fA-F]+);/g, (_m, d) => String.fromCharCode(parseInt(d, 16))).replace(/&amp;/gi, "&");
}
function parseAttrs(attrStr, map) {
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m = re.exec(attrStr);
  while (m) {
    const key = m[1].toLowerCase();
    const val = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
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
      const t = HtmlNode.textNode(decodeEntities(textBuf.replace(/\s+/g, " ")));
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
    const segs = filter.split("###");
    if (segs.length === 0) {
      return text;
    }
    const pattern = segs[0].replace(/^\/+|\/+$/g, "");
    const repl = segs.length > 1 ? segs[1] : "";
    if (!pattern) {
      return text;
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
  const slot = { rt, deadline: 0 };
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
async function evaluate(prelude, script, bindings, host) {
  const slot = await acquire();
  slot.deadline = Date.now() + SCRIPT_TIMEOUT_MS;
  const vm = slot.rt.newContext();
  try {
    const hostFn = vm.newAsyncifiedFunction("__host", async (m, a) => {
      const method = vm.getString(m);
      const args = vm.getString(a);
      try {
        const r = await host(method, args);
        return vm.newString(r === void 0 || r === null ? "" : `${r}`);
      } catch (e) {
        return { error: vm.newError(`${e?.message ?? e}`) };
      }
    });
    vm.setProp(vm.global, "__host", hostFn);
    hostFn.dispose();
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
    (await run2(prelude)).dispose();
    const b = vm.newString(bindings);
    call("__init", b).dispose();
    b.dispose();
    const value = await run2(script);
    const out = call("__out", value);
    value.dispose();
    const text = vm.getString(out);
    out.dispose();
    return text;
  } finally {
    vm.dispose();
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
    return a;
  }
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
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
  function bytesToUtf8(b) {
    var out = '', i = 0;
    while (i < b.length) {
      var c = b[i++] & 255;
      if (c >= 0xf0) { c = ((c & 7) << 18) | ((b[i++] & 63) << 12) | ((b[i++] & 63) << 6) | (b[i++] & 63); }
      else if (c >= 0xe0) { c = ((c & 15) << 12) | ((b[i++] & 63) << 6) | (b[i++] & 63); }
      else if (c >= 0xc0) { c = ((c & 31) << 6) | (b[i++] & 63); }
      out += String.fromCodePoint(c);
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
    tripleDESDecodeStr: function (d, key, mode, padding, iv) { return bytesToUtf8(crypt('decrypt', 'DESede/' + mode + '/' + padding, key, iv, b64ToBytes(d))); }
  };
  g.java = java;

  // Rhino \u7684 JavaImporter / Packages \u5E38\u89C1\u7528\u6CD5\u57AB\u7247\uFF1ABase64\u3001SecretKeySpec\u3001IvParameterSpec\u3001Cipher\u3001Arrays\u3001String
  function JString(x) {
    if (isBytes(x) || x instanceof Uint8Array) { return bytesToUtf8(x); }
    var s = new String(x === undefined ? '' : x);
    s.getBytes = function () { return utf8ToBytes(String(x)); };
    return s;
  }
  var javaClasses = {
    Base64: {
      getDecoder: function () { return { decode: function (s) { return b64ToBytes(isBytes(s) ? bytesToUtf8(s) : s); } }; },
      getEncoder: function () { return { encodeToString: function (b) { return bytesToB64(toBytes(b)); }, encode: function (b) { return utf8ToBytes(bytesToB64(toBytes(b))); } }; },
      getMimeDecoder: function () { return javaClasses.Base64.getDecoder(); },
      getUrlDecoder: function () { return javaClasses.Base64.getDecoder(); }
    },
    SecretKeySpec: function (bytes, alg) { return { key: toBytes(bytes), alg: alg }; },
    IvParameterSpec: function (bytes) { return { iv: toBytes(bytes) }; },
    Cipher: {
      ENCRYPT_MODE: 1, DECRYPT_MODE: 2,
      getInstance: function (t) {
        var c = { t: String(t), mode: 2, key: null, iv: null };
        c.init = function (mode, key, iv) { c.mode = mode; c.key = key.key; c.iv = iv ? iv.iv : null; };
        c.doFinal = function (data) { return crypt(c.mode === 1 ? 'encrypt' : 'decrypt', c.t, c.key, c.iv, data); };
        return c;
      }
    },
    Arrays: {
      copyOfRange: function (arr, from, to) { return markBytes(Array.prototype.slice.call(arr, from, to)); },
      toString: function (arr) { return '[' + Array.prototype.join.call(arr, ', ') + ']'; }
    },
    String: JString,
    StandardCharsets: { UTF_8: 'UTF-8' }
  };
  g.JavaImporter = function () {
    var o = {}, k;
    for (k in javaClasses) { o[k] = javaClasses[k]; }
    o.importPackage = function () {};
    o.importClass = function () {};
    return o;
  };
  var pkg = { lang: javaClasses, util: javaClasses, security: javaClasses, crypto: javaClasses, nio: { charset: javaClasses } };
  pkg.crypto.spec = javaClasses;
  g.Packages = { java: pkg, javax: pkg };
  g.importPackage = function () { var k; for (k in javaClasses) { if (k !== 'String') { g[k] = javaClasses[k]; } } };
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
    g.book = book;
    var chapter = b.chapter || {};
    chapter.getVariable = function (k) { return cv.get(k === undefined ? '__variable' : k) || ''; };
    chapter.putVariable = function (k, v) { return cv.put(k, v); };
    g.chapter = chapter;
    g.cookie = {
      getCookie: function (u) { return call('cookie.get', [str(u), null]) || ''; },
      getKey: function (u, k) { return call('cookie.get', [str(u), str(k)]) || ''; },
      setCookie: function (u, c) { call('cookie.set', [str(u), str(c)]); },
      replaceCookie: function (u, c) { call('cookie.set', [str(u), str(c)]); },
      removeCookie: function (u) { call('cookie.remove', [str(u)]); }
    };
    var cv2 = vars('cache');
    g.cache = {
      get: function (k) { return cv2.get(k); },
      put: function (k, v) { cv2.put(k, v); },
      getFromMemory: function (k) { return cv2.get(k); },
      putMemory: function (k, v) { cv2.put(k, v); },
      delete: function (k) { cv2.put(k, ''); }
    };
  };
  g.__out = function (v) {
    if (v === undefined || v === null) { return JSON.stringify({ t: 'null' }); }
    if (typeof v === 'object' && !(v instanceof String)) {
      if (isBytes(v)) { return JSON.stringify({ t: 's', v: bytesToUtf8(v) }); }
      if (typeof v.body === 'function' && v.__response) { return JSON.stringify({ t: 's', v: String(v.body()) }); }
      return JSON.stringify({ t: 'j', v: v });
    }
    return JSON.stringify({ t: 's', v: String(v) });
  };
})(this);
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
    const store = persistentVars();
    if (store !== null && key.length < 1e3) {
      store.putSync(key, value);
      store.flush().catch(() => {
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
  const md = cryptoFramework.createMd(alg);
  md.updateSync({ data: utf8Bytes(text) });
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
  return fetchSpec(buildRequest(raw, scope.baseUrl, scope.source));
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
      const spec = buildRequest(s(1), scope.baseUrl, scope.source);
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
    case "cookie.set":
    case "cookie.remove":
      return "";
    default:
      if (method.startsWith("rule.") && scope.ruleHost) {
        return scope.ruleHost(method, args);
      }
      throw new Error(`\u6682\u4E0D\u652F\u6301\u7684\u4E66\u6E90\u51FD\u6570\uFF1A${method}`);
  }
}
function bindingsOf(scope) {
  const source = scope.source;
  const bindings = {
    "result": scope.result,
    "baseUrl": scope.baseUrl,
    "src": scope.src,
    "key": scope.key,
    "page": scope.page,
    "title": scope.title,
    "book": scope.book,
    "chapter": scope.chapter
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
async function evalJs(script, scope) {
  let prelude = JS_PRELUDE;
  const jsLib = scope.source?.jsLib ?? "";
  if (jsLib.trim() && !jsLib.trim().startsWith("{")) {
    prelude = JS_PRELUDE + "\n;\n" + jsLib;
  }
  const host = (method, argsJson) => {
    const args = JSON.parse(argsJson || "[]");
    return dispatch(scope, method, args).then((v) => {
      return v === null || v === void 0 ? "" : JSON.stringify(v);
    });
  };
  try {
    const raw = await evaluate(prelude, script, bindingsOf(scope), host);
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
    this.js = js;
    this.text = text;
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
function scopeOf(ctx, result) {
  const scope = new JsScope();
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
        out += (await evalJs(expr, scopeOf(ctx, toJsResult(ctx, v)))).asString();
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
      v = fromJs(await evalJs(code, scopeOf(ctx, toJsResult(ctx, v))));
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
      return v.list;
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

// ../harmony-legado/entry/src/main/ets/common/utils/searchUtils.ets
var searchUtils = class {
  /** 单个书源搜索第一页（无共享状态，可并发调用），失败返回空列表 */
  async searchOne(searchKey, bookSource) {
    if (!bookSource.searchUrl) {
      return [];
    }
    try {
      return await searchBooks(bookSource, searchKey, 1);
    } catch (e) {
      console.log(`\u4E66\u6E90\u641C\u7D22\u5931\u8D25\uFF08${bookSource.bookSourceName}\uFF09\uFF1A${e?.message}`);
      return [];
    }
  }
};
var searchUtil = new searchUtils();
var searchUtils_default = searchUtil;

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
function decodeEntities2(s) {
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
    const title = decodeEntities2(m[2]).trim();
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

// ../harmony-legado/entry/src/main/ets/common/utils/SourceCurator.ets
var BRANDS = ["\u4E03\u732B", "\u756A\u8304", "\u732B\u773C"];
var CHECK_TIMEOUT = 45e3;
var CheckResult = class {
  constructor(source, mine) {
    this.ok = false;
    // 发现（分类）是否可用
    this.explore = false;
    this.step = "";
    this.message = "";
    this.ms = 0;
    this.selected = false;
    this.source = source;
    this.mine = mine;
    this.brand = brandOf(source);
  }
};
function brandOf(source) {
  const name = source.bookSourceName ?? "";
  for (const b of BRANDS) {
    if (name.includes(b)) {
      return b;
    }
  }
  return "";
}
function withTimeout(p, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("\u68C0\u6D4B\u8D85\u65F6")), ms);
    p.then((v) => {
      clearTimeout(timer);
      resolve(v);
    }).catch((e) => {
      clearTimeout(timer);
      reject(e);
    });
  });
}
async function checkExplore(source) {
  if (!source.exploreUrl || !source.ruleExplore?.bookList) {
    return false;
  }
  try {
    const items = (await parseExploreUrl(source)).filter((i) => !!i.url).slice(0, 3);
    for (const item of items) {
      try {
        const books = await exploreBooks(source.bookSourceUrl, source.ruleExplore, item.url ?? "", 1, 10, source);
        if (books.some((b) => !!b.bookUrl)) {
          return true;
        }
      } catch (e) {
        console.warn(`\u53D1\u73B0\u68C0\u6D4B\u5931\u8D25\uFF1A${source.bookSourceName} ${item.title}`);
      }
    }
  } catch (e) {
    console.warn(`\u53D1\u73B0\u5206\u7C7B\u89E3\u6790\u5931\u8D25\uFF1A${source.bookSourceName}`);
  }
  return false;
}
async function checkSource(r) {
  const source = r.source;
  const start = Date.now();
  const run2 = async () => {
    r.step = "\u641C\u7D22";
    if (!source.searchUrl) {
      throw new Error("\u65E0\u641C\u7D22\u5730\u5740");
    }
    const key = source.ruleSearch?.checkKeyWord || "\u6211\u7684";
    const found = await searchUtils_default.searchOne(key, source);
    const hit = found.find((b) => !!b.bookUrl);
    if (!hit) {
      throw new Error("\u641C\u7D22\u65E0\u7ED3\u679C");
    }
    r.explore = await checkExplore(source);
    r.step = "\u8BE6\u60C5";
    const book = new Books();
    book.bookName = hit.name;
    book.author = hit.author;
    book.bookUrl = hit.bookUrl;
    book.origin = source.bookSourceUrl;
    const info = await fetchBookInfo(source, book);
    book.toUrl = info[0].tocUrl;
    r.step = "\u76EE\u5F55";
    const chapters = await fetchChapterList(source, book, info[0].tocUrl, info[1], false);
    if (chapters.length === 0) {
      throw new Error("\u76EE\u5F55\u4E3A\u7A7A");
    }
    r.step = "\u6B63\u6587";
    const text = await fetchChapterContent(source, book, chapters, 0, false);
    if (source.bookSourceType === 0 && text.trim().length < 30) {
      throw new Error("\u6B63\u6587\u4E3A\u7A7A");
    }
    r.step = "\u5B8C\u6210";
  };
  try {
    await withTimeout(run2(), CHECK_TIMEOUT);
    r.ok = true;
  } catch (e) {
    r.ok = false;
    r.message = `${e?.message ?? e}`.slice(0, 80);
  }
  r.ms = Date.now() - start;
  console.info(`\u4E66\u6E90\u68C0\u6D4B ${r.ok ? "\u53EF\u7528" : "\u5931\u6548"} ${source.bookSourceName} ${r.ms}ms \u53D1\u73B0${r.explore ? "\u53EF\u7528" : "\u4E0D\u53EF\u7528"} ${r.ok ? "" : `${r.step}\uFF1A${r.message}`}`);
}
export {
  BRANDS,
  Books,
  CheckResult,
  SourceImporter,
  checkSource,
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
