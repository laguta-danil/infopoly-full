import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Task, TaskPriority, TaskStatus } from '../types';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To do' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'done', label: 'Done' },
];

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

interface TaskBoardProps {
  projectId: number;
}

export function TaskBoard({ projectId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listTasks(projectId);
      setTasks(res.data);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await api.createTask(projectId, { title: newTitle.trim() });
    setNewTitle('');
    await loadTasks();
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    await api.updateTask(projectId, task.id, { status });
    await loadTasks();
  }

  async function changePriority(task: Task, priority: TaskPriority) {
    await api.updateTask(projectId, task.id, { priority });
    await loadTasks();
  }

  async function removeTask(task: Task) {
    await api.deleteTask(projectId, task.id);
    await loadTasks();
  }

  const filtered = filterPriority
    ? tasks.filter((t) => t.priority === filterPriority)
    : tasks;

  if (loading) return <p className="loading">Loading tasks…</p>;

  return (
    <div className="task-board">
      <div className="task-toolbar">
        <form className="new-task-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="New task title…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit">Add task</button>
        </form>
        <label className="task-filter">
          <span className="task-filter-label">Priority</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority((e.target.value || '') as TaskPriority | '')}
            aria-label="Filter by priority"
          >
            <option value="">All</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="kanban">
        {COLUMNS.map(({ status, label }) => (
          <section key={status} className="kanban-column">
            <h3>{label}</h3>
            <ul>
              {filtered
                .filter((t) => t.status === status)
                .map((task) => (
                  <li key={task.id} className={`task-card priority-${task.priority}`}>
                    <div className="task-card-header">
                      <p className="task-title">{task.title}</p>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Delete task"
                        aria-label="Delete task"
                        onClick={() => void removeTask(task)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="task-actions">
                      <select
                        value={task.status}
                        onChange={(e) => void changeStatus(task, e.target.value as TaskStatus)}
                        aria-label="Status"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.status} value={c.status}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={task.priority}
                        onChange={(e) =>
                          void changePriority(task, e.target.value as TaskPriority)
                        }
                        aria-label="Priority"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
