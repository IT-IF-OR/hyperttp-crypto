"use strict";import{bodyToBytes as n,bytesToBase64 as i}from"./encoding.js";export function buildCanonicalString(e){if(!e.method)throw new TypeError("A request method is required for HMAC signing");if(!e.timestamp)throw new TypeError("A timestamp is required for HMAC signing");const r=new URL(e.url),d=new Headers(e.headers),a=(e.includeHeaders??[]).map(t=>`${t.toLowerCase()}:${d.get(t)??""}`);return["hyperttp-hmac-v1",e.method.toUpperCase(),r.origin,`${r.pathname}${r.search}`,e.timestamp,e.nonce??"",i(n(e.body)),...a].join(`
`)}
//# sourceMappingURL=canonical.js.map
