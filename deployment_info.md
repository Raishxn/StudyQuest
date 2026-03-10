# StudyQuest Deployment Info

## 💻 Frontend (Vercel)
**Configurações Importantes:**
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && pnpm build --filter web`
- **Output Directory**: `.next`

### Environment Variables (Vercel Table)
| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://studyquest-api.onrender.com` (ou sua URL do Render) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zkhiivvlgeqzcxorzoxu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpraGlpdnZsZ2VxemN4b3J6b3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDUzMDksImV4cCI6MjA4ODY4MTMwOX0.5aO6V_o-iGeppGEYN2ADlpywbp4EgIKWTPEi8bTMwsA` |

---

## 🛡️ Backend (Render.com / Railway)
**Configurações Importantes:**
- **Root Directory**: `.` (raiz do monorepo)
- **Build Command**: `pnpm install && pnpm run build --filter api`
- **Start Command**: `pnpm run start --filter api`

### Environment Variables (Render/Railway Table)
| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:Raishxnmachado32$@db.zkhiivvlgeqzcxorzoxu.supabase.co:5432/postgres` |
| `REDIS_URL` | `redis://default:gQAAAAAAAQRSAAIncDI1MmI1NGIxODZmZjg0MzUwOTJmZDRhNDRkZjc1OTQ1ZnAyNjY2NDI@wise-skunk-66642.upstash.io:6379` |
| `JWT_SECRET` | `uma-string-aleatoria-e-segura-123456` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |

