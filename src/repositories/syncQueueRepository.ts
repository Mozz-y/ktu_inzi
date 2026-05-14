import { getDB } from '../database/database';

export type SyncEntityType = 'profile' | 'wishlist' | 'history' | 'rating';
export type SyncOperation = 'upsert' | 'delete';

export interface SyncQueueItem {
  id: number;
  user_id: string;
  entity_type: SyncEntityType;
  entity_id: string;
  operation: SyncOperation;
  payload_json: string;
  created_at: number;
  attempt_count: number;
  last_error?: string | null;
}

export const SyncQueueRepository = {
  enqueue: async (
    userId: string,
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperation,
    payload: unknown
  ): Promise<void> => {
    await getDB().runAsync(
      `INSERT INTO sync_queue (user_id, entity_type, entity_id, operation, payload_json)
       VALUES (?, ?, ?, ?, ?);`,
      [userId, entityType, entityId, operation, JSON.stringify(payload)]
    );
  },

  getPending: async (userId: string): Promise<SyncQueueItem[]> => {
    return getDB().getAllAsync(
      `SELECT * FROM sync_queue
       WHERE user_id = ?
       ORDER BY created_at ASC, id ASC;`,
      [userId]
    );
  },

  remove: async (id: number): Promise<void> => {
    await getDB().runAsync('DELETE FROM sync_queue WHERE id = ?;', [id]);
  },

  markFailed: async (id: number, message: string): Promise<void> => {
    await getDB().runAsync(
      `UPDATE sync_queue
       SET attempt_count = attempt_count + 1, last_error = ?
       WHERE id = ?;`,
      [message, id]
    );
  },
};
