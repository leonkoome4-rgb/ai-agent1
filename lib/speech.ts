// Turn model text into one short line that sounds right when spoken on a phone call.

const MAX_WORDS = 35;

/** Strip links, markdown and symbols; keep at most 2 sentences and the word limit. */
export function cleanForSpeech(text: string): string {
  const plain = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\[[^\]]*\]/g, "") // [1] citation marks
    .replace(/[*_#`>|~^{}<>\\]/g, "")
    .replace(/(\d)\s*%/g, "$1 percent")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .trim();

  // Split only where a sentence ends, so "KES 1.5" stays whole.
  const sentences = plain.split(/(?<=[.!?])\s+/);
  let answer = sentences.slice(0, 2).join(" ").trim();

  // Leave room for "Kulingana na <source>." inside the word limit.
  const words = answer.split(" ");
  if (words.length > MAX_WORDS - 5) {
    answer = words.slice(0, MAX_WORDS - 5).join(" ").replace(/[,;:]$/, "") + ".";
  }
  return answer;
}

/** "the-star.co.ke" -> "The Star", "kbc.co.ke" -> "KBC", "Nation Africa" stays. */
export function sourceName(title?: string): string {
  if (!title) return "";
  const t = title.trim();
  if (!/^[\w-]+(\.[\w-]+)+$/.test(t)) return t.replace(/[^\p{L}\p{N} ]/gu, "").trim();
  const label = t.replace(/^www\./, "").split(".")[0];
  if (label.length <= 4) return label.toUpperCase();
  return label
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
