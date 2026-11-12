import type { HttpRequestInput, IncomingHmacVerificationOptions } from "../types/index.js";
/**
 * @ru Проверяет HMAC и атомарно использует nonce для предотвращения повторного воспроизведения.
 * @en Verifies HMAC and atomically consumes a nonce to prevent replay.
 */
export declare function verifyIncomingRequest(request: HttpRequestInput, options: IncomingHmacVerificationOptions): Promise<boolean>;
//# sourceMappingURL=incomingRequestVerifier.d.ts.map