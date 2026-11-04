import { FeedbackType } from "@/service/types/Feedback";

export const FEEDBACK_TYPES: { value: FeedbackType; label: string; hint: string }[] = [
  { value: "SUGGESTION", label: "Sugestão", hint: "Algo que poderia funcionar melhor" },
  { value: "BUG", label: "Problema (bug)", hint: "Algo que não funciona como deveria" },
  { value: "IDEA", label: "Ideia", hint: "Uma funcionalidade nova" },
  { value: "OTHER", label: "Outro", hint: "Qualquer outro assunto" },
];

export const feedbackTypeLabel = (type: FeedbackType) =>
  FEEDBACK_TYPES.find((t) => t.value === type)?.label ?? type;
