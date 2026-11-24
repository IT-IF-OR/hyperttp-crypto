import type { HyperPlugin } from "@hyperttp/types";
import type { HmacSignerOptions, HttpRequestInput } from "../types/index.js";
/**
 * @ru Создаёт HyperTTP-плагин, который подписывает каноническое представление запроса через HMAC.
 * @en Creates a HyperTTP plugin that signs the canonical request representation using HMAC.
 *
 * @example
 * client.use(
 *   hmacSigner({
 *     secret: process.env.HMAC_SECRET!,
 *     nonceHeaderName: "x-nonce",
 *     includeHeaders: ["content-digest", "content-type"],
 *   }),
 * );
 *
 * @param options HMAC secret, algorithm, and header configuration.
 * @returns A HyperTTP request-format plugin. Register after body and signed-header transformations.
 */
export declare function hmacSigner(options: HmacSignerOptions): HyperPlugin<HttpRequestInput>;
//# sourceMappingURL=hmacSigner.d.ts.map