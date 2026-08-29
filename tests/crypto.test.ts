import { describe, expect, it } from "vitest";
import { contentDigest } from "../src/plugins/contentDigest.js";
import { verifyIncomingRequest } from "../src/plugins/incomingRequestVerifier.js";
import { hmacSigner } from "../src/plugins/hmacSigner.js";
import { verifyHmac } from "../src/plugins/hmacVerifier.js";
import { withCrypto } from "../src/plugins/plugin.js";
import { buildCanonicalString } from "../src/utils/canonical.js";
import { timingSafeEqualHex } from "../src/utils/timingSafe.js";
import type { HttpRequestInput } from "../src/types/index.js";

const testNonce = "00000000-0000-4000-8000-000000000001" as const;

function pluginInput(result: unknown): HttpRequestInput {
  if (!result || typeof result !== "object" || !("input" in result)) {
    throw new TypeError("Expected the plugin to continue the request pipeline");
  }

  return (result as { input: HttpRequestInput }).input;
}

const request = {
  url: "https://api.example.test:8443/v1/items?limit=10",
  method: "POST",
  body: { id: 1 },
  headers: new Headers({ "x-request-id": "request-1" }),
} as const;

async function createSignedRequest() {
  const plugin = hmacSigner({
    secret: "secret",
    nonceHeaderName: "x-nonce",
    includeHeaders: ["x-request-id"],
  });
  const result = await plugin.onRequest!({ protocol: "http", input: request });
  return pluginInput(result);
}

describe("crypto plugin", () => {
  it("creates a versioned canonical payload bound to origin, nonce and body bytes", () => {
    expect(
      buildCanonicalString({
        ...request,
        timestamp: "1700000000000",
        nonce: "nonce-1",
        includeHeaders: ["x-request-id", "content-type"],
      }),
    ).toBe(
      "hyperttp-hmac-v1\nPOST\nhttps://api.example.test:8443\n/v1/items?limit=10\n1700000000000\nnonce-1\neyJpZCI6MX0=\nx-request-id:request-1\ncontent-type:",
    );
  });

  it("rejects canonical signing when the request method is absent", () => {
    expect(() =>
      buildCanonicalString({
        url: request.url,
        method: "",
        timestamp: "1700000000000",
      }),
    ).toThrow("method");
  });

  it("calculates an RFC 9530-style digest for string and binary bodies", async () => {
    const plugin = contentDigest();
    const stringResult = await plugin.onRequest!({
      protocol: "http",
      input: { ...request, body: "hello" },
    });
    const binaryResult = await plugin.onRequest!({
      protocol: "http",
      input: { ...request, body: new Uint8Array([104, 101, 108, 108, 111]) },
    });

    const expected = "sha-256=:LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=:";
    expect(new Headers(pluginInput(stringResult).headers).get("digest")).toBe(expected);
    expect(new Headers(pluginInput(binaryResult).headers).get("digest")).toBe(expected);
  });

  it("calculates a digest for an empty string body", async () => {
    const result = await contentDigest().onRequest!({
      protocol: "http",
      input: { ...request, body: "" },
    });

    expect(new Headers(pluginInput(result).headers).get("digest")).toBe(
      "sha-256=:47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=:",
    );
  });

  it("signs and verifies an intact request", async () => {
    const originalNow = Date.now;
    const originalUuid = crypto.randomUUID;
    Date.now = () => 1_700_000_000_000;
    crypto.randomUUID = () => testNonce;

    try {
      const signed = await createSignedRequest();
      const headers = new Headers(signed.headers);
      expect(headers.get("x-timestamp")).toBe("1700000000000");
      expect(headers.get("x-nonce")).toBe(testNonce);
      expect(
        await verifyHmac(signed, {
          secret: "secret",
          timestamp: headers.get("x-timestamp")!,
          nonce: headers.get("x-nonce")!,
          signature: headers.get("x-signature")!,
          includeHeaders: ["x-request-id"],
          now: 1_700_000_000_000,
        }),
      ).toBe(true);
    } finally {
      Date.now = originalNow;
      crypto.randomUUID = originalUuid;
    }
  });

  it("rejects altered origin, nonce, body, signature and expired timestamp", async () => {
    const originalNow = Date.now;
    const originalUuid = crypto.randomUUID;
    Date.now = () => 1_700_000_000_000;
    crypto.randomUUID = () => testNonce;

    try {
      const signed = await createSignedRequest();
      const headers = new Headers(signed.headers);
      const options = {
        secret: "secret",
        timestamp: headers.get("x-timestamp")!,
        nonce: headers.get("x-nonce")!,
        signature: headers.get("x-signature")!,
        includeHeaders: ["x-request-id"],
        now: 1_700_000_000_000,
      };

      await expect(
        verifyHmac({ ...signed, url: "https://other.example.test/v1/items?limit=10" }, options),
      ).resolves.toBe(false);
      await expect(verifyHmac(signed, { ...options, nonce: "replaced-nonce" })).resolves.toBe(
        false,
      );
      await expect(verifyHmac({ ...signed, body: { id: 2 } }, options)).resolves.toBe(false);
      await expect(
        verifyHmac(signed, { ...options, signature: `${options.signature.slice(0, -2)}00` }),
      ).resolves.toBe(false);
      await expect(verifyHmac(signed, { ...options, now: 1_700_000_300_001 })).resolves.toBe(false);
    } finally {
      Date.now = originalNow;
      crypto.randomUUID = originalUuid;
    }
  });

  it("compares matching fixed-length hex values without accepting mismatches", () => {
    expect(timingSafeEqualHex("aabbcc", "aabbcc")).toBe(true);
    expect(timingSafeEqualHex("aabbcc", "aabbcd")).toBe(false);
    expect(timingSafeEqualHex("aabbcc", "aabbc")).toBe(false);
  });

  it("composes digest and HMAC using safe defaults", async () => {
    const originalNow = Date.now;
    const originalUuid = crypto.randomUUID;
    Date.now = () => 1_700_000_000_000;
    crypto.randomUUID = () => testNonce;

    try {
      const plugin = withCrypto({
        hmac: {
          secret: "secret",
          nonceHeaderName: "x-nonce",
          includeHeaders: ["digest"],
        },
      });
      const result = await plugin.onRequest!({ protocol: "http", input: request });
      const headers = new Headers(pluginInput(result).headers);

      expect(headers.get("digest")).toBe("sha-256=:A3ySFO73TMOIfzpPCFtOF9digNr9JzsO4WDAnEuhz9Q=:");
      expect(headers.get("x-signature")).not.toBeNull();
    } finally {
      Date.now = originalNow;
      crypto.randomUUID = originalUuid;
    }
  });

  it("verifies and atomically consumes a nonce exactly once", async () => {
    const originalNow = Date.now;
    const originalUuid = crypto.randomUUID;
    Date.now = () => 1_700_000_000_000;
    crypto.randomUUID = () => testNonce;

    try {
      const signed = await createSignedRequest();
      const usedNonces = new Set<string>();
      const nonceStore = {
        consume(nonce: string) {
          if (usedNonces.has(nonce)) return false;
          usedNonces.add(nonce);
          return true;
        },
      };
      const options = {
        secret: "secret",
        nonceStore,
        includeHeaders: ["x-request-id"],
        now: 1_700_000_000_000,
      };

      await expect(verifyIncomingRequest(signed, options)).resolves.toBe(true);
      await expect(verifyIncomingRequest(signed, options)).resolves.toBe(false);
    } finally {
      Date.now = originalNow;
      crypto.randomUUID = originalUuid;
    }
  });
});
