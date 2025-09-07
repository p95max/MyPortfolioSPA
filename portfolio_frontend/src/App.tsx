import { useEffect, useState } from "react";

type Project = {
  id: number;
  title: string;
  description: string;
};

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects/")
      .then(res => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Мои проекты</h1>
      {projects.length === 0 ? (
        <p>Нет данных</p>
      ) : (
        <ul>
          {projects.map((proj) => (
            <li key={proj.id}>
              <h2>{proj.title}</h2>
              <p>{proj.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
