import { NextRequest, NextResponse } from "next/server";

// FastRouter API configuration - using Gemini 3 Flash only
const FASTROUTER_API_URL = "https://go.fastrouter.ai/api/v1/chat/completions";
const GEMINI_MODEL = "google/gemini-3-flash-preview";

interface ClassifyRequest {
    transcription?: string;
    audioDescription?: string;
    hasSoundDetected?: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as ClassifyRequest;
        const { transcription } = body;

        const apiKey = process.env.FASTROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "FastRouter API key not configured" },
                { status: 500 }
            );
        }

        // Logic Simplification:
        // 1. If clear transcription exists -> Check if it's Adult Speech
        // 2. If NO transcription (or unclear) -> ALWAYS assume Baby Cry and proceed to analysis

        const hasTranscription = transcription && transcription.trim().length > 3;

        // Only use LLM if we actually have words to analyze
        if (hasTranscription) {
            const response = await fetch(FASTROUTER_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: GEMINI_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: "You are an audio classification AI. Respond with ONLY valid JSON."
                        },
                        {
                            role: "user",
                            content: `Analyze this transcription and determine if it is ADULT SPEECH.

TRANSCRIPTION: "${transcription}"

RULES:
- If it contains recognizable words, sentences, or adult speech patterns → "adult"
- If it looks like baby vocalizations (wah, neh, goo, random syllables) → "baby"
- If unclear or empty → "baby" (default to baby)

Respond ONLY with this JSON:
{"classification": "adult", "confidence": 0.9, "description": "Detected adult speech"}`
                        },
                    ],
                    temperature: 0.1,
                    max_tokens: 100,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                const textResponse = result.choices?.[0]?.message?.content || "";

                try {
                    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);

                        // Only return "adult" if the LLM is confident it's adult speech
                        if (parsed.classification === "adult") {
                            return NextResponse.json({
                                classification: "adult",
                                confidence: parsed.confidence || 0.9,
                                description: parsed.description || "Adult speech detected",
                            });
                        }
                    }
                } catch {
                    console.log("Could not parse LLM response, proceeding to analysis");
                }
            }
        }

        // DEFAULT BEHAVIOR:
        // If no adult speech detected (or no transcription), ALWAYS proceed to Cry Analysis
        // We no longer return "noise" or "silence" - we let the ML model decide
        return NextResponse.json({
            classification: "baby",
            confidence: 1.0,
            description: "Proceeding to cry analysis",
        });

    } catch (error) {
        console.error("Error in classify route:", error);
        // Even on error, safe default is to let the user try analysis
        return NextResponse.json({
            classification: "baby",
            confidence: 1.0,
            description: "Proceeding to cry analysis (fallback)",
        });
    }
}
