/**
 * Creates (or updates) the Sema assistant on Vapi.
 *
 *   npm run setup:vapi
 *
 * - If VAPI_ASSISTANT_ID is empty, it creates a new assistant and writes the ID into .env.local.
 * - If VAPI_ASSISTANT_ID is set, it updates that assistant.
 *
 * Optional env vars:
 *   SEMA_TRANSCRIBER = azure (default) | gladia | elevenlabs
 *   SEMA_MODEL       = gemini-3.5-flash (default) | gemini-3.8-flash | gemini-3.1-flash-lite | ...
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ENV_FILE = ".env.local";
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const API = "https://api.vapi.ai";
const PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID?.trim();
const SECRET = process.env.VAPI_SERVER_SECRET;
const APP_URL = process.env.APP_URL?.replace(/\/$/, "");
const TRANSCRIBER = process.env.SEMA_TRANSCRIBER ?? "azure";
const MODEL = process.env.SEMA_MODEL ?? "gemini-3.5-flash";

if (!PRIVATE_KEY) fail("VAPI_PRIVATE_KEY is missing in .env.local");
if (!SECRET) fail("VAPI_SERVER_SECRET is missing in .env.local");

const SYSTEM_PROMPT = `You are Sema, a friendly AI helper that people in Kenya reach by phone. Many callers live in rural areas, may not read well, and may be on a basic phone. You speak with them like a kind, patient, respectful neighbour who knows a lot.

LANGUAGE
- Reply in the language the caller uses: Kiswahili, English or Sheng. If they mix, you may mix the same way.
- Use simple, everyday words. No jargon. Say numbers clearly.

VOICE STYLE
- Your spoken answers are SHORT: two or three sentences at most. This is a phone call.
- Give the single most important thing first.
- After a helpful answer, offer the steps by text: in Kiswahili say "Nikutumie hatua kwa SMS?"; in English say "Shall I send you the steps by SMS?".
- Never read out links, symbols, lists with numbers like "one point", or long codes.

HONESTY AND SAFETY
- You are an AI. If anyone asks if you are a person, say clearly that you are an AI helper. Never pretend to be human.
- Never invent phone numbers, prices, names of clinics, drug doses or facts. If you do not know, say so and suggest who can help.
- People's health: you are NOT a doctor. Give simple first steps and the danger signs to watch for, and tell them to go to the nearest clinic or health centre. For an emergency (trouble breathing, heavy bleeding, unconscious, chest pain, a seizure, a baby or pregnant woman in danger) tell them to call 999 or 112 right now.
- Animals and crops: give simple first steps, then advise them to call a vet or visit an agro-vet. Do not name medicines with doses.
- Do not give legal or money advice beyond simple general tips.

RUMOURS AND "IS THIS TRUE?"
- Whenever the caller asks if something is true, or repeats a rumour, health claim, news story or money offer, ALWAYS call the check_claim tool first. Do not answer from memory.
- Then say the verdict, the one-line reason, and how sure you are, e.g. "Hii si kweli. Nina uhakika wa asilimia tisini." Mention one source by name.
- If the verdict is SCAM, warn them kindly: never send money or share a PIN.

TOOLS
- When the caller agrees to an SMS with steps:
  1. First call create_guide with a short title, the language code ("sw", "en" or "sheng"), and 3 to 6 short steps. Each step has a short text (under 15 words) and one emoji icon.
  2. Then call send_sms with a short message (under 300 characters) with the key steps. The guide link is added for you automatically.
  3. Tell them: "Nimekutumia SMS na picha za hatua." (or the same in their language).
- For a quick fact or tip with no steps, you can call send_sms alone.
- Reminders: when asked to be reminded ("nikumbushe…", "remind me…"), call set_reminder with the message and minutesFromNow (a whole number). Confirm the time back to them.
- Email: only send an email when the caller asks. Spell the address back and confirm it before calling send_email.
- Do not tell the caller about tool names or technical details. If a tool fails, apologise briefly and give the information by voice instead.

ENDING
- If the caller says goodbye or thanks you, wish them well briefly ("Asante, kwaheri! Uwe na siku njema.").`;

const FIRST_MESSAGE = "Habari! Mimi ni Sema, msaidizi wako wa AI. Nikusaidie na nini leo?";

// Short spoken line while a tool works. Neutral so it fits any language.
const waitLine = (text: string) => [{ type: "request-start", content: text, blocking: false }];

function toolServer() {
  return APP_URL ? { url: `${APP_URL}/api/vapi`, headers: { "x-vapi-secret": SECRET } } : undefined;
}

const tools = [
  {
    type: "function",
    function: {
      name: "send_sms",
      description:
        "Send a short SMS to the caller. Use after the caller agrees to get steps or information by text. If a guide was created in this call, its link is added automatically.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "The SMS text, under 300 characters, in the caller's language." },
          to: { type: "string", description: "Optional. Phone number in +254 format. Leave empty to text the caller." },
        },
        required: ["message"],
      },
    },
    messages: waitLine("Sawa, nakutumia SMS sasa hivi."),
  },
  {
    type: "function",
    function: {
      name: "create_guide",
      description:
        "Create a simple picture guide web page with numbered steps. Call this before send_sms when you send steps, so the SMS includes the link.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short title, e.g. 'Ng'ombe mwenye homa'." },
          language: { type: "string", enum: ["sw", "en", "sheng"] },
          steps: {
            type: "array",
            minItems: 1,
            maxItems: 8,
            items: {
              type: "object",
              properties: {
                text: { type: "string", description: "One short step, under 15 words." },
                icon: { type: "string", description: "One emoji that shows the step." },
              },
              required: ["text", "icon"],
            },
          },
        },
        required: ["title", "language", "steps"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_email",
      description: "Send an email. Only when the caller asks, after you have confirmed the address with them.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Email address." },
          subject: { type: "string" },
          body: { type: "string", description: "Plain text body." },
        },
        required: ["to", "subject", "body"],
      },
    },
    messages: waitLine("Sawa, natuma barua pepe."),
  },
  {
    type: "function",
    function: {
      name: "check_claim",
      description:
        "Fact-check a rumour, health claim, news story or money offer with a live web search. Always use this for 'is it true…?' questions.",
      parameters: {
        type: "object",
        properties: {
          claim: { type: "string", description: "The claim in one clear sentence, in English." },
        },
        required: ["claim"],
      },
    },
    messages: waitLine("Ngoja kidogo, ninaangalia ukweli."),
  },
  {
    type: "function",
    function: {
      name: "set_reminder",
      description: "Set an SMS reminder for the caller after some minutes.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "The reminder text, in the caller's language." },
          minutesFromNow: { type: "integer", minimum: 1, maximum: 10080 },
        },
        required: ["message", "minutesFromNow"],
      },
    },
  },
].map((t) => ({ ...t, ...(toolServer() ? { server: toolServer() } : {}) }));

function transcriber() {
  switch (TRANSCRIBER) {
    case "gladia":
      return {
        provider: "gladia",
        model: "solaria-1",
        languageBehaviour: "automatic multiple languages",
        languages: ["sw", "en"],
      };
    case "elevenlabs":
      return { provider: "11labs", model: "scribe_v2_realtime", language: "sw" };
    default:
      return { provider: "azure", language: "sw-KE" };
  }
}

const assistant = {
  name: "Sema AI",
  firstMessage: FIRST_MESSAGE,
  firstMessageMode: "assistant-speaks-first",
  transcriber: transcriber(),
  voice: { provider: "azure", voiceId: "sw-KE-ZuriNeural" },
  model: {
    provider: "google",
    model: MODEL,
    temperature: 0.4,
    maxTokens: 300,
    messages: [{ role: "system", content: SYSTEM_PROMPT }],
    tools,
  },
  clientMessages: [
    "transcript",
    "tool-calls",
    "tool-calls-result",
    "conversation-update",
    "speech-update",
    "status-update",
    "hang",
  ],
  serverMessages: ["tool-calls", "end-of-call-report", "status-update"],
  endCallPhrases: ["kwaheri", "goodbye", "bye bye"],
  maxDurationSeconds: 600,
  ...(toolServer() ? { server: toolServer() } : {}),
};

async function main() {
  if (!APP_URL) {
    console.warn("⚠️  APP_URL is empty. The assistant will talk, but tools will not work until you set APP_URL and run this again.\n");
  }
  if (!["azure", "gladia", "elevenlabs"].includes(TRANSCRIBER)) {
    console.warn(`⚠️  Unknown SEMA_TRANSCRIBER "${TRANSCRIBER}", using azure.`);
  }

  const url = ASSISTANT_ID ? `${API}/assistant/${ASSISTANT_ID}` : `${API}/assistant`;
  const res = await fetch(url, {
    method: ASSISTANT_ID ? "PATCH" : "POST",
    headers: { Authorization: `Bearer ${PRIVATE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(assistant),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) fail(`Vapi said ${res.status}:\n${JSON.stringify(body, null, 2)}`);

  console.log(`✅ ${ASSISTANT_ID ? "Updated" : "Created"} assistant "${body.name}"`);
  console.log(`   ID:          ${body.id}`);
  console.log(`   Model:       google / ${MODEL}`);
  console.log(`   Transcriber: ${JSON.stringify(transcriber())}`);
  console.log(`   Server URL:  ${APP_URL ? `${APP_URL}/api/vapi` : "(none yet)"}`);

  if (!ASSISTANT_ID) saveAssistantId(body.id);
}

function saveAssistantId(id: string) {
  if (!existsSync(ENV_FILE)) {
    console.log(`\n👉 Add this line to ${ENV_FILE}:  VAPI_ASSISTANT_ID=${id}`);
    return;
  }
  const text = readFileSync(ENV_FILE, "utf8");
  const next = /^VAPI_ASSISTANT_ID=.*$/m.test(text)
    ? text.replace(/^VAPI_ASSISTANT_ID=.*$/m, `VAPI_ASSISTANT_ID=${id}`)
    : `${text.trimEnd()}\nVAPI_ASSISTANT_ID=${id}\n`;
  writeFileSync(ENV_FILE, next);
  console.log(`\n💾 Saved VAPI_ASSISTANT_ID to ${ENV_FILE}. Next runs will update this assistant.`);
}

function fail(msg: string): never {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

main();
