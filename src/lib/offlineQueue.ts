// Queue for storing failed mutations to retry when connection is restored
interface QueuedMutation {
  id: string;
  timestamp: number;
  mutationKey: string;
  variables: unknown;
  retryCount: number;
}

const QUEUE_KEY = 'querox_offline_queue';
const MAX_RETRIES = 3;

// Get queued mutations from localStorage
export const getQueuedMutations = (): QueuedMutation[] => {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save queue to localStorage
const saveQueue = (queue: QueuedMutation[]) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    console.warn('Failed to save offline queue');
  }
};

// Add a mutation to the queue
export const queueMutation = (mutationKey: string, variables: unknown): string => {
  const queue = getQueuedMutations();
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  queue.push({
    id,
    timestamp: Date.now(),
    mutationKey,
    variables,
    retryCount: 0,
  });
  
  saveQueue(queue);
  return id;
};

// Remove a mutation from the queue (after success)
export const removeMutation = (id: string) => {
  const queue = getQueuedMutations();
  const filtered = queue.filter(m => m.id !== id);
  saveQueue(filtered);
};

// Increment retry count for a mutation
export const incrementRetryCount = (id: string): boolean => {
  const queue = getQueuedMutations();
  const mutation = queue.find(m => m.id === id);
  
  if (mutation) {
    mutation.retryCount += 1;
    if (mutation.retryCount >= MAX_RETRIES) {
      // Remove after max retries
      saveQueue(queue.filter(m => m.id !== id));
      return false; // Should not retry anymore
    }
    saveQueue(queue);
    return true; // Can still retry
  }
  return false;
};

// Clear old mutations (older than 24h)
export const cleanupQueue = () => {
  const queue = getQueuedMutations();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const filtered = queue.filter(m => m.timestamp > oneDayAgo);
  saveQueue(filtered);
};

// Get pending mutation count
export const getPendingCount = (): number => {
  return getQueuedMutations().length;
};
