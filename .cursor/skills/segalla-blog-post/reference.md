# API Reference — segalla-blog

Base URL: `{BLOG_URL}` (default `https://hello-world-blog-xi.vercel.app`)

## POST /api/auth

**Body:**
```json
{ "email": "string", "password": "string" }
```

**200:** `{ "ok": true }` + `Set-Cookie: segalla_token=...`

**401:** `{ "error": "Credenciais inválidas" }`

Email é normalizado (trim + lowercase) no servidor.

---

## POST /api/posts

**Headers:** `Content-Type: application/json` + cookie `segalla_token`

**Body:** ver SKILL.md

**201:** objeto `Post` completo

```json
{
  "id": 1,
  "slug": "...",
  "title": "...",
  "subtitle": null,
  "content": "...",
  "excerpt": "...",
  "tags": "...",
  "category": "Dev",
  "readTime": 5,
  "coverImage": null,
  "published": true,
  "createdAt": "2026-05-25T...",
  "updatedAt": "2026-05-25T..."
}
```

---

## PUT /api/posts/{id}

Mesmo body do POST. Atualiza post existente.

---

## DELETE /api/posts/{id}

**200:** `{ "ok": true }`

---

## POST /api/upload

**Headers:** `multipart/form-data` + cookie

**Field:** `file` (JPG, PNG, WebP, GIF, max 5 MB)

**200:** `{ "url": "https://..." }` → usar em `coverImage`

Requer na Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, bucket `covers` (público).

---

## curl completo

```bash
BASE="https://hello-world-blog-xi.vercel.app"
JAR="/tmp/segalla-cookies.txt"

curl -s -c "$JAR" -X POST "$BASE/api/auth" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$BLOG_ADMIN_EMAIL\",\"password\":\"$BLOG_ADMIN_PASSWORD\"}"

curl -s -b "$JAR" -X POST "$BASE/api/posts" \
  -H "Content-Type: application/json" \
  -d @post.json
```
