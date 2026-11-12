import type { CryptoBody } from "../types/index.js";
/**
 * @ru Кодирует точное представление тела, поддерживаемое криптографическими плагинами.
 * @en Encodes the exact body representation supported by crypto plugins.
 */
export declare function bodyToBytes(body: CryptoBody | undefined): Uint8Array<ArrayBuffer>;
/**
 * @ru Кодирует байты в стандартную Base64-строку.
 * @en Encodes bytes as a standard Base64 string.
 */
export declare function bytesToBase64(bytes: Uint8Array): string;
/**
 * @ru Кодирует байты в hex-строку в нижнем регистре.
 * @en Encodes bytes as a lowercase hexadecimal string.
 */
export declare function bytesToHex(bytes: Uint8Array): string;
/**
 * @ru Декодирует hex-строку в байты.
 * @en Decodes a hexadecimal string into bytes.
 */
export declare function hexToBytes(hex: string): Uint8Array;
//# sourceMappingURL=encoding.d.ts.map