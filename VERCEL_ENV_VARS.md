# Vercel Environment Variables - Exact Format

## FIREBASE_PRIVATE_KEY Format

### ❌ DO NOT include the quotes in Vercel

When you set `FIREBASE_PRIVATE_KEY` in Vercel, paste **only the value** (without the surrounding quotes).

### ✅ Correct Format for Vercel

In Vercel's Environment Variables, paste this (without quotes):

```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCiRQsl5nuoV95Z\nlgtRj+HG1vYzwiq5d9PNaBFyba0nsrnRKoDids2S3D7OR5c2nnxPJO/WP/eBKQaW\nIEfBITOONLXMoSAg+/gAR9kgHsQ9kYSrYcU8N1OBCd7ZMeb/NOfNgmUjIgucYzt6\nX6/4Vx6zCyS26doh6u3Qfv9jm6yVzj/yAwY0cH1AxoMOImeremt7I5oKUjt9+YSp\nrIbqQ/nUD7zNxlvduGLC1Igjv6ZzexbGYjSCy738NFR+J9wsuLNltvwNcz5+Iwn3\nBCSRsmN5ak1X8erYbcpqvqYu5Oc9VtY4CjGE1elelb24Gmzel1K8wWYMBNBKOPOt\nf5cXGBfDAgMBAAECggEALT+5ixkJVHkkLLEVeOn5WHwq7WXwigVrD3U8oD8LMO26\nuSP0CrJ8Qr6d2OHHvdhV66/uHT17JA4vov9fYvCCMt5p76Tik7APiOyAFF/f8xc3\n+p5p5I+8/lelR8WNl47GMN1ynGhq+nIFbOtv431PtzedRlBRnnGnXSN8zebkKmWG\nZgK0Xu2/YmjLTq3U8VHpwnCtjdFq4aDSdksVruvqvxHztkUWs+NqjifQWXIp0J/K\n2eXgvjXe/kjKVf0OtTjgBm5Kk/PGK4vHT891mHkrHzYR8QWqKq21MY5ev/Ow0kvu\nxNtZol3FLSYqfYAMT7EFPdXSIm8N2ntascaURmg5YQKBgQDQlQ5LUOoLxzB2sdIy\nJSQaO2moYB6+rX2SampmyzFiB4TeeAEuPi0FnoeClhfkpgagRzfRDn6rzb+6ZRGR\nL4Mb0pE8k7d+JrQo8XUIF/HbfzRiOkZ6Ba9QV5MjOK+PZ2xmIJxruNZJgnFVtrgg\nLt7Jgba7rX7kqoPJwEbwPZvDEQKBgQDHKLfJ+xJBOn2boUKAFpwXVYRZQzoo4GbS\nFSfuMi938ctkstuJI6BJL6RwmbWNLTwLj/queyR47fNhrRB0rHGgt8ZEk/5tvqHe\n8LQ6MB0+PzLHSBeRQuxs8gvyYOcYr9EfxXqnP7qK2UedK9XXhoEJVnRxIMzhyFey\n07j3WtvFkwKBgDq3izOWjpxMMY9oVYS6QeSEjyTQEjeZPT1HabaQQtGWzkeWPrbW\n1/O6Aem3+Pfr6PebtNHMI8qXe/6rzvsxBdaCO1JzPvdrS9IuzsQ9gV9J+uQgBZD6\nIrUaQhhrL7jN440IZyBIA0LkTqVTb5fXue2970P7/jm+6qST1SRyI3QRAoGBAKJV\nezFkuCV48qdnU1gqlcKjTwSfOonVF5pH6ktKlsySxzHmY/Gtm1nsPoIVmBlh9J6M\nFk4gS8NSWV6VfWNMqDXTdgWyB+IWT8TzuEPxsfRp+Q7coXEi9ql6xegjulqx/KiE\nBAzNclT49FmVQHGzzfv5f2Iy1S14apt13j+ozJiHAoGBAMGffobecT6RMmNWbpVL\nrLWOPLGD0N5PvUl7w55trrHH0WxR4gMDCKMRh9IZKKpAD2+2p9D7jj/T36o3SHrI\nyup7kQikTzKSeG4ycaLV5EGLRmyUFc5decvSYrgojaT1XUDIuWgfHiQjCXi+xroq\nLte1lLr5VWOk2A7rzduSwYDS\n-----END PRIVATE KEY-----\n
```

### Important Notes:

1. **NO quotes** - Just paste the value directly
2. **Keep `\n` characters** - These are literal backslash-n characters (not actual newlines)
3. **Start with `-----BEGIN PRIVATE KEY-----`**
4. **End with `-----END PRIVATE KEY-----\n`** (note the `\n` at the end)

### How to Copy from Your .env File:

1. Open your `.env` file
2. Find the line: `FIREBASE_PRIVATE_KEY="..."`
3. Copy **only the content between the quotes** (not the quotes themselves)
4. Paste into Vercel

### Quick Copy Command:

```bash
# View the value (without quotes) - copy from BEGIN to END
cat .env | grep FIREBASE_PRIVATE_KEY | sed 's/^FIREBASE_PRIVATE_KEY="//;s/"$//'
```

---

## All Environment Variables for Vercel

### 1. THE_ODDS_API_KEY
```
74d563d02d124be50bf7fda6bb3f5f7d
```
(No quotes, just the key)

### 2. FIREBASE_PROJECT_ID
```
sports-odds-aura
```
(No quotes, just the project ID)

### 3. FIREBASE_PRIVATE_KEY
```
-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```
(No quotes, include `\n` characters)

### 4. FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-fbsvc@sports-odds-aura.iam.gserviceaccount.com
```
(No quotes, just the email)

---

## Why No Quotes?

- In `.env` files, quotes are used to wrap values with special characters
- When Node.js reads `process.env.FIREBASE_PRIVATE_KEY`, it gets the value **without** quotes
- Vercel stores the value directly as it will appear in `process.env`
- So you enter the value exactly as Node.js will receive it (without quotes)

---

## Verification

After setting in Vercel, the value should:
- ✅ Start with `-----BEGIN PRIVATE KEY-----`
- ✅ End with `-----END PRIVATE KEY-----\n`
- ✅ Contain `\n` characters (literal backslash-n, not actual newlines)
- ✅ NOT have quotes at the start or end
