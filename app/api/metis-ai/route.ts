import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FASTROUTER_BASE_URL = "https://api.fastrouter.ai/api/v1";
const MODEL = "google/gemini-3-flash-preview";

// SYSTEM PROMPT
const METIS_AI_SYSTEM_PROMPT = `You are "MetisAI", the core intelligence of Metis — a next-generation clinical and maternal health platform. 
You are an Agentic Health Specialist. You don't just talk; you perform tasks.

IDENTITY & MISSION:
- You are multilingual. Respond in the language the user uses.
- You have direct access to the Metis database via tools. 
- NEVER ask the user for data that you can find yourself. If a user asks "How is my baby doing?", check for patients first, then check their growth and nutrition logs.
- You follow WHO and pediatric standards for clinical advice.
- You are empathetic but precise, professional, and efficient.

OPERATIONAL RULES:
1. **Tool First**: Before asking a question, use tools to get context.
2. **Action Oriented**: If a user says "I just fed Sarah 200ml of milk", log it immediately using tools. Don't just say "Okay".
3. **Data Context**: Always identify the 'Patient' involved. If the user has multiple patients (e.g., two children), and it's unclear, ask for clarification.
4. **History**: You store chat history automatically in the database.
5. **No Hallucinations**: If data isn't in the database, say so. If a clinical assessment is needed (like malnutrition), recommend using the specialized scan tools in the dashboard.

VACCINATION LOGIC:
- Use 'get_vaccinations' to see what's done and what's pending.
- The schedule is Birth to 18 months.

NUTRITION & GROWTH:
- You calculated nutritional targets based on patient age and gender.
- You track caloric velocity.

Always return a helpful, concise, and professional response.`;

// TOOL DEFINITIONS
const TOOLS = [
  {
    name: "get_patients",
    description: "Get a list of all patients/children enrolled under the user's account.",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "enroll_patient",
    description: "Enroll a new patient or child profile.",
    parameters: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        dob: { type: "string", description: "Date of birth (YYYY-MM-DD)" },
        gender: { type: "string", enum: ["Male", "Female", "Other"] },
        initial_weight: { type: "string", description: "Current weight in kg" },
        initial_height: { type: "string", description: "Current height in cm" },
        relationship_type: { type: "string", enum: ["self", "child", "patient", "subject"] }
      },
      required: ["full_name", "dob", "gender", "relationship_type"]
    }
  },
  {
    name: "log_nutrition",
    description: "Log a food item for a specific patient.",
    parameters: {
      type: "object",
      properties: {
        patient_id: { type: "string", description: "The UUID of the patient" },
        meal_type: { type: "string", enum: ["Breakfast", "Lunch", "Dinner", "Snacks", "Supplements"] },
        food_name: { type: "string" },
        quantity: { type: "string" },
        calories: { type: "number" },
        protein: { type: "number" },
        carbs: { type: "number" },
        fats: { type: "number" }
      },
      required: ["patient_id", "meal_type", "food_name", "quantity"]
    }
  },
  {
    name: "get_nutrition_history",
    description: "Retrieve recent nutrition logs for a patient.",
    parameters: {
      type: "object",
      properties: {
        patient_id: { type: "string" },
        limit: { type: "number", default: 10 }
      },
      required: ["patient_id"]
    }
  },
  {
    name: "log_growth",
    description: "Log weight and height for a patient.",
    parameters: {
      type: "object",
      properties: {
        patient_id: { type: "string" },
        weight: { type: "number" },
        height: { type: "number" }
      },
      required: ["patient_id", "weight"]
    }
  },
  {
    name: "get_growth_history",
    description: "Retrieve growth logs (weight/height over time) for a patient.",
    parameters: {
      type: "object",
      properties: {
        patient_id: { type: "string" }
      },
      required: ["patient_id"]
    }
  },
  {
    name: "get_vaccinations",
    description: "Get the vaccination schedule and completion status for a patient.",
    parameters: {
      type: "object",
      properties: {
        patient_id: { type: "string" }
      },
      required: ["patient_id"]
    }
  },
  {
    name: "mark_vaccination_done",
    description: "Mark a specific vaccine as completed for a patient.",
    parameters: {
      type: "object",
      properties: {
        patient_id: { type: "string" },
        vaccine_id: { type: "string", description: "e.g. 'bcg-birth', 'dtp-6w'" }
      },
      required: ["patient_id", "vaccine_id"]
    }
  }
];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { messages, patientId, sessionId } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.FASTROUTER_API_KEY;

  async function executeTool(name: string, args: any) {
    console.log(`Executing tool: ${name}`, args);
    switch (name) {
      case "get_patients":
        return await supabase.from("patients").select("*").eq("owner_id", user!.id);
      
      case "enroll_patient":
        return await supabase.from("patients").insert({ ...args, owner_id: user!.id }).select().single();
      
      case "log_nutrition":
        return await supabase.from("nutrition_logs").insert({ ...args, profile_id: user!.id }).select();
      
      case "get_nutrition_history":
        return await supabase.from("nutrition_logs").select("*").eq("patient_id", args.patient_id).order("logged_at", { ascending: false }).limit(args.limit || 10);
      
      case "log_growth":
        return await supabase.from("growth_logs").insert({ ...args, profile_id: user!.id }).select();
      
      case "get_growth_history":
        return await supabase.from("growth_logs").select("*").eq("patient_id", args.patient_id).order("logged_at", { ascending: false });
      
      case "get_vaccinations":
        // This is complex because we need to merge the schedule with logs
        // For simplicity in the agent response, let's just return the logs and the patient's dob
        const [p, logs] = await Promise.all([
          supabase.from("patients").select("dob").eq("id", args.patient_id).single(),
          supabase.from("vaccination_logs").select("*").eq("patient_id", args.patient_id)
        ]);
        return { dob: p.data?.dob, completed: logs.data };

      case "mark_vaccination_done":
        return await supabase.from("vaccination_logs").upsert({
          profile_id: user!.id,
          patient_id: args.patient_id,
          vaccine_id: args.vaccine_id,
          status: "completed",
          completed_at: new Date().toISOString()
        }).select();

      default:
        return { error: "Tool not found" };
    }
  }

  try {
    let currentMessages = [{ role: "system", content: METIS_AI_SYSTEM_PROMPT }, ...messages];
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      const response = await fetch(`${FASTROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          messages: currentMessages,
          tools: TOOLS.map(t => ({ type: "function", function: t })),
          tool_choice: "auto"
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[MetisAI] API error (Attempt ${attempts}):`, errText);
        return NextResponse.json({ content: `⚠️ Metis is having trouble connecting to the brain (Status: ${response.status}).` });
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message;

      if (!message) {
        return NextResponse.json({ content: "⚠️ Metis received an empty signal. Please try asking again." });
      }

      currentMessages.push(message);

      if (!message.tool_calls) {
        // We have a final response
        try {
          const userMsg = messages[messages.length - 1].content;
          await supabase.from("chat_messages").insert([
            { profile_id: user.id, patient_id: patientId || null, role: "user", content: userMsg, session_id: sessionId },
            { profile_id: user.id, patient_id: patientId || null, role: "assistant", content: message.content || "", session_id: sessionId }
          ]);
        } catch (e) {
          console.error("[MetisAI] DB log error:", e);
        }
        return NextResponse.json(message);
      }

      // Handle Tool Calls
      console.log(`[MetisAI] Attempt ${attempts}: Calling ${message.tool_calls.length} tools`);
      for (const toolCall of message.tool_calls) {
        let result;
        try {
          result = await executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));
        } catch (e) {
          result = { error: "Execution failed" };
        }
        currentMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(result)
        });
      }
    }

    return NextResponse.json({ content: "⚠️ Metis spent too much time thinking. Please simplify your request." });
  } catch (err: any) {
    console.error("MetisAI Agent Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
