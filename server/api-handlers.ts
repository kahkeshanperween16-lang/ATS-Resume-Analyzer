
import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { extractTextFromPDFBuffer } from "./pdf-extractor";
import { analyzeResume } from "./ats-engine";

const supabaseAuth = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function authenticateRequest(req: Request, res: Response) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }

  const token = authorization.slice(7);

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired session" });
      return false;
    }

    return true;
  } catch {
    res.status(401).json({ error: "Authentication failed" });
    return false;
  }
}

export async function handleFileUpload(req: any, res: Response) {
  try {
    if (!(await authenticateRequest(req, res))) return;

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = req.file;

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return res.status(400).json({ error: "File size exceeds 10MB limit" });
    }

    const fileKey = `resumes/${Date.now()}-${file.originalname}`;
    const fileUrl = `local://${fileKey}`;

    const rawText = await extractTextFromPDFBuffer(file.buffer);

    return res.json({
      fileKey,
      fileUrl,
      rawText,
    });
  } catch (error) {
    console.error("File upload error:", error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "File upload failed",
    });
  }
}

export async function handleAnalysis(req: Request, res: Response) {
  try {
    if (!(await authenticateRequest(req, res))) return;

    const { resumeText, roleKey } = req.body;

    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const analysis = analyzeResume(resumeText, roleKey);

    return res.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Analysis failed",
    });
  }
}
