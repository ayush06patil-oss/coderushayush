/**
 * Emergency Priority Queue System
 * Sorts waiting emergency requests by Urgency Priority:
 * CRITICAL = 4
 * HIGH = 3
 * MEDIUM = 2
 * LOW = 1
 * Tie-breaker: older request timestamp processed first.
 */

export const PRIORITY_SCORES = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export function getPriorityScore(urgency) {
  if (!urgency) return 1;
  const key = String(urgency).toUpperCase();
  return PRIORITY_SCORES[key] || 1;
}

export class EmergencyPriorityQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(emergency) {
    if (!emergency) return;
    const item = {
      ...emergency,
      priorityScore: getPriorityScore(emergency.urgency),
      queuedAt: emergency.requestedAt || new Date().toISOString()
    };
    this.queue.push(item);
    this.sort();
  }

  dequeue() {
    return this.queue.shift() || null;
  }

  peek() {
    return this.queue[0] || null;
  }

  sort() {
    this.queue.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore; // Highest priority score first
      }
      return new Date(a.queuedAt) - new Date(b.queuedAt); // Older request first
    });
  }

  size() {
    return this.queue.length;
  }

  getAll() {
    return [...this.queue];
  }
}
