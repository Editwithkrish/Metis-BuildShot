import { NextRequest, NextResponse } from "next/server";

const FASTROUTER_BASE_URL = "https://api.fastrouter.ai/api/v1";
const MODEL = "google/gemini-3.1-flash-lite-preview";

const SYSTEM_PROMPT = `You are a clinical AI assistant specialised in paediatric and maternal nutrition assessment.
You will receive a photo. Your task is to assess whether malnutrition indicators are visible.

You MUST respond with ONLY a valid JSON object — no markdown, no explanation, no preamble.
The JSON schema is:
{
  "status": "Detected" | "Borderline" | "Not Detected",
  "confidence": "<number>%",
  "urgency": "High" | "Medium" | "Low",
  "indicators": ["...", "...", "..."],
  "details": "<one-sentence clinical trace>"
}

Rules:
- "status" is "Detected" when clear SAM/MAM signs are present, "Borderline" when mild or uncertain, "Not Detected" otherwise.
- "confidence" is your confidence in the classification (e.g. "82%").
- "urgency" maps directly: Detected→High, Borderline→Medium, Not Detected→Low.
- "indicators" lists up to 4 visible clinical signs observed (or "No visible malnutrition markers" if none).
- "details" is a one-sentence WHO-aligned clinical trace.
- If the image is not a person or too blurry to assess, set status to "Not Detected" and explain in details.`;

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl, mimeType } = await req.json();

    if (!imageDataUrl) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.FASTROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "FastRouter API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${FASTROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 512,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please assess this image for malnutrition indicators and respond with the JSON schema only.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl, // already a data:image/<type>;base64,... URL
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("FastRouter error:", err);
      return NextResponse.json(
        { error: `FastRouter API error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    // Strip any accidental markdown code fences
    const cleaned = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Model returned non-JSON response", raw },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Malnutrition detect error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
