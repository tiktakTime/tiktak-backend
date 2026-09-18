# files

İndeks: [`core/doc.md`](../doc.md) · Limitler: [`app.config.ts`](../../app.config.ts) `files`

S3/MinIO nesne depolama, upload doğrulama, görüntü işleme (sharp / HEIC /
thumbnail). Ürün profil ölçüleri config’te.

Barrel: `@/core/files`

| Dosya         | Rol                                                     |
| ------------- | ------------------------------------------------------- |
| `s3.ts`       | Client, put/delete, public URL                          |
| `validate.ts` | Extension allowlist, magic bytes, size                  |
| `image.ts`    | `processImage` / `createThumbnail` / profil             |
| `path.ts`     | `thumbnailPath`                                         |

---

## S3 (`s3.ts`)

| Fonksiyon | Davranış |
| --------- | -------- |
| `getS3()` | Lazy `S3Client`; `S3_ENDPOINT` zorunlu; path-style; credential default minioadmin |
| `getBucketName()` | `S3_BUCKET_NAME` \|\| `"assets"` |
| `getPublicBaseUrl()` | `S3_URL` (trim) veya `{endpoint}/{bucket}` |
| `buildFileUrl(key)` | `{base}/{key}` |
| `putObject({ key, body, contentType? })` | PutObject → `{ key, url }` |
| `deleteObject(key)` | DeleteObject |

Key’ler leading slash kırpılır.

---

## Doğrulama (`validate.ts`)

| Fonksiyon | Davranış |
| --------- | -------- |
| `extensionOf(filename)` | Son `.ext` lowercase; yoksa `""` |
| `isAllowedExtension` | `app_config.files.allowed_extensions` |
| `validateMagicBytes(buffer, mimeType)` | SVG → `is-svg` (ilk 4KB); diğer → `file-type` mime eşleşmesi |
| `assertFileWithinSize(size, maxBytes)` | `0 < size <= max` |

Upload route’ları genelde: extension → size → magic → (image ise) process.

---

## Görüntü (`image.ts`)

### Profiller

`app_config.files.image_profiles` → derleme zamanı `PROFILES` ataması
(`fit: "cover" | "inside"`). Bilinmeyen isim → `"default"`.

| Fit | Davranış |
| --- | -------- |
| `cover` | Sabit w×h, centre crop → WebP |
| `inside` | `maxEdge` içinde küçült; `keepFormat` ise jpeg/png koru, değilse WebP |

### `processImage(buffer, originalname, profileName?)`

1. HEIC/HEIF (ext veya magic) → `heic-convert` JPEG
2. Profil resize + encode
3. Dönüş: `{ buffer, mimeType, extension, width, height, size, name }`

### `createThumbnail(buffer, mimeType)`

- SVG → `null`
- Genişlik ≤ 1000 → `null`
- Aksi halde max genişlik 240, kaynak format quality 70

### Yardımcılar

`isImageFile`, `normalizeProfile`.

---

## `thumbnailPath(filePath)`

`photo.jpg` → `photo-thumbnail.jpg`; uzantısız → `{path}-thumbnail`.

---

## Tipik upload akışı (çağıran taraf)

```
validate extension + size + magic
  → processImage (profil)
  → putObject (ana)
  → createThumbnail? → putObject (thumbnailPath)
  → (opsiyonel) addImageJob — ağır iş worker’da
```

---

## Bağımlılık

```
core/files → core/env, app.config
apps / domain upload route’ları → @/core/files
```
