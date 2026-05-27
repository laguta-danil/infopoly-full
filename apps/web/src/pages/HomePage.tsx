import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { TaskBoard } from '../components/TaskBoard';
import type { Project } from '../types';

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.listProjects();
      setProjects(list);
      setActiveId((prev) => {
        if (prev && list.some((p) => p.id === prev)) return prev;
        return list[0]?.id ?? null;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const project = await api.createProject(newProjectName.trim());
    setNewProjectName('');
    setProjects((prev) => [...prev, project]);
    setActiveId(project.id);
  }

  async function handleDeleteProject(id: number) {
    await api.deleteProject(id);
    await loadProjects();
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="header-brand">To-do</h1>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button type="button" className="btn-secondary" onClick={() => void handleLogout()}>
            Log out
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <h2 className="sidebar-section-title">Projects</h2>
          {loading ? (
            <p className="loading">Loading…</p>
          ) : (
            <ul className="project-list">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={p.id === activeId ? 'active' : ''}
                    onClick={() => setActiveId(p.id)}
                  >
                    {p.name}
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    title="Delete project"
                    onClick={() => void handleDeleteProject(p.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form className="new-project-form" onSubmit={handleCreateProject}>
            <input
              type="text"
              placeholder="New project…"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <button type="submit" className="btn-icon btn-icon-add" title="Add project" aria-label="Add project">
              +
            </button>
          </form>
        </aside>

        <main className="main-content">
          {activeId ? (
            <>
              <h2>{projects.find((p) => p.id === activeId)?.name ?? 'Tasks'}</h2>
              <TaskBoard projectId={activeId} />
            </>
          ) : (
            <p className="empty-state">Create a project to start adding tasks.</p>
          )}
        </main>
      </div>
    </div>
  );
}
