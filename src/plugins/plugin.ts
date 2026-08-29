import type { HyperPlugin, PluginContext, RequestContext } from "@hyperttp/types";
import { contentDigest } from "./contentDigest.js";
import { hmacSigner } from "./hmacSigner.js";
import type { HttpRequestInput, WithCryptoOptions } from "../types/index.js";

/**
 * @ru Объединяет генерацию Content-Digest и опциональную HMAC-подпись в один
 * HyperTTP-плагин. Без параметров добавляет только заголовок Digest с SHA-256:
 * HMAC включается исключительно при явной передаче секрета.
 * @en Combines Content-Digest generation and optional HMAC signing into one
 * HyperTTP plugin. Without options it adds only a SHA-256 Digest header:
 * HMAC is enabled only when a secret is explicitly provided.
 *
 * @example
 * client.use(withCrypto());
 *
 * @example
 * client.use(
 *   withCrypto({
 *     hmac: {
 *       secret: process.env.HMAC_SECRET!,
 *       nonceHeaderName: "x-nonce",
 *       includeHeaders: ["digest", "content-type"],
 *     },
 *   }),
 * );
 *
 * @param options Plugin configuration for Digest generation and HMAC signing.
 * @returns A single HyperTTP plugin that calculates Digest before signing.
 */
export function withCrypto(options: WithCryptoOptions = {}): HyperPlugin<HttpRequestInput> {
  const digestPlugin = options.digest === false ? undefined : contentDigest(options.digest);
  const hmacPlugin = options.hmac ? hmacSigner(options.hmac) : undefined;

  return {
    name: "hyperttp-crypto",
    phase: "FORMAT",
    async onRequest(request, context?: PluginContext, requestContext?: RequestContext) {
      const digested = digestPlugin?.onRequest
        ? await digestPlugin.onRequest(request, context, requestContext)
        : request;
      if (!digested || !("input" in digested) || !hmacPlugin?.onRequest) return digested;

      return hmacPlugin.onRequest(digested, context, requestContext);
    },
  };
}
