# ✨ ***Setup Guide of This Project***


# 🍲 Tech-Stack
Turborepo (Monorepo orchestration)

Next.js (Frontend)

Express + TypeScript (Backend)

Prisma ORM

Neon PostgreSQL

pnpm Workspaces

## 1. Manually Setup Guide 😵‍💫

### 1️⃣ ***Prerequisites***

#### Make sure you have installed:

#### Node.js 20.19.0+
#### TypeScript 5.4.0+

```bash
npm install -g pnpm
```

### 2️⃣ ***Clone Repositor***

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 3️⃣ ***Install Dependencies***

```bash
pnpm install
````

### 4️⃣ ***Setup Environment Variables***
 #### Backend (```apps/backend/.env```)

 ````bash

PORT=5000
JWT_SECRET=your_secret_key
 ````

#### Frontend (```apps/web/.env.local```)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
````


#### Database (```packages/db/.env```)

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
```


### 5️⃣ ***Prisma Setup (```packages/db```)***

#### Go to db folder

```bash
pnpm dlx turbo run migrate -- --name init
```

#### After that

```bash
pnpm dlx turbo run generate 
```



### 🧠 ***How Prisma Works in This Monorepo***

#### packages/db contains:

### 1.schema.prisma

### 2.Prisma Client

### 3.apps/backend ```imports Prisma client from db package```

```javascript
import { prisma } from "@repo/db";
```


### 🏃 ***Now Run Development Server***

#### In the root folder simply run :-
```bash
pnpm run dev
```


### 📦 ***Production Build***
```bash
pnpm build 
```

### Start backend:
```bash
pnpm --filter backend start
```

### Start frontend:
```bash
pnpm --filter web start
```