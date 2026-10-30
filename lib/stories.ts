// Example stories for the home page. The stories are illustrations of how Sema can help;
// the photos are real, freely licensed photos from Wikimedia Commons (credits below).
import type { StaticImageData } from "next/image";
import type { Lang } from "./i18n";
import cow from "@/public/stories/cow.jpg";
import maize from "@/public/stories/maize.jpg";
import malaria from "@/public/stories/malaria.jpg";
import phone from "@/public/stories/phone.jpg";
import elder from "@/public/stories/elder.jpg";

export interface Photo {
  src: StaticImageData;
  position: string; // object-position, so faces stay in the crop
  alt: Record<Lang, string>;
  author: string;
  license: string;
  page: string;
}

interface StoryText {
  topic: string;
  who: string;
  quote: string;
  problem: string;
  steps: string[];
  outcome: string;
}

export interface Story {
  id: string;
  photo: Photo;
  text: Record<Lang, StoryText>;
}

export const STORIES: Story[] = [
  {
    id: "cow",
    photo: {
      src: cow,
      position: "35% 40%",
      author: "LishaBora2017",
      alt: { sw: "Mfugaji akiwa na ng'ombe wake wa maziwa zizini.", en: "A dairy farmer standing with his cows in a wooden shed." },
      license: "CC BY-SA 4.0",
      page: "https://commons.wikimedia.org/wiki/File:Smallholder_Dairy_Farmer.jpg",
    },
    text: {
      sw: {
        topic: "Mifugo",
        who: "Mfugaji wa ng'ombe wa maziwa",
        quote: "“Ng'ombe wangu ana homa, na daktari yuko mbali.”",
        problem: "Ni jioni. Daktari wa mifugo yuko saa mbili kutoka hapa, na ng'ombe ameacha kula.",
        steps: [
          "Anampigia Sema na kuuliza kwa Kiswahili.",
          "Sema anampa hatua za kwanza: kivuli, maji safi, na kupima joto.",
          "Sema anatuma hatua kwa SMS pamoja na mwongozo wa picha, na kumshauri ampigie daktari.",
        ],
        outcome: "Anajua cha kufanya usiku huu, na dalili zipi zinamaanisha daktari aje sasa hivi.",
      },
      en: {
        topic: "Livestock",
        who: "A dairy farmer",
        quote: "“My cow has a fever, and the vet is far away.”",
        problem: "It is evening. The nearest vet is two hours away, and the cow has stopped eating.",
        steps: [
          "He calls Sema and asks in Kiswahili.",
          "Sema gives the first steps: shade, clean water, and check the temperature.",
          "Sema sends the steps by SMS with a picture guide, and tells him to call the vet.",
        ],
        outcome: "He knows what to do tonight, and which signs mean the vet must come now.",
      },
    },
  },
  {
    id: "maize",
    photo: {
      src: maize,
      position: "50% 45%",
      author: "McKay Savage",
      alt: { sw: "Wanawake wawili wakulima wakitabasamu shambani mwao.", en: "Two women farmers smiling in their field of young maize." },
      license: "CC BY 2.0",
      page: "https://commons.wikimedia.org/wiki/File:Women_smallholder_farmers_in_Kenya.jpg",
    },
    text: {
      sw: {
        topic: "Kilimo",
        who: "Majirani wawili wanaolima pamoja",
        quote: "“Kwa nini majani ya mahindi yanageuka manjano?”",
        problem: "Mvua ilikuwa nzuri, lakini mahindi machanga yanageuka manjano. Kununua mbolea isiyofaa ni kupoteza pesa.",
        steps: [
          "Wanamuuliza Sema kwa Kiswahili na Sheng, kwa simu moja.",
          "Sema anaeleza sababu za kawaida, kama upungufu wa naitrojeni au maji mengi, kwa maneno rahisi.",
          "Sema anatuma mwongozo wa picha wa kuonyesha duka la agro-vet.",
        ],
        outcome: "Wanaenda kwa agro-vet wakijua cha kuuliza.",
      },
      en: {
        topic: "Farming",
        who: "Two neighbours who farm together",
        quote: "“Why are my maize leaves turning yellow?”",
        problem: "The rains were good, but the young maize is turning yellow. The wrong fertiliser would waste money.",
        steps: [
          "They ask Sema in Kiswahili and Sheng, on one phone.",
          "Sema explains the common causes, like low nitrogen or too much water, in simple words.",
          "Sema sends a picture guide they can show at the agro-vet shop.",
        ],
        outcome: "They walk into the agro-vet knowing what to ask for.",
      },
    },
  },
  {
    id: "malaria",
    photo: {
      src: malaria,
      position: "70% 40%",
      author: "President's Malaria Initiative",
      alt: { sw: "Mwanamke akitabasamu mbele ya ukuta wa udongo.", en: "A woman smiling in front of a mud wall." },
      license: "Public domain",
      page: "https://commons.wikimedia.org/wiki/File:Kenya_IRS_Feature_1_(35876918002).jpg",
    },
    text: {
      sw: {
        topic: "Afya na uvumi",
        who: "Mama wa watoto watatu",
        quote: "“Jirani anasema maji ya ndimu ya moto yanatibu malaria.”",
        problem: "Mwanawe ana homa. Ujumbe wa WhatsApp unasema maji ya ndimu yanatosha, na kliniki inagharimu pesa na muda.",
        steps: [
          "Anamuuliza Sema: hii ni kweli?",
          "Sema anaangalia na kujibu: SI KWELI. Maji ya ndimu hayatibu malaria.",
          "Sema anamweleza dalili za hatari na kumshauri aende kliniki leo.",
        ],
        outcome: "Anampeleka mwanawe kupimwa malaria siku hiyo hiyo.",
      },
      en: {
        topic: "Health and rumours",
        who: "A mother of three",
        quote: "“My neighbour says hot lemon water cures malaria.”",
        problem: "Her son has a fever. A WhatsApp message says lemon water is enough, and the clinic costs money and time.",
        steps: [
          "She asks Sema: is this true?",
          "Sema checks and answers: FALSE. Lemon water does not treat malaria.",
          "Sema tells her the danger signs and advises her to go to the clinic today.",
        ],
        outcome: "She takes her son for a malaria test the same day.",
      },
    },
  },
  {
    id: "phone",
    photo: {
      src: phone,
      position: "50% 25%",
      author: "CDC Global",
      alt: { sw: "Mwanaume amesimama juu ya kichuguu akitafuta mtandao wa simu.", en: "A man standing on a termite mound, holding up his phone to find signal." },
      license: "CC BY 2.0",
      page: "https://commons.wikimedia.org/wiki/File:Signal_Searching_-_Kenya_(16437544653).jpg",
    },
    text: {
      sw: {
        topic: "Utapeli",
        who: "Kijana katika eneo kame la mbali",
        quote: "“Nimeshinda shilingi 50,000? Nitume 1,000 kwanza tu.”",
        problem: "SMS inasema ameshinda zawadi. Mtandao ni hafifu, hana intaneti, na hakuna mtu karibu wa kumuuliza.",
        steps: [
          "Anampigia Sema. Simu ya kawaida inatosha, bila intaneti.",
          "Sema anaangalia ujumbe na kusema: huu ni UTAPELI.",
          "Sema anamkumbusha: usitume pesa ili kupata zawadi, na usishiriki PIN yako ya M-Pesa.",
        ],
        outcome: "Anabaki na pesa zake, na anawaonya marafiki zake.",
      },
      en: {
        topic: "Scams",
        who: "A young man in a dry, remote area",
        quote: "“I won 50,000 shillings? I only have to send 1,000 first.”",
        problem: "An SMS says he won a prize. The signal is weak, there is no internet, and no one nearby to ask.",
        steps: [
          "He calls Sema. A normal voice call is enough, with no internet.",
          "Sema checks the message and says: this is a SCAM.",
          "Sema reminds him: never send money to claim a prize, and never share your M-Pesa PIN.",
        ],
        outcome: "He keeps his money, and warns his friends.",
      },
    },
  },
  {
    id: "elder",
    photo: {
      src: elder,
      position: "55% 25%",
      author: "Mark Myles Mugambi",
      alt: { sw: "Bibi wa Kimaasai akisikiliza katika mkutano wa jamii.", en: "An elderly Maasai woman listening at a community meeting." },
      license: "CC BY-SA 4.0",
      page: "https://commons.wikimedia.org/wiki/File:Elder_Maasai_woman_during_community_dialogue_in_Kajiado_County.jpg",
    },
    text: {
      sw: {
        topic: "Ufikivu",
        who: "Bibi asiyeweza kusoma maandishi madogo",
        quote: "“Nasahau dawa yangu ya jioni.”",
        problem: "Macho yake ni dhaifu, kwa hivyo menyu za simu na maandishi madogo ni magumu. Wajukuu wanaishi mjini.",
        steps: [
          "Anamwambia Sema kwa maneno yake: nikumbushe saa moja jioni.",
          "Sema anarudia saa hiyo, ili ajue ameeleweka.",
          "Saa moja jioni, kikumbusho kinafika kwa SMS: “Kunywa dawa sasa.”",
        ],
        outcome: "Hakuna menyu, hakuna kuandika. Ni kuongea tu.",
      },
      en: {
        topic: "Accessibility",
        who: "A grandmother who cannot read small text",
        quote: "“I keep forgetting my evening medicine.”",
        problem: "Her eyes are weak, so phone menus and small text are hard. Her grandchildren live in town.",
        steps: [
          "She tells Sema in her own words: remind me at 7 in the evening.",
          "Sema repeats the time back, so she knows it understood.",
          "At 7, the reminder arrives by SMS: “Take your medicine now.”",
        ],
        outcome: "No menus, no typing. Just talking.",
      },
    },
  },
];

export const STORY_STRINGS = {
  sw: {
    title: "Sema katika maisha ya kila siku",
    intro:
      "Hizi ni hadithi za mfano za jinsi Sema anavyoweza kusaidia. Picha ni za watu halisi nchini Kenya, kutoka Wikimedia Commons. Wao si watu walio kwenye hadithi.",
    problem: "Tatizo",
    helps: "Sema anavyosaidia",
    photo: "Picha",
    factsTitle: "Kwa nini sauti?",
    facts: [
      {
        value: 27.4,
        format: "{n}M",
        text: "simu za kawaida (si smartphone) bado zimeunganishwa kwenye mitandao ya Kenya.",
        source: "Communications Authority of Kenya, Juni 2026",
        url: "https://techtrendske.co.ke/2026/09/19/kenya-mobile-market-88-million-sim-smartphones/",
      },
      {
        value: 73,
        format: "{n}%",
        text: "ya mazao ya shamba yanayouzwa Kenya yanatoka kwa mashamba madogo.",
        source: "Economic Survey 2023",
        url: "https://the-star.co.ke/business/2023-10-23-more-small-scale-farmers-shift-to-irrigation-to-boost-revenues",
      },
    ],
    ctaTitle: "Jaribu Sema sasa. Uliza chochote.",
  },
  en: {
    title: "Sema in everyday life",
    intro:
      "These are example stories of how Sema can help. The photos show real people in Kenya, from Wikimedia Commons. They are not the people in the stories.",
    problem: "The problem",
    helps: "How Sema helps",
    photo: "Photo",
    factsTitle: "Why voice?",
    facts: [
      {
        value: 27.4,
        format: "{n}M",
        text: "basic phones (not smartphones) are still connected to Kenya's networks.",
        source: "Communications Authority of Kenya, June 2026",
        url: "https://techtrendske.co.ke/2026/09/19/kenya-mobile-market-88-million-sim-smartphones/",
      },
      {
        value: 73,
        format: "{n}%",
        text: "of Kenya's marketed farm produce comes from small farms.",
        source: "Economic Survey 2023",
        url: "https://the-star.co.ke/business/2023-10-23-more-small-scale-farmers-shift-to-irrigation-to-boost-revenues",
      },
    ],
    ctaTitle: "Try Sema now. Ask anything.",
  },
} as const;
