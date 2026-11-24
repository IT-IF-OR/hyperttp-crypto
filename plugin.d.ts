import type { HyperPlugin } from "@hyperttp/types";
import type { WithCryptoOptions } from "./types/index.js";
declare module "@hyperttp/types" {
    interface HyperClientOptions {
        crypto?: WithCryptoOptions;
    }
}
/**
 * @ru Объединяет генерацию Content-Digest и опциональную HMAC-подпись в один
 * HyperTTP-плагин. Без параметров добавляет только заголовок Content-Digest с SHA-256:
 * HMAC включается исключительно при явной передаче секрета.
 * @en Combines Content-Digest generation and optional HMAC signing into one
 * HyperTTP plugin. Without options it adds only a SHA-256 Content-Digest header:
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
 *       includeHeaders: ["content-digest", "content-type"],
 *     },
 *   }),
 * );
 *
 * @param options Plugin configuration for Digest generation and HMAC signing.
 * @returns A single HyperTTP plugin that calculates Digest before signing.
 */
export declare function withCrypto(options?: WithCryptoOptions): HyperPlugin;
//# sourceMappingURL=plugin.d.ts.map