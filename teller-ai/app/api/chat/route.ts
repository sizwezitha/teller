import { NextResponse } from "next/server";
import { callTellerAI } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required." },
        { status: 400 }
      );
    }

    // If the client sent a model override, set it for this request
    if (model) {
      // temporarily allow passing model via env for the library call
      process.env.AI_MODEL = model;
    }

    const reply = await callTellerAI(messages);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
