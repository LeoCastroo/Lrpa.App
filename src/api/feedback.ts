import api from "@/service/api";
import { ICreateFeedbackInput, IListFeedbackResponse } from "@/service/types/Feedback";

async function createFeedback(input: ICreateFeedbackInput): Promise<void> {
  await api.post(`/feedback`, input);
}

async function listFeedback(params: {
  page?: number;
  limit?: number;
  type?: string;
  office?: string;
}): Promise<IListFeedbackResponse> {
  const { data } = await api.get(`/feedback`, { params });
  return data;
}

export default { createFeedback, listFeedback };
