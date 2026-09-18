# Files

S3 nesne depolama + upload doğrulama + görüntü işleme (sharp / HEIC / thumbnail).
Ürün limitleri ve image profilleri → [`app.config.ts`](../../app.config.ts) `files`.

Barrel: `@/core/files`

| Dosya         | Rol                                                     |
| ------------- | ------------------------------------------------------- |
| `s3.ts`       | MinIO/S3 client, put/delete, public URL                 |
| `validate.ts` | Magic bytes, size, extension allowlist (config)         |
| `image.ts`    | `processImage` / thumbnail — profil argümanı config’ten |
| `path.ts`     | `thumbnailPath`                                         |
