// Turn search text into one short line that sounds right when spoken on a phone call.

const MAX_WORDS = 35;
const ANSWER_WORDS = MAX_WORDS - 5; // leave room for "Kulingana na <source>."

/** Strip links, markdown and symbols; keep at most 2 sentences within the word limit. */
export function cleanForSpeech(text: string): string {
  const plain = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\[[^\]]*\]/g, "") // [1] citation marks
    .replace(/\([^)]*\)/g, "") // (Tsh. 1944) asides
    .replace(/^\s*(according to|based on) (the )?(provided )?(sources|search results|results)[,:]?\s*/i, "")
    .replace(/^\s*(the )?(sources|search results|results) (indicate|show|say|suggest|state)s? that\s*/i, "")
    .replace(/\b(Dr|Mr|Mrs|Ms|Prof|St|No|Hon)\.\s/g, "$1 ") // keep titles from ending a sentence
    .replace(/\s?°\s?C\b/g, " degrees")
    .replace(/(\d)\s?\/\s?(\d)/g, "$1 to $2")
    .replace(/\b(?:KES|KSh|Ksh|Sh)\.?\s?(?=\d)/g, "shilingi ")
    .replace(/(\d)\s*%/g, "$1 percent")
    .replace(/[*_#`>|~^{}<>\\/°]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .trim();

  // Split only where a sentence ends, so "1.5" stays whole.
  const sentences = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
  const count = (s: string) => s.split(" ").length;

  let answer = sentences[0] ?? "";
  if (sentences[1] && count(answer) + count(sentences[1]) <= ANSWER_WORDS) {
    answer = `${answer} ${sentences[1]}`;
  }
  if (count(answer) > ANSWER_WORDS) {
    answer = answer.split(" ").slice(0, ANSWER_WORDS).join(" ").replace(/[,;:]$/, "") + ".";
  }
  answer = answer.charAt(0).toUpperCase() + answer.slice(1);
  return answer;
}

const SUFFIXES = new Set(["www", "m", "com", "org", "net", "co", "or", "go", "ac", "ke", "africa", "uk", "news", "info"]);
const KNOWN: Record<string, string> = { youtube: "YouTube", facebook: "Facebook", nation: "Nation", tuko: "Tuko" };

/** "https://kiswahili.tuko.co.ke/..." -> "Tuko", "kbc.co.ke" -> "KBC", "the-star.co.ke" -> "The Star". */
export function websiteName(url?: string): string {
  if (!url) return "";
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
  const parts = host.split(".");
  // Walk from the end, skipping domain endings, to find the site's own name.
  let i = parts.length - 1;
  while (i > 0 && SUFFIXES.has(parts[i])) i--;
  const label = parts[i];
  if (!label) return "";
  if (KNOWN[label]) return KNOWN[label];
  if (label.length <= 4) return label.toUpperCase();
  return label
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
