import type { HmacVerificationOptions, HttpRequestInput } from "../types/index.js";
/**
 * @ru Проверяет HMAC-подпись запроса и допустимую давность timestamp.
 * @en Verifies an HMAC request signature and timestamp freshness.
 */
export declare function verifyHmac(request: HttpRequestInput, options: HmacVerificationOptions): Promise<boolean>;
//# sourceMappingURL=hmacVerifier.d.ts.map