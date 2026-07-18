export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string; // RFC 3339 date-time format: YYYY-MM-DDTHH:MM:SS.SSSZ
  updated?: string;
  completed?: string;
}

const BASE_URL = 'https://tasks.googleapis.com/tasks/v1';

/**
 * List all Google Task Lists for the authenticated user
 */
export async function listTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  const response = await fetch(`${BASE_URL}/users/@me/lists`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to list task lists');
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Create a new Task List
 */
export async function createTaskList(accessToken: string, title: string): Promise<GoogleTaskList> {
  const response = await fetch(`${BASE_URL}/users/@me/lists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create task list');
  }

  return response.json();
}

/**
 * List all tasks in a specific Google Task List
 */
export async function listTasks(accessToken: string, listId: string): Promise<GoogleTask[]> {
  const response = await fetch(`${BASE_URL}/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to list tasks');
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Create a new task inside a specific Google Task List
 */
export async function createTask(
  accessToken: string,
  listId: string,
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTask> {
  const response = await fetch(`${BASE_URL}/lists/${listId}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create task');
  }

  return response.json();
}

/**
 * Update the status, title, or notes of a task
 */
export async function updateTask(
  accessToken: string,
  listId: string,
  taskId: string,
  taskUpdate: Partial<GoogleTask>
): Promise<GoogleTask> {
  const response = await fetch(`${BASE_URL}/lists/${listId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(taskUpdate),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to update task');
  }

  return response.json();
}

/**
 * Delete a specific task from a Google Task List
 */
export async function deleteTask(accessToken: string, listId: string, taskId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/lists/${listId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete task');
  }
}
