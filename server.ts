import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client helper to prevent startup failures when key is not present
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured in the platform's Environment Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// OpenRouter fallback client helper with flipped variables safeguard
let openRouterDisabledGlobally = false;

function getOpenRouterConfig() {
  if (openRouterDisabledGlobally) {
    return { apiKey: "", model: "google/gemini-2.5-flash", isConfigured: false };
  }

  let apiKey = process.env.OPENROUTER_API_KEY || "";
  let model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  const isModelKey = model.startsWith("sk-or-") || model.startsWith("sk-");
  const isApiKeyKey = apiKey.startsWith("sk-or-") || apiKey.startsWith("sk-");

  // If they are flipped (the model variable contains the API key, and api key doesn't have it)
  if (isModelKey && !isApiKeyKey) {
    const temp = apiKey;
    apiKey = model;
    model = temp || "google/gemini-2.5-flash";
  }

  // Double check: if model contains "sk-" even after swapping, reset to default
  if (!model || model.startsWith("sk-or-") || model.startsWith("sk-")) {
    model = "google/gemini-2.5-flash";
  }

  const isConfigured = !!apiKey && (apiKey.startsWith("sk-or-") || apiKey.startsWith("sk-"));

  return { apiKey, model, isConfigured };
}

async function callOpenRouter(systemPrompt: string, userMessages: any[], jsonMode = false) {
  const config = getOpenRouterConfig();
  if (!config.isConfigured) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const appUrl = process.env.APP_URL || "https://ai.studio/build";

  const messages = [
    { role: "system", content: systemPrompt },
    ...userMessages.map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content
    }))
  ];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${config.apiKey}`,
    "HTTP-Referer": appUrl,
    "X-Title": "Final Semester Transformation Tracker"
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: jsonMode ? 0.3 : 0.7,
      max_tokens: 2000,
      response_format: jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API failed (${response.status}): ${errText}`);
  }

  const result = await response.json();
  let text = result.choices?.[0]?.message?.content || "";

  if (jsonMode) {
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.substring(7);
    } else if (text.startsWith("```")) {
      text = text.substring(3);
    }
    if (text.endsWith("```")) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim();
  }

  return text;
}

// 1. AI Mentor Conversations
// Persona choices: Career Coach, Exam Mentor, English Teacher, Fitness Coach, Productivity Expert, Accountability Partner
app.post("/api/mentor", async (req, res) => {
  try {
    const { messages, persona } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid parameters. 'messages' must be an array of chat history." });
    }

    const systemPrompt = `You are an elite, highly demand personal life optimization mentor and specialist acting as: [${persona || "Career Coach & Personal Mentor"}].
Your absolute focus is guiding the user through their strict 12-Month Life Transformation plan.
The user is a Bachelor of Computer Applications (BCA) student in their final semester.
Their primary goals:
1. Crack government exams (RRB NTPC, Banking exams).
2. Gain elite credentials as a Full Stack Web Developer and Generative AI Automation Developer.
3. Rapidly make progress on spoken English fluency, personal grooming, confidence and fitness metrics.

Ensure your responses are highly custom, actionable, direct, and encouraging. Never sound like a generic chatbot. Cite technical topics (e.g. Linux terminals, React hooks, mathematical quant questions) when relevant. Keep your advice focused on deep, focused work blocks, with no fluff or filler.`;

    // Try routing through OpenRouter if key is present with a safe native fallback if the OpenRouter call fails (e.g. credit limit reached)
    const openRouter = getOpenRouterConfig();
    if (openRouter.isConfigured) {
      try {
        console.log(`[OpenRouter] Routing chat message using model: ${openRouter.model}`);
        const text = await callOpenRouter(systemPrompt, messages, false);
        return res.json({ text });
      } catch (orErr) {
        openRouterDisabledGlobally = true;
        console.log(`[Router Status] Transitioned chat processing cleanly to native model.`);
      }
    }

    // Default fallback to Gemini
    const ai = getAiClient();
    // Convert messages to contents parameter suitable for gemini-3.5-flash
    // Format: content is array of strings or parts
    const latestMessage = messages[messages.length - 1];
    const previousHistory = messages.slice(0, -1).map((m: any) => {
      return `${m.role === "user" ? "User" : "Mentor"}: ${m.content}`;
    }).join("\n");

    const prompt = `Here is our conversation history:\n${previousHistory}\n\nUser: ${latestMessage.content}\n\nMentor response:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Mentor API Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong in the AI pipeline." });
  }
});

// 2. ATS Resume Auditer
app.post("/api/evaluate-resume", async (req, res) => {
  try {
    const { resumeData } = req.body;
    const ai = getAiClient();

    const prompt = `Analyze the following applicant resume details and evaluate how ATS-friendly it is for tech (Full Stack / AI Engineer) and government sector jobs.
Provide your evaluation in a strictly valid JSON format.

Resume details to analyze:
${JSON.stringify(resumeData)}

The JSON schema must be strictly adhered to:
{
  "atsScore": number (value between 1 and 100),
  "missingKeywords": string[] (list of 4-6 crucial industry keywords missing or weak from their resume),
  "improvementSuggestions": string[] (3-5 highly actionable, practical edit guidelines)
}
Return only the json block, do not include markdown blocks or wrappers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.INTEGER, description: "A score from 1 to 100" },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Missing keywords" },
            improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Direct suggestions" }
          },
          required: ["atsScore", "missingKeywords", "improvementSuggestions"]
        },
        temperature: 0.2,
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Resume evaluation API Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume details." });
  }
});

// 2.5 AI Resume Document Parser
app.post("/api/parse-resume", async (req, res) => {
  try {
    const { fileBase64, mimeType, rawText } = req.body;
    const ai = getAiClient();

    let contents: any[] = [];
    let basePrompt = `You are an elite, professional resume extraction engine.
Extract all structured user details from this resume document or text and map them exactly to the requested JSON schema.
Ensure NO fake or hallucinatory information is inserted. Fill empty fields with empty strings/arrays if not present.
Ensure educational track details and project listings are represented accurately in experience or education.
Keep bullet points punchy and professional. Use active verbiage.`;

    if (fileBase64 && mimeType) {
      contents = [
        {
          inlineData: {
            data: fileBase64,
            mimeType: mimeType
          }
        },
        basePrompt
      ];
    } else if (rawText) {
      contents = [
        `${basePrompt}\n\nHere is the raw resume text:\n\n${rawText}`
      ];
    } else {
      return res.status(400).json({ error: "Missing resume payload. Upload fileBase64+mimeType OR send rawText." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING, description: "Applicant's full name" },
            email: { type: Type.STRING, description: "Contact email" },
            phone: { type: Type.STRING, description: "Contact phone number" },
            linkedin: { type: Type.STRING, description: "LinkedIn handle/profile" },
            github: { type: Type.STRING, description: "GitHub profile url" },
            education: { type: Type.STRING, description: "Academic qualifications summary text" },
            skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Comma-separated or list of core technical skills" },
            certifications: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Certifications and courses" },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["company", "role", "duration", "bulletPoints"]
              }
            }
          },
          required: ["fullName", "email", "phone", "linkedin", "github", "education", "skills", "certifications", "experience"]
        },
        temperature: 0.1,
      }
    });

    const parsedResume = JSON.parse(response.text || "{}");
    res.json(parsedResume);
  } catch (error: any) {
    console.error("Resume Parsing API Error:", error);
    res.status(500).json({ error: error.message || "Could not parse files using AI pipeline backend." });
  }
});

// 3. Project Builder & Metadata Catalyst
app.post("/api/generate-project", async (req, res) => {
  try {
    const { track, level } = req.body; // e.g. 'Full Stack' / 'Generative AI'
    const ai = getAiClient();

    const prompt = `Generate a modern, highly valuable portfolio project idea for a BCA Final Semester student targeting a '${track}' outcome.
The complexity level is '${level || "Intermediate"}'.
The project should sound professional, solve a real-world problem, and show off modern tech.

Return your response in a strictly valid JSON schema with zero formatting escape characters:
{
  "title": "Clear, professional name for the project",
  "problemStatement": "What business or user gap does this project solve?",
  "techStack": "List of 4-6 specific libraries/frameworks used",
  "documentation": "A beautiful 3-paragraph markdown configuration guide explaining architecture, API routing, and DB models",
  "resumePoints": [
    "ATS-tailored resume point 1",
    "ATS-tailored resume point 2",
    "ATS-tailored resume point 3"
  ],
  "linkedInPost": "An engaging, high-growth LinkedIn post promoting completion of this project with hashtags"
}
Return only the raw json, do not wrap in markdown tags.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            problemStatement: { type: Type.STRING },
            techStack: { type: Type.STRING },
            documentation: { type: Type.STRING },
            resumePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            linkedInPost: { type: Type.STRING }
          },
          required: ["title", "problemStatement", "techStack", "documentation", "resumePoints", "linkedInPost"]
        },
        temperature: 0.7,
      },
    });

    const projectData = JSON.parse(response.text || "{}");
    res.json(projectData);
  } catch (error: any) {
    console.error("Project generator API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate project specifications." });
  }
});

// 4. Spoken English & Pronunciation Assist Coach
app.post("/api/english-coach", async (req, res) => {
  try {
    const { userInput, mode, base64Audio } = req.body; // mode: 'Conversation' | 'Interview-HR' | 'Interview-Technical' | 'Interview-Gov'

    let systemInstruction = "";
    if (mode === "Conversation") {
      systemInstruction = "You are a warm, supportive English Teacher. Maintain a light, encouraging daily conversation. After each reply, provide a quick 'Better Wording' summary to help them sound more natural.";
    } else {
      systemInstruction = `You are a strict, professional hiring manager conducting a mock [${mode}] interview. Ask clear, realistic questions. Provide immediate structural critiques on how the candidate can refine their answer (e.g. grammar, vocabulary level) and offer an upgraded native speaker version of their input response.`;
    }

    const promptText = `Input response to evaluate:\n"${userInput}"\n\nAnalyze and return a direct JSON with details:
      {
        "mentorReply": "Your conversational or diagnostic reply",
        "betterWording": "An upgraded, elegant, natural native version of what the user wrote",
        "vocabularyExpansion": ["Word1 - synonym definition", "Word2 - synonym definition"],
        "pronunciationTip": "A constructive, tailored phonetic tip on how they would articulate this statement naturally (e.g. blending or intonation)"
      }`;

    // Routing English Coach through OpenRouter if API key exists with a safe native fallback if the OpenRouter call fails (e.g. credit limit reached)
    const openRouter = getOpenRouterConfig();
    if (openRouter.isConfigured) {
      try {
        console.log(`[OpenRouter] Routing English Coach via model: ${openRouter.model}`);
        const responseText = await callOpenRouter(systemInstruction, [{ role: "user", content: promptText }], true);
        const parsedFeedback = JSON.parse(responseText || "{}");
        return res.json(parsedFeedback);
      } catch (orErr) {
        openRouterDisabledGlobally = true;
        console.log(`[Router Status] Transitioned English Coach cleanly to native model.`);
      }
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mentorReply: { type: Type.STRING },
            betterWording: { type: Type.STRING },
            vocabularyExpansion: { type: Type.ARRAY, items: { type: Type.STRING } },
            pronunciationTip: { type: Type.STRING }
          },
          required: ["mentorReply", "betterWording", "vocabularyExpansion", "pronunciationTip"]
        },
        temperature: 0.6,
      },
    });

    const parsedFeedback = JSON.parse(response.text || "{}");
    res.json(parsedFeedback);
  } catch (error: any) {
    console.error("English Coach Error:", error);
    res.status(500).json({ error: error.message || "Spoken English assistant failed to respond." });
  }
});

// 5. Smart Time Allocation and Accountability Audit
app.post("/api/chat-accountability", async (req, res) => {
  try {
    const { priorities, completed, missed, whyMissed } = req.body;

    const systemPrompt = "You are a professional, highly analytical, strict academic and productivity accountability mentor specializing in auditing schedules for student exam prep.";

    const promptText = `Audit the user's daily progress and generate a highly custom report.

Input metrics:
- Todays Priorities: ${priorities}
- Successfully Completed: ${completed}
- Missed Targets: ${missed}
- Reasons given: ${whyMissed}

Output a strictly formatted JSON report with no wrapper text:
{
  "productivityScore": number (value 1 to 100),
  "consistencyScore": number (value 1 to 100),
  "recoveryPlan": "A concrete 3-step actionable schedule recovery plan addressing reasons for missed work (keep it highly direct, practical for a student), no fluff",
  "mentorCritique": "A brief, solid, high-impact mentor advice summarizing today's performance"
}`;

    // Try routing via OpenRouter if key is present with a safe native fallback if the OpenRouter call fails (e.g. credit limit reached)
    const openRouter = getOpenRouterConfig();
    if (openRouter.isConfigured) {
      try {
        console.log(`[OpenRouter] Routing Accountability Audit via model: ${openRouter.model}`);
        const responseText = await callOpenRouter(systemPrompt, [{ role: "user", content: promptText }], true);
        const parsedAudit = JSON.parse(responseText || "{}");
        return res.json(parsedAudit);
      } catch (orErr) {
        openRouterDisabledGlobally = true;
        console.log(`[Router Status] Transitioned Accountability Audit cleanly to native model.`);
      }
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productivityScore: { type: Type.INTEGER },
            consistencyScore: { type: Type.INTEGER },
            recoveryPlan: { type: Type.STRING },
            mentorCritique: { type: Type.STRING }
          },
          required: ["productivityScore", "consistencyScore", "recoveryPlan", "mentorCritique"]
        },
        temperature: 0.5,
      },
    });

    const parsedAudit = JSON.parse(response.text || "{}");
    res.json(parsedAudit);
  } catch (error: any) {
    console.error("Accountability Audit Error:", error);
    res.status(500).json({ error: error.message || "Failed to audit daily schedule." });
  }
});

// 5. BCA notes summarizer fallback to OpenRouter/Gemini
app.post("/api/bca-summarize", async (req, res) => {
  try {
    const { notesText } = req.body;
    if (!notesText || typeof notesText !== "string" || !notesText.trim()) {
      return res.status(400).json({ error: "Syllabus/Notes text is empty." });
    }

    const systemPrompt = `You are an elite BCA (Bachelor of Computer Applications) professor and curriculum auditor.
Analyze the user's study notes and generate a highly structured 5-point summary and 3 potential exam questions.
You must return only JSON matching this schema:
{
  "summaryPoints": [
    "Point 1...",
    "Point 2...",
    "Point 3...",
    "Point 4...",
    "Point 5..."
  ],
  "examQuestions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ]
}
Make sure points are detailed, technical, dynamic and informative. Questions should match university semester standards. Do not output any markdown code blocks surrounding the JSON, or output valid parsable JSON directly.`;

    const promptText = `Pasted study notes to analyze:\n\n"${notesText}"`;

    const openRouter = getOpenRouterConfig();
    if (openRouter.isConfigured) {
      try {
        console.log(`[OpenRouter] Routing BCA Summarize via model: ${openRouter.model}`);
        const responseText = await callOpenRouter(systemPrompt, [{ role: "user", content: promptText }], true);
        const parsed = JSON.parse(responseText || "{}");
        return res.json(parsed);
      } catch (orErr) {
        openRouterDisabledGlobally = true;
        console.log(`[Router Status] Transitioned BCA Summarize cleanly to native model.`);
      }
    }

    // Fallback to Gemini API if OpenRouter key is not specified
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            examQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summaryPoints", "examQuestions"]
        },
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);

  } catch (error: any) {
    console.error("BCA Summarizer Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze bca study notes." });
  }
});

// Integrate Vite middleware in development or serve static distribution files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on http://localhost:${PORT}`);
  });
}

startServer();
