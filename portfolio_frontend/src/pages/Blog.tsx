import { useEffect, useState } from "react";
import type { BlogPost } from "../types/blog";
import { getBlogPosts } from "../api/blog";

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => {
    getBlogPosts().then(setPosts);
  }, []);

  return (
    <div>
      <h1>Blog</h1>
      {posts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <small>{post.created_at}</small>
        </div>
      ))}
    </div>
  );
};

export default Blog;
