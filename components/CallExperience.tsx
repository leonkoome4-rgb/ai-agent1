"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Vapi from "@vapi-ai/web";
import { actionsFromMessage, mergeActions, type ActionItem } from "@/lib/actions";
import type { Lang, Strings } from "@/lib/i18n";
import Transcript, { type Line } from "./Transcript";
import ActionsPanel from "./ActionsPanel";
import MicHelp from "./MicHelp";

type Status = "idle" | "connecting" | "active" | "ended";
type Problem = null | "mic-blocked" | "no-mic" | "failed";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

export default function CallExperience({
  t,
  lang,
  phone,
  assistantId,
}: {
  t: Strings;
  lang: Lang;
  phone?: string;
  assistantId?: string;
}) {
  const vapiRef = useRef<Vapi | null>(null);
  const talkRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [speaking, setSpeaking] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [partial, setPartial] = useState<Line | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [problem, setProblem] = useState<Problem>(null);

  const configured = Boolean(PUBLIC_KEY && assistantId);
  const inCall = status === "connecting" || status === "active";

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
        setStatus("ended");
        setSpeaking(false);
        setPartial(null);
      });
      vapi.on("speech-start", () => setSpeaking(true));
      vapi.on("speech-end", () => setSpeaking(false));
      vapi.on("error", (e: unknown) => {
        console.error("Vapi error", e);
        setProblem(isPermissionError(e) ? "mic-blocked" : "failed");
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

  // Keep keyboard focus on the button that is on screen.
  useEffect(() => {
    if (inCall) endRef.current?.focus();
    else if (status === "ended") talkRef.current?.focus();
  }, [inCall, status]);

  const startCall = useCallback(async () => {
    const vapi = vapiRef.current;
    if (!vapi || !assistantId) return;
    setProblem(null);

    // Ask for the mic ourselves first, so we can explain clearly if it is blocked.
    const mic = await checkMicrophone();
    if (mic !== "ok") {
      setProblem(mic);
      return;
    }

    setLines([]);
    setPartial(null);
    setActions([]);
    setStatus("connecting");
    try {
      const call = await vapi.start(assistantId);
      if (!call) setStatus("idle");
    } catch (e) {
      setProblem(isPermissionError(e) ? "mic-blocked" : "failed");
      setStatus("idle");
    }
  }, [assistantId]);

  const endCall = useCallback(() => {
    vapiRef.current?.stop();
    setStatus("ended");
    setSpeaking(false);
  }, []);

  const stateLabel =
    status === "connecting"
      ? t.connecting
      : status === "active"
        ? speaking
          ? t.speaking
          : t.listening
        : status === "ended"
          ? t.ended
          : "";

  return (
    <div className="w-full">
      <section id="call" tabIndex={-1} aria-label={t.talk} className="flex flex-col items-center gap-5 py-6 outline-none">
        {/* The big circle: a button before the call, a status display during it. */}
        <div className="relative flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
          {status === "active" && !speaking && (
            <>
              <span aria-hidden className="sema-ring absolute inset-8 rounded-full bg-sky" />
              <span aria-hidden className="sema-ring sema-ring-delay absolute inset-8 rounded-full bg-sky" />
            </>
          )}
          {status === "connecting" && (
            <span aria-hidden className="sema-spin absolute inset-4 rounded-full border-8 border-sky-light border-t-sky" />
          )}

          {inCall ? (
            <div
              aria-hidden
              className="relative z-10 flex h-48 w-48 flex-col items-center justify-center gap-3 rounded-full bg-navy text-white shadow-xl sm:h-56 sm:w-56"
            >
              {speaking ? <SpeakingBars /> : <MicIcon size={72} />}
            </div>
          ) : (
            <button
              ref={talkRef}
              type="button"
              onClick={startCall}
              disabled={!configured}
              aria-label={t.talkAria}
              className="relative z-10 flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-full bg-navy px-4 text-white shadow-xl transition-transform hover:bg-navy-dark active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-500 sm:h-56 sm:w-56"
            >
              <MicIcon size={72} />
              <span className="text-xl font-semibold leading-tight sm:text-2xl">
                {status === "ended" ? t.talkAgain : t.talk}
              </span>
            </button>
          )}
        </div>

        {/* Spoken out by screen readers when it changes. */}
        <p role="status" aria-live="polite" className="text-center text-2xl font-semibold text-navy">
          {stateLabel}
        </p>

        {inCall && (
          <button
            ref={endRef}
            type="button"
            onClick={endCall}
            aria-label={t.endAria}
            className="flex min-h-16 w-full max-w-xs items-center justify-center gap-3 rounded-full bg-red-700 px-8 text-2xl font-bold text-white shadow-lg hover:bg-red-800 active:scale-95"
          >
            <HangUpIcon />
            {t.end}
          </button>
        )}

        {!configured && (
          <p role="status" className="max-w-sm rounded-2xl bg-amber-50 px-4 py-3 text-center text-lg text-amber-900">
            {t.notSetup}
          </p>
        )}

        {problem === "mic-blocked" && <MicHelp t={t} onRetry={startCall} onClose={() => setProblem(null)} />}
        {problem === "no-mic" && (
          <p role="alert" className="max-w-sm rounded-2xl bg-red-50 px-4 py-3 text-center text-lg text-red-900">
            {t.noMic}
          </p>
        )}
        {problem === "failed" && (
          <p role="alert" className="max-w-sm rounded-2xl bg-red-50 px-4 py-3 text-center text-lg text-red-900">
            {t.callFailed}
          </p>
        )}

        {phone && (
          <p className="text-center text-xl text-slate-800">
            {t.orCall}{" "}
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="whitespace-nowrap font-bold text-navy underline underline-offset-4"
            >
              {phone}
            </a>
          </p>
        )}
      </section>

      {(inCall || lines.length > 0 || actions.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Transcript t={t} lines={lines} partial={partial} />
          <ActionsPanel t={t} lang={lang} actions={actions} />
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

async function checkMicrophone(): Promise<"ok" | "mic-blocked" | "no-mic"> {
  if (!navigator.mediaDevices?.getUserMedia) return "no-mic";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return "ok";
  } catch (e) {
    const name = (e as DOMException)?.name;
    if (name === "NotFoundError" || name === "OverconstrainedError") return "no-mic";
    return "mic-blocked";
  }
}

function isPermissionError(e: unknown): boolean {
  const text = JSON.stringify(e ?? "").toLowerCase();
  return text.includes("permission") || text.includes("notallowed");
}

function MicIcon({ size }: { size: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z" />
    </svg>
  );
}

function HangUpIcon() {
  return (
    <svg aria-hidden width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1a1 1 0 0 1-.56.9 11.5 11.5 0 0 0-2.66 1.85 1 1 0 0 1-1.4 0L.29 13.08a1 1 0 0 1 0-1.41C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67a1 1 0 0 1 0 1.41l-2.48 2.49a1 1 0 0 1-1.4 0 11.3 11.3 0 0 0-2.67-1.85 1 1 0 0 1-.56-.9v-3.1A15 15 0 0 0 12 9z" />
    </svg>
  );
}

function SpeakingBars() {
  return (
    <span aria-hidden className="flex h-20 items-end gap-2">
      {[0, 0.2, 0.4, 0.1, 0.3].map((d, i) => (
        <span key={i} className="sema-bar block h-20 w-3 rounded-full bg-white" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  );
}
