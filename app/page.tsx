import SemaApp from "@/components/SemaApp";

export default function Home() {
  return <SemaApp phone={process.env.NEXT_PUBLIC_SEMA_PHONE} assistantId={process.env.VAPI_ASSISTANT_ID} />;
}
