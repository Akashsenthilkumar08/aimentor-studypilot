import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let __filename = "";
let __dirname = "";
try {
  if (import.meta && import.meta.url) {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
  } else {
    __dirname = process.cwd();
  }
} catch {
  __dirname = process.cwd();
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Lazy Gemini client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}

// Health Check
app.get("/api/health", (_req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({ status: "ok", service: "StudyPilot AI Server", hasGeminiKey });
});

// API: Generate Study Plan
app.post("/api/gemini/generate-plan", async (req, res) => {
  const { subject, goal, targetDate, hoursPerDay, currentLevel } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // High-quality fallback for seamless student onboarding
      return res.json({
        plan: {
          title: `${subject || "Computer Science"} Mastery Blueprint`,
          description: `Personalized ${hoursPerDay || 2}h/day plan targeting ${goal || "Exam Excellence"}`,
          level: currentLevel || "Intermediate",
          targetDate: targetDate || "4 weeks",
          estimatedHours: 42,
          modules: [
            {
              id: "mod-1",
              title: "Foundations & Core Axioms",
              duration: "Week 1",
              status: "completed",
              topics: [
                { name: "Mental Models & First Principles", duration: "2 hours", completed: true },
                { name: "Core Terminologies & Syntax", duration: "3 hours", completed: true },
                { name: "Diagnostic Practice Test", duration: "1 hour", completed: true }
              ]
            },
            {
              id: "mod-2",
              title: "Intermediate Applications & Mechanics",
              duration: "Week 2",
              status: "in_progress",
              topics: [
                { name: "Systematic Problem Decomposition", duration: "3 hours", completed: true },
                { name: "Edge Cases & Algorithmic Analysis", duration: "4 hours", completed: false },
                { name: "Teach-Back Drill: Explaining the Bottlenecks", duration: "1.5 hours", completed: false }
              ]
            },
            {
              id: "mod-3",
              title: "Synthesis & Exam Pitfall Mastery",
              duration: "Week 3-4",
              status: "upcoming",
              topics: [
                { name: "High-Frequency Exam Traps", duration: "3 hours", completed: false },
                { name: "Full-Length Mock Assessment", duration: "2 hours", completed: false },
                { name: "Weakness Remediation Loop", duration: "3 hours", completed: false }
              ]
            }
          ]
        },
        isFallback: true
      });
    }

    const prompt = `You are StudyPilot AI, an elite educational cognitive coach.
Create a structured, highly motivating study plan for:
Subject: ${subject}
Goal: ${goal}
Target Horizon: ${targetDate}
Daily Commitment: ${hoursPerDay} hours/day
Current Mastery Level: ${currentLevel}

Respond with valid JSON adhering to this schema:
{
  "title": string,
  "description": string,
  "level": string,
  "targetDate": string,
  "estimatedHours": number,
  "modules": [
    {
      "id": string,
      "title": string,
      "duration": string,
      "status": "in_progress" | "upcoming",
      "topics": [
        { "name": string, "duration": string, "completed": boolean }
      ]
    }
  ]
}
Return only JSON, no markdown code fence.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);
    res.json({ plan: parsed, isFallback: false });
  } catch (error: any) {
    console.error("Plan generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate plan" });
  }
});

// API: Teach Back Evaluation
app.post("/api/gemini/teach-back-evaluate", async (req, res) => {
  const { topic, studentExplanation, targetConcept } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Fallback rubric calculation
      return res.json({
        evaluation: {
          score: 84,
          rubric: {
            accuracy: 88,
            clarity: 82,
            completeness: 80,
            simplicity: 86
          },
          verdict: "Strong Conceptual Grasp with Minor Incompleteness",
          strengths: [
            "Good use of relatable intuitive analogy to ground the explanation.",
            "Accurately stated the primary mechanism without circular definitions."
          ],
          misconceptions: [
            "Overlooked the boundary conditions and failure states."
          ],
          targetedImprovement: `Review how ${topic} behaves when input constraints exceed standard limits. Try explaining the exception handler aloud.`,
          detectedWeakness: `${topic} - Edge Cases & Limits`
        },
        isFallback: true
      });
    }

    const prompt = `You are StudyPilot AI's "Teach Back" Evaluation Engine (Feynman Technique evaluator).
A student is attempting to prove their deep understanding of "${topic}" (${targetConcept || ""}) by explaining it back in their own words.

Student's Explanation:
"${studentExplanation}"

Evaluate their explanation. Check for:
1. Conceptual accuracy (are there factual flaws or subtle misunderstandings?)
2. Clarity and simplicity (can a peer understand it?)
3. Completeness (did they mention the core mechanism?)
4. Misconceptions or gaps

Respond in JSON with this exact structure:
{
  "score": number (0-100),
  "rubric": {
    "accuracy": number (0-100),
    "clarity": number (0-100),
    "completeness": number (0-100),
    "simplicity": number (0-100)
  },
  "verdict": string,
  "strengths": string[],
  "misconceptions": string[],
  "targetedImprovement": string,
  "detectedWeakness": string
}
Return only JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ evaluation: parsed, isFallback: false });
  } catch (error: any) {
    console.error("Teach Back evaluation error:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate teach-back" });
  }
});

// API: Generate Practice Quiz
app.post("/api/gemini/generate-quiz", async (req, res) => {
  const { topic, difficulty, count = 3 } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        quiz: {
          topic: topic || "Data Structures & Big O",
          difficulty: difficulty || "Medium",
          questions: [
            {
              id: "q1",
              question: `In the context of ${topic || "algorithms"}, which of the following best characterizes worst-case time complexity?`,
              options: [
                "The minimum number of operations required for optimal input",
                "The upper bound on running time for any arbitrary input of size n",
                "The average execution time measured across multiple benchmarking runs",
                "The memory footprint occupied during garbage collection cycles"
              ],
              correctIndex: 1,
              explanation: "Worst-case complexity gives an asymptotic upper bound (Big-O), ensuring the algorithm will never exceed this time bound."
            },
            {
              id: "q2",
              question: "Which cognitive learning strategy produces the highest long-term retention according to educational research?",
              options: [
                "Passive re-reading and highlighting textbook chapters",
                "Active recall with spaced repetition and teach-back testing",
                "Cramming 8 hours before the examination",
                "Copying verbatim class lecture notes into flashcards"
              ],
              correctIndex: 1,
              explanation: "Active recall forces retrieval pathways to strengthen, and spaced repetition halts the forgetting curve."
            }
          ]
        },
        isFallback: true
      });
    }

    const prompt = `Generate a ${count}-question multiple choice practice quiz on topic: "${topic}", difficulty: "${difficulty}".
Respond strictly in JSON:
{
  "topic": string,
  "difficulty": string,
  "questions": [
    {
      "id": string,
      "question": string,
      "options": string[], // exactly 4 options
      "correctIndex": number, // 0, 1, 2, or 3
      "explanation": string
    }
  ]
}
Return only JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ quiz: parsed, isFallback: false });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz" });
  }
});

// API: Learn a Topic / Concept Deep Dive
app.post("/api/gemini/explain-topic", async (req, res) => {
  const { topic, subject } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        lesson: {
          topic: topic || "Core Concept",
          subject: subject || "General Study",
          conceptSummary: `A foundational understanding of ${topic || "this concept"} requires grasping its core mechanism and state boundaries.`,
          firstPrinciples: "Start by isolating what changes, what remains invariant, and why the system requires this specific transformation.",
          stepByStep: [
            "Step 1: Identify the underlying problem domain and boundary inputs.",
            "Step 2: Trace the state transitions or logical deduction sequence.",
            "Step 3: Analyze worst-case and edge-case exceptions.",
            "Step 4: Formulate the simplified intuition without jargon."
          ],
          concreteExample: `Imagine applying ${topic || "this principle"} in a real-world system: inputs enter the pipeline, pass through validation filters, and produce deterministic outputs.`,
          commonTraps: [
            "Confusing the nominal happy path with edge-case invariant states.",
            "Memorizing the final formula without deriving the intermediate steps."
          ],
          memoryHook: "State Invariant Principle: Anchor the beginning, verify the middle, guarantee the output."
        },
        isFallback: true
      });
    }

    const prompt = `You are StudyPilot AI, an elite educational tutor specializing in first-principles learning.
The student wants to learn the topic: "${topic}" (Subject: "${subject || "General"}").

Generate a structured, concise, and highly effective learning guide. Respond strictly in JSON:
{
  "topic": string,
  "subject": string,
  "conceptSummary": string,
  "firstPrinciples": string,
  "stepByStep": string[],
  "concreteExample": string,
  "commonTraps": string[],
  "memoryHook": string
}
Return only JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ lesson: parsed, isFallback: false });
  } catch (error: any) {
    console.error("Explain topic error:", error);
    res.status(500).json({ error: error.message || "Failed to generate topic lesson" });
  }
});

// API: General-Purpose Gemini AI Assistant Chat (Multi-turn, Multimodal, Student-Personalized)
app.post("/api/gemini/assistant-chat", async (req, res) => {
  const { messages, studentContext } = req.body;

  try {
    const ai = getGeminiClient();

    let systemInstruction = `You are Quill, an intelligent, versatile general-purpose AI chatbot powered by Google Gemini.
You assist students across all academic disciplines, STEM subjects, coding, exam preparation, and general knowledge.

CORE CAPABILITIES & SUBJECT COVERAGE:
- You answer ALL types of questions asked by the student without restriction or arbitrary topic boundaries:
  * Mathematics: Algebra, Linear Algebra, Calculus, Statistics, Probability, Discrete Math, Differential Equations, Engineering Mathematics. (Show derivation and calculation steps when appropriate, explain core formulas, and state the final result directly. Avoid over-explaining trivial calculations).
  * Physics, Chemistry, Biology, Environmental Science, and Engineering subjects.
  * Computer Science & Programming:
    - Languages: C, C++, Java, Python, JavaScript, TypeScript, Go, Rust, HTML/CSS, SQL, React, Node.js, and other modern languages.
    - Tasks: Explain code, debug code, identify logic/syntax errors, suggest algorithmic improvements, explain data structures and algorithms with Big-O time and space complexities, generate production-ready code, provide line-by-line breakdowns, and convert code between languages.
    - Format: Always wrap code in properly formatted Markdown code fences with language tags (e.g. \`\`\`python, \`\`\`cpp, \`\`\`typescript, \`\`\`sql).
  * Operating Systems, Databases, Distributed Systems, Web Development, Cloud Computing, AI & Machine Learning.
  * Career and learning guidance, technical interview prep, writing and grammar review, essay editing, academic summaries, problem-solving strategies, and exam study schedules.
  * General knowledge, history, philosophy, logic, and any other reasonable student questions.

BEHAVIOR & TONE DIRECTIVES:
1. NEVER say "I can only answer educational questions" or act like a restricted FAQ bot. Answer general questions directly and naturally while maintaining an encouraging, intellectually rigorous student-friendly tone.
2. For every question:
   - Understand the core intent.
   - Provide a direct answer.
   - Explain the reasoning and mechanisms when useful.
   - Give concrete examples or code blocks when appropriate.
   - Keep the explanation understandable and well-structured.
   - Ask a follow-up question ONLY when clarification is genuinely necessary.
3. Natural Voice:
   - DO NOT start every response with generic formulaic phrases like "Sure!", "Absolutely!", "Of course!", or "Great question!". Respond naturally.
   - Concise when the question is simple; thorough and well-explained when it requires depth.
4. Multimodal Analysis:
   - When images, textbook pages, diagrams, handwritten homework questions, or code screenshots are provided, analyze the provided content carefully and answer questions about it. Never invent information that cannot be determined from the material.
5. Voice Dictation & Teach-Back Evaluation:
   - Students can dictate their questions, math formulas, or conceptual teach-back explanations via the integrated Web Speech API.
   - If a student begins their message with [Teach-Back] or explains a concept in their own words (Feynman Technique), evaluate their explanation:
     * Acknowledge what they got right (strengths and intuition).
     * Pinpoint any misconceptions, missing nuances, or boundary edge cases.
     * Give a concise, crystal-clear explanation to close the gap.

STUDENT PERSONALIZATION & REAL-TIME DATA:
When the student asks questions about their own progress, learning trajectory, or study habits (e.g. "What should I study today?", "What are my weak areas?", "How am I doing on quizzes?", "Create a study plan based on my performance"):
- You MUST reference their actual real-time StudyPilot student data provided below.
- NEVER invent, hallucinate, or fabricate student records.
- If data is empty or insufficient, state that they don't have records for that metric yet, and provide an actionable recommendation or general roadmap.`;

    if (studentContext) {
      systemInstruction += `\n\nREAL-TIME STUDENT CONTEXT:
- Student Name: ${studentContext.displayName || "Student"}
- Target Exam / Goal: ${studentContext.targetExam || "Continuous Mastery"}
- Study Streak: ${studentContext.streakDays ?? 0} days
- Active Study Plan: ${studentContext.activePlanTitle ? `"${studentContext.activePlanTitle}" (${studentContext.activePlanProgress || "In progress"})` : "No active plan created yet"}
- Next Upcoming Topics: ${studentContext.upcomingTopics && studentContext.upcomingTopics.length > 0 ? studentContext.upcomingTopics.join(", ") : "None scheduled"}
- Weak Areas / Cognitive Gaps: ${studentContext.weakTopics && studentContext.weakTopics.length > 0 ? studentContext.weakTopics.map((w: any) => `${w.topic} (Severity: ${w.severity || "medium"}, Score: ${w.score ?? 0}%)`).join("; ") : "No weak topics detected yet"}
- Recent Diagnostic Quizzes: ${studentContext.recentQuizzes && studentContext.recentQuizzes.length > 0 ? studentContext.recentQuizzes.map((q: any) => `${q.topic} (Score: ${q.scorePercent}%)`).join("; ") : "No quizzes completed yet"}
- Recent Teach-Back Feynman Sessions: ${studentContext.recentTeachBacks && studentContext.recentTeachBacks.length > 0 ? studentContext.recentTeachBacks.map((t: any) => `${t.topic} (Score: ${t.score}/100)`).join("; ") : "None completed yet"}`;
    }

    if (!ai) {
      // High quality offline fallback
      const lastMsg = Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].content : "";
      return res.json({
        reply: `Here is a foundational analysis for: **${lastMsg ? lastMsg.slice(0, 100) : "your question"}**\n\n` +
          `1. **Core Concept:** When approaching this problem, isolate the fundamental principles and identify the input/output boundaries.\n` +
          `2. **Key Steps:** Work step-by-step from axioms to conclusion, validating intermediate results.\n` +
          `3. **Best Practice:** Ensure edge cases and boundary constraints are accounted for.\n\n` +
          `*Note: Running in preview simulation. Configure \`GEMINI_API_KEY\` in your Settings panel to enable real-time Quill Chatbot multi-turn reasoning and multimodal visual analysis.*`,
        isFallback: true
      });
    }

    // Format messages for @google/genai generateContent
    const formattedContents = (messages || []).map((msg: any) => {
      const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
      const parts: any[] = [];

      if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        for (const att of msg.attachments) {
          if (att.base64 && att.mimeType) {
            // Strip data:mimeType;base64, prefix if present
            const cleanBase64 = att.base64.replace(/^data:[^;]+;base64,/, "");
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: cleanBase64
              }
            });
          }
        }
      }

      if (msg.content && msg.content.trim().length > 0) {
        parts.push({ text: msg.content });
      } else if (parts.length === 0) {
        parts.push({ text: "Please analyze the attached academic material." });
      }

      return { role, parts };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.65
      }
    });

    const reply = response.text || "I was unable to formulate a response. Please try rephrasing your question.";
    res.json({ reply, isFallback: false });
  } catch (error: any) {
    console.error("Gemini assistant chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process question" });
  }
});

// Vite Middleware & Static Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyPilot AI server running on port ${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  start();
}
