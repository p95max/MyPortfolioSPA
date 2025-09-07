import api from "./axios";
import type { BlogPost } from "../types/blog";

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const response = await api.get<BlogPost[]>("/blog/");
  return response.data;
};

