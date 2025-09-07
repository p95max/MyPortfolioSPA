import api from "./axios";
import type { Contact } from "../types/contact";

export const getContacts = async (): Promise<Contact[]> => {
  const response = await api.get<Contact[]>("/contacts/");
  return response.data;
};

