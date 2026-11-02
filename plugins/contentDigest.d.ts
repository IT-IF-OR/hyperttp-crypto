import type { HyperPlugin } from "@hyperttp/types";
import type { ContentDigestOptions, HttpRequestInput } from "../types/index.js";
/**
 * @ru Создаёт HyperTTP-плагин, который добавляет HTTP Content-Digest для тела запроса.
 * @en Creates a HyperTTP plugin that adds an HTTP Content-Digest for the request body.
 *
 * @example
 * client.use(contentDigest({ algorithm: "SHA-512" }));
 *
 * @param options Digest algorithm and header configuration.
 * @returns A HyperTTP request-format plugin.
 */
export declare function contentDigest(options?: ContentDigestOptions): HyperPlugin<HttpRequestInput>;
//# sourceMappingURL=contentDigest.d.ts.map