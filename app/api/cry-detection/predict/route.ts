import { NextRequest, NextResponse } from "next/server";

const cleanUrl = (url: string) => url.replace(/\/$/, "");

export async function POST(request: NextRequest) {
    try {
        const CRY_DETECTION_API_URL = process.env.CRY_DETECTION_API_URL || "http://localhost:8000";
        const CRY_DETECTION_API_KEY = process.env.CRY_DETECTION_API_KEY || "dev-api-key-change-in-production";

        const formData = await request.formData();
        const audioFile = formData.get("audio") as File;

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        const targetUrl = `${cleanUrl(CRY_DETECTION_API_URL)}/api/v1/predict/`;

        console.log(`[Predict] Forwarding to: ${targetUrl}`);
        console.log(`[Predict] Using Key: ${CRY_DETECTION_API_KEY.substring(0, 3)}... (len: ${CRY_DETECTION_API_KEY.length})`);

        const externalFormData = new FormData();
        // The backend views.py expects 'audio' field for the REST API
        externalFormData.append("audio", audioFile, "recording.wav");

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "X-API-KEY": CRY_DETECTION_API_KEY,
            },
            body: externalFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Predict] Backend Error (${response.status}): ${errorText}`);

            return NextResponse.json(
                {
                    error: response.status === 401 ? "Backend Authentication Failed" : "Backend API Error",
                    status: response.status,
                    details: errorText
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Predict route error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
