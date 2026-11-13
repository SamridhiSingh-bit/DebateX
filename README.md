# ⚖️ DebateX
### Think Critically. Argue Boldly. Debate Intelligently.

**DebateX** is an AI-powered debate platform designed to help users improve their critical thinking, argumentation, reasoning, and communication skills through structured debates against Artificial Intelligence.

The platform combines interactive debate sessions with AI-powered moderation and evaluation to create an engaging learning and practice environment.

---

## 🚀 Project Overview

DebateX aims to provide a structured environment where users can:

- Explore a curated collection of debate topics.
- Create debate rooms and invite participants using room codes.
- Challenge an AI opponent in structured debates.
- Interact with an AI moderator during debate sessions.
- Receive AI-generated feedback and performance evaluations.
- Improve their reasoning, confidence, and argumentative skills.

**Core concept:** Human vs AI — every debate is an opportunity to challenge ideas and sharpen your thinking.

---

## ✨ Planned Features

| Feature | Description |
|---|---|
| User Authentication | Registration and login |
| Debate Dashboard | Central hub for debate activities |
| Topic Library | Curated topics across multiple categories |
| Create Room | Generate a unique debate room |
| Join Room | Enter a debate using a room code |
| AI Opponent | Debate against an AI-powered opponent |
| AI Moderator | Maintain structure and fairness |
| AI Judge | Evaluate arguments and provide feedback |
| Performance Analysis | Review debate performance and improvement areas |

*Features are being developed incrementally.*

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- React Router
- Lucide React
- CSS

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- Maven

### Database
- PostgreSQL

### AI Integration
- AI-powered opponent, moderation, and evaluation capabilities are planned for future integration.

---

## 📁 Project Structure

```text
DebateX/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/debatex/backend/
│   │   │   │       ├── config/
│   │   │   │       └── controller/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── topics/
│   ├── topics.json
│   ├── categories.json
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- Node.js and npm
- Java Development Kit
- Maven (or use the included Maven Wrapper)
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/SamridhiSingh-bit/DebateX.git
cd DebateX
```

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Configure the backend

Create a PostgreSQL database named:

```sql
CREATE DATABASE debatex;
```

Configure your database connection in:

`backend/src/main/resources/application.properties`

Set your database password through the `DB_PASSWORD` environment variable. Do not commit database credentials.

### 4. Run the backend

Open another terminal:

```bash
cd backend
```

On Windows PowerShell:

```powershell
$env:DB_PASSWORD="your_actual_password"
.\mvnw.cmd spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

Health endpoint:

```text
http://localhost:8080/api/health
```

### 5. Deploy the backend to Render

The frontend can stay on Vercel. Deploy the Spring Boot API and PostgreSQL database
separately on Render, then point the Vercel build at the API.

1. Push the project to GitHub, then in Render choose **New → Blueprint** and
   select this repository. Render reads the root [`render.yaml`](render.yaml),
   which defines the backend service, managed PostgreSQL database, and generated
   JWT secret. Confirm the plan and resource costs before creating resources.
2. No OpenAI key is required to deploy or start the backend. AI opponent and
   evaluation features require an AI provider key; you can add `OPENAI_API_KEY`
   to the Render service environment variables later. Do not commit secrets or
   send them in chat.
3. Deploy the Blueprint and check
   `https://<render-service>.onrender.com/api/health`.
   A healthy response contains `"status":"UP"`.
4. In Vercel, add `VITE_API_URL` with the value
   `https://<render-service>.onrender.com/api` to the frontend project's
   environment variables, then redeploy the frontend. Vite embeds this value at
   build time, so changing it without a new deployment will not update the site.

The backend Docker image uses Java 25 to match the version configured in
`backend/pom.xml`. Its entrypoint accepts Render's PostgreSQL connection URL and
converts it to the JDBC settings required by Spring Boot. Configure
`OPENAI_API_KEY` in Render (not Vercel) to enable AI-powered debate features.
Free services can sleep when idle, and free database availability/retention is
subject to Render's current plan terms; check those terms before relying on the
free plan for persistent production data.

---

## 📚 Debate Topic Library

DebateX includes a curated topic collection covering areas such as:

- Technology and Artificial Intelligence
- Politics and Governance
- Religion and Secularism
- Gender and Identity
- Education and Culture
- Environment and Economy
- Free Speech and Censorship
- Crime and Justice
- Family and Social Issues

The topic collection is maintained separately in the [`topics/`](topics/) directory.

---

## 🎯 Project Goals

1. Encourage critical thinking and independent reasoning.
2. Make debate practice accessible through AI.
3. Provide structured and meaningful feedback.
4. Help users understand multiple perspectives.
5. Build confidence in expressing and defending ideas.

---

## 🗺️ Development Roadmap

- [x] Initialize React frontend
- [x] Create initial authentication interface
- [x] Build initial dashboard
- [x] Set up Spring Boot backend
- [x] Configure PostgreSQL connectivity
- [x] Create backend health endpoint
- [x] Establish curated topic library structure
- [x] Implement backend authentication
- [x] Implement room creation and joining
- [x] Connect frontend with backend APIs
- [x] Develop the debate arena
- [x] Integrate AI opponent
- [x] Implement AI moderation and judging
- [x] Add debate performance analytics
- [ ] Deploy the complete application

---

## 👩‍💻 Developer

**Samridhi Singh**

BE Computer Science Engineering — AI & ML

GitHub: [@SamridhiSingh-bit](https://github.com/SamridhiSingh-bit)

---

## 📌 Project Status

**Currently under active development.**

DebateX is being developed incrementally, with frontend, backend, database, and AI capabilities being integrated in stages.

---

*DebateX — Where ideas meet intelligence.* ⚖️
