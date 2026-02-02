import { requestInstance } from "./index";

export const searchKnowledgeBase = (params: {
  sourceType: string;
  filter: any;
  current: number;
  pageSize: number;
}) => {
  return requestInstance.post("/agentOS/v1/search", params);
};

export const buildKnowledgeBase = (formData: FormData) => {
  return requestInstance.post("/agentOS/v1/indexing/build", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const invertSearch = (params: {
  indexing_id: string | number;
  query: string;
  top_k?: number;
}) => {
  return requestInstance.post("/agentOS/v1/invert_search/search", params);
};

