import { IGeneratePayload, IGenerateResponse } from "@/type/generate";
import { ILibraryItem } from "@/type/library";
import axios from "axios";

const API_URL = "https://story-maker-web-932514732600.europe-west1.run.app";

const api = axios.create({
  baseURL: API_URL,
});

export const getLibrary = async (
  type: string,
  userId?: string,
): Promise<ILibraryItem[]> => {
  const res = await api.get(`/library`, {
    params: { type },
    headers: {
      "x-user-id": userId || "",
    },
  });
  return res.data;
};

export const createLibraryItem = async (data: ILibraryItem) => {
  const res = await api.post("/library", data);
  return res.data;
};

export const updateLibraryItem = async (
  id: string,
  data: Partial<ILibraryItem>,
) => {
  const res = await api.patch(`/library/${id}`, data);
  return res.data;
};

export const deleteLibraryItem = async (id: string) => {
  const res = await api.delete(`/library/${id}`);
  return res.data;
};

export const generateStory = async (
  payload: IGeneratePayload,
): Promise<IGenerateResponse> => {
  const res = await api.post("/ai/generate-story", payload);
  return res.data;
};

export const generateAudioArchive = async (payload: {
  text: string;
  voiceId: string;
  projectName: string;
}): Promise<Blob> => {
  const res = await api.post("/ai/generate-audio-archive", payload, {
    responseType: "blob",
  });
  return res.data as Blob;
};
