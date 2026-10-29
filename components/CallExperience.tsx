"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Vapi from "@vapi-ai/web";
import { actionsFromMessage, mergeActions, type ActionItem } from "@/lib/actions";
import Transcript, { type Line } from "./Transcript";
import ActionsPanel from "./ActionsPanel";

type Status = "idle" | "connecting" | "active" | "ending";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

export default function CallExperience({
  phone,
  assistantId,
}: {
  phone?: string;
  assistantId?: string;
}) {
  const vapiRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [speaking, setSpeaking] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [partial, setPartial] = useState<Line | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const configured = Boolean(PUBLIC_KEY && assistantId);

  // Create the Vapi client once, in the browser only.
  useEffect(() => {
    if (!PUBLIC_KEY) return;
    let cancelled = false;
    let vapi: Vapi | null = null;

    import("@vapi-ai/web").then(({ default: VapiClass }) => {
      if (cancelled) return;
      vapi = new VapiClass(PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on("call-start", () => setStatus("active"));
      vapi.on("call-end", () => {
        setStatus("idle");
        setSpeaking(false);
        setPartial(null);
      });
      vapi.on("speech-start", () => setSpeaking(true));
      vapi.on("speech-end", () => setSpeaking(false));
      vapi.on("error", (e: unknown) => {
        console.error("Vapi error", e);
        setError(readableError(e));
        setStatus("idle");
        setSpeaking(false);
      });
      vapi.on("message", (msg: { type?: string; [k: string]: unknown }) => {
        if (msg.type === "transcript") {
          const line: Line = {
            role: msg.role === "assistant" ? "assistant" : "user",
            text: String(msg.transcript ?? ""),
          };
          if (msg.transcriptType === "final") {
            setPartial(null);
            setLines((prev) => appendLine(prev, line));
          } else {
            setPartial(line);
          }
          return;
        }
        const updates = actionsFromMessage(msg);
        if (updates.length) setActions((prev) => mergeActions(prev, updates));
      });
    });

    return () => {
      cancelled = true;
      vapi?.removeAllListeners();
      vapi?.stop();
      vapiRef.current = null;
    };
  }, []);

  const startCall = useCallback(async () => {
    const vapi = vapiRef.current;
    if (!vapi || !assistantId) return;
    setError(null);
    setLines([]);
    setPartial(null);
    setActions([]);
    setStatus("connecting");
    try {
      const call = await vapi.start(assistantId);
      if (!call) setStatus("idle");
    } catch (e) {
      setError(readableError(e));
      setStatus("idle");
    }
  }, [assistantId]);

  const endCall = useCallback(() => {
    setStatus("ending");
    vapiRef.current?.stop();
  }, []);

  const inCall = status === "active" || status === "connecting" || status === "ending";

  return (
    <div className="w-full">
      {/* Call button */}
      <section aria-label="Call Sema" className="flex flex-col items-center gap-5 py-6">
        <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
          {speaking && (
            <>
              <span aria-hidden className="sema-ring absolute inset-6 rounded-full bg-sky" />
              <span aria-hidden className="sema-ring sema-ring-delay absolute inset-6 rounded-full bg-sky" />
            </>
          )}
          <button
            type="button"
            onClick={inCall ? endCall : startCall}
            disabled={!configured || status === "connecting" || status === "ending"}
            aria-label={inCall ? "Kata simu — End call" : "Piga Sema — Call Sema"}
            className={`relative z-10 flex h-44 w-44 flex-col items-center justify-center gap-2 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:h-52 sm:w-52 ${
              inCall ? "bg-red-700 hover:bg-red-800" : "bg-navy hover:bg-navy-dark"
            }`}
          >
            {inCall ? <HangUpIcon /> : <PhoneIcon />}
            <span className="text-xl font-semibold leading-tight">
              {status === "connecting" ? "Inapiga…" : inCall ? "Kata simu" : "Piga Sema"}
            </span>
            <span className="text-sm opacity-90">
              {status === "connecting" ? "Connecting…" : inCall ? "End call" : "Call Sema"}
            </span>
          </button>
        </div>

        <div aria-live="polite" className="min-h-8 text-center">
          {speaking ? (
            <p className="flex items-center gap-2 font-medium text-navy">
              <SpeakingBars /> Sema anaongea… <span className="text-slate-600">Sema is speaking</span>
            </p>
          ) : status === "active" ? (
            <p className="font-medium text-navy">
              🎙️ Ninakusikiliza… <span className="text-slate-600">I&apos;m listening</span>
            </p>
          ) : null}
        </div>

        {!configured && (
          <p role="status" className="max-w-sm rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
            Web call is not set up yet. Add NEXT_PUBLIC_VAPI_PUBLIC_KEY and VAPI_ASSISTANT_ID to .env.local.
          </p>
        )}
        {error && (
          <p role="alert" className="max-w-sm rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-800">
            {error}
          </p>
        )}

        {phone && (
          <p className="text-center text-lg text-slate-700">
            Au piga simu · Or call:{" "}
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-semibold text-navy underline underline-offset-4">
              {phone}
            </a>
          </p>
        )}
      </section>

      {/* Live transcript + actions */}
      {(inCall || lines.length > 0 || actions.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Transcript lines={lines} partial={partial} />
          <ActionsPanel actions={actions} />
        </div>
      )}
    </div>
  );
}

/** Join back-to-back finals from the same speaker into one bubble. */
function appendLine(prev: Line[], line: Line): Line[] {
  if (!line.text.trim()) return prev;
  const last = prev[prev.length - 1];
  if (last && last.role === line.role) {
    return [...prev.slice(0, -1), { ...last, text: `${last.text} ${line.text}` }];
  }
  return [...prev, line];
}

function readableError(e: unknown): string {
  const text = JSON.stringify(e ?? "").toLowerCase();
  if (text.includes("permission") || text.includes("notallowed")) {
    return "Tafadhali ruhusu maikrofoni. Please allow the microphone and try again.";
  }
  return "Simu imeshindwa. The call failed — please try again.";
}

function PhoneIcon() {
  return (
    <svg aria-hidden width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
    </svg>
  );
}

function HangUpIcon() {
  return (
    <svg aria-hidden width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1a1 1 0 0 1-.56.9 11.5 11.5 0 0 0-2.66 1.85 1 1 0 0 1-1.4 0L.29 13.08a1 1 0 0 1 0-1.41C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67a1 1 0 0 1 0 1.41l-2.48 2.49a1 1 0 0 1-1.4 0 11.3 11.3 0 0 0-2.67-1.85 1 1 0 0 1-.56-.9v-3.1A15 15 0 0 0 12 9z" />
    </svg>
  );
}

function SpeakingBars() {
  return (
    <span aria-hidden className="flex h-5 items-end gap-0.5">
      {[0, 0.15, 0.3, 0.45].map((d) => (
        <span key={d} className="sema-bar block h-5 w-1 rounded bg-sky" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  );
}
