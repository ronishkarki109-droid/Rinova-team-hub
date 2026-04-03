# Rinova Team Hub

A simple internal team chat web app built with **Next.js + Supabase**.

## Features
- Email/password sign up and login
- Channel-based chat
- Image / video / file upload
- Search messages
- Basic dashboard to create channels
- Starter structure for your team

## 1) Create accounts
You need:
- GitHub
- Supabase
- Vercel

## 2) Install locally
Open the project in VS Code and run:

```bash
npm install
```

## 3) Create your environment file
Copy `.env.example` and make a new file called `.env.local`

```bash
cp .env.example .env.local
```

Paste your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4) Create Supabase database
In Supabase:
- Create a new project
- Open **SQL Editor**
- Copy everything from `supabase/schema.sql`
- Run it

This creates:
- profiles
- channels
- messages
- attachments
- media storage bucket

## 5) Run the app
```bash
npm run dev
```

Open:
```text
http://localhost:3000
```

## 6) How login works
- Go to `/signup`
- Create your account
- Login from `/login`

## 7) How to use
After login:
- Create channels from the dashboard
- Open a channel
- Send text messages
- Upload images/videos/files
- Search messages in the channel

## 8) Make it live
### Push to GitHub
Create a GitHub repo and push this code.

### Deploy to Vercel
- Import your GitHub repo into Vercel
- Add the same environment variables in Vercel
- Deploy

Now your team gets a live link like:
`https://your-app-name.vercel.app`

## Notes
This is an MVP starter app.
