# @hyperttp/crypto

[Русский](./lang/ru/README.md)

Cryptographic plugins for [HyperTTP](https://github.com/dirold2/hyperttp): HTTP Digest, HMAC request signing, signature verification, and replay protection.

## Installation

```bash
npm install @hyperttp/crypto @hyperttp/types
```

## Quick start

```ts
import { withCrypto } from "@hyperttp/crypto";

client.use(
  withCrypto({
    hmac: {
      secret: process.env.HMAC_SECRET!,
      nonceHeaderName: "x-nonce",
      includeHeaders: ["digest", "content-type"],
    },
  }),
);
```

`withCrypto()` without options creates a SHA-256 `Digest` header only. HMAC signing requires an explicit secret and must not be used with secrets exposed to browser or mobile bundles.

See the [Russian documentation](./lang/ru/README.md) for API details, server-side verification, and atomic nonce storage requirements.

## License

[MIT](./LICENSE)
