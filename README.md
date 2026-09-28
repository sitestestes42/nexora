# NEXORA Server 2.0

Servidor interativo com Vercel + Express + Supabase/PostgreSQL.

## 1. Banco

No Supabase, abra o **SQL Editor** e execute `supabase.sql`.

## 2. Variáveis na Vercel

Em Project Settings > Environment Variables, adicione:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

A `SERVICE_ROLE_KEY` é segredo: nunca coloque no GitHub e nunca no código do navegador.

## 3. Deploy

Envie o projeto para GitHub e importe o repositório na Vercel.

## Endpoints

GET `/api`
GET `/api/health`
GET `/api/status`
GET `/api/users`
POST `/api/users`
GET `/api/messages`
POST `/api/messages`
