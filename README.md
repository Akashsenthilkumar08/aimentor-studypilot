# StudyPilot AI — Adaptive Student Learning Engine 🚀

StudyPilot AI is an advanced educational learning platform powered by **Google Gemini AI**, **Firebase Authentication**, **Cloud Firestore**, and **Three.js 3D WebGL Visualization**. 

It replaces passive cramming with a 5-step cognitive learning loop: **Study → Practice → Evaluate → Detect → Improve**.

---

## 🏛️ System Architecture

```
AI Antigravity (Custom Instructions)
 └── AI-Generated Educational Application (Vite + React + Express)

Firebase Platform
 ├── Google Sign-In & Email Authentication (firebase/auth)
 └── Cloud Firestore Per-User Data Persistence (firestore.rules)

Google Gemini API Engine
 ├── Study Plan Blueprint Generator (gemini-3.6-flash)
 ├── Feynman "Teach-Back" Rubric Evaluator
 ├── Active Retrieval Diagnostic Quiz Generator
 └── Quill AI Multimodal & Student-Personalized Assistant

Secret Manager & Deployment
 ├── API Key Management (GEMINI_API_KEY environment variable)
 └── Cloud Run Container Deployment (Node.js Express + Static SPA Build)
```

---

## 🚀 Key Features

### 1. 📖 Adaptive Study Plan Generation
- Generates structured, week-by-week study roadmaps calibrated to your target exam dates and daily study commitment.
- Automatically breaks topics into digestible modules with progress tracking.

### 2. 📝 Active Retrieval Practice Quizzes
- Generates targeted multiple-choice diagnostic quizzes for edge-case comprehension checks.
- Provides immediate explanation breakdowns for incorrect answers.

### 3. 🗣️ Feynman "Teach-Back" Evaluation Engine
- Explaining a concept in your own words is the highest form of learning retention.
- Gemini evaluates student explanations against a 4-pillar rubric: **Accuracy, Clarity, Completeness, and Simplicity**.

### 4. 📈 Automated Weakness Heatmap & Remediation
- Classifies errors into boundary failures, memory decay, or conceptual misunderstandings.
- Generates targeted 3-minute reinforcement drills to close knowledge gaps.

### 5. ✨ Quill AI Multimodal Student Assistant
- Multi-turn conversational AI assistant tailored with real-time student context (streak days, weak areas, active plans).
- Supports code generation across C++, Python, Java, TypeScript, SQL, and STEM subjects.

### ⚛️ Three.js 3D WebGL Visualizers
- **3D WebGL Molecule Viewer**: Interactive 3D chemical structures (Caffeine, Ethanol, Aspirin, Buckyball C60, DNA Double Helix) with 360° orbit rotation and raycaster atom tooltips.
- **3D WebGL Text Geometry Visualizer**: Extruded 3D contour text renderer with custom input support.

---

## 🔒 Security & Data Isolation

- **Firebase Authentication**: Secures student accounts via Google Sign-In and Email/Password.
- **Firestore Security Rules**: Strictly isolates every student's study plans, quiz scores, weakness heatmaps, and chat histories under `/users/{userId}/*`.
- **API Key Security**: Integrates with Secret Manager to safely manage `GEMINI_API_KEY`.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **bun**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/aimentor.git
cd aimentor

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📦 Production Build & Cloud Run Deployment

```bash
# Build Vite production bundle & compile Express server
npm run build

# Start production server
npm start
```

### Deploy to Google Cloud Run
```bash
gcloud run deploy studypilot-ai \
  --source . \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY=sm://GEMINI_API_KEY:latest
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
