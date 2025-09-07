import { useEffect, useState } from "react";
import type { Project } from "../types/project";
import { getProjects } from "../api/projects";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  return (
    <div>
      <h1>Projects</h1>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <a href={p.link}>{p.title}</a> - {p.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
