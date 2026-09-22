import { AppState } from 'react-native';

import { getAccessToken, getActiveBaseUrl } from '@/hooks/use-axios';

/**
 * Push envelope broadcast by the backend over the household WebSocket. Mirrors
 * internal/notification/model.go in the backend.
 */
export type RealtimePushEvent = {
  type: string;
  title?: string;
  body?: string;
  household_id?: number;
  list_id?: number;
  item_id?: number;
  actor_id?: number;
  created_at?: string;
};

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected';

export type RealtimeSocketOptions = {
  householdId: number;
  onEvent: (event: RealtimePushEvent) => void;
  onStatusChange?: (status: RealtimeStatus) => void;
};

const BASE_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

function buildWsUrl(householdId: number): string {
  const base = getActiveBaseUrl().replace(/\/+$/, '');
  const wsBase = base.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
  return `${wsBase}/ws/${householdId}`;
}

// One long-lived WebSocket per household. Handles token auth (?token= on the
// handshake), AppState-driven reconnects and exponential backoff retries. The
// backend pings every 25s; React Native's WebSocket auto-replies with a pong.
export class RealtimeConnection {
  private socket: WebSocket | null = null;
  private stopped = false;
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private status: RealtimeStatus = 'connecting';
  private readonly appStateSubscription: { remove: () => void };

  constructor(private readonly options: RealtimeSocketOptions) {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    this.connect();
  }

  private setStatus(status: RealtimeStatus): void {
    if (status === this.status) return;
    this.status = status;
    this.options.onStatusChange?.(status);
  }

  private handleAppStateChange = (state: string): void => {
    if (state !== 'active') return;
    if (this.stopped) return;
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.retryCount = 0;
      this.connect();
    }
  };

  private connect = async (): Promise<void> => {
    if (this.stopped) return;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    const token = await getAccessToken();
    if (!token) {
      this.scheduleReconnect();
      return;
    }

    if (this.stopped) return;

    this.setStatus('connecting');
    const socket = new WebSocket(`${buildWsUrl(this.options.householdId)}?token=${encodeURIComponent(token)}`);

    socket.onopen = () => {
      this.retryCount = 0;
      this.setStatus('connected');
    };

    socket.onmessage = (message) => {
      if (typeof message.data !== 'string') return;
      try {
        this.options.onEvent(JSON.parse(message.data) as RealtimePushEvent);
      } catch {
        // ignore malformed frames
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
        this.setStatus('disconnected');
      }
      if (!this.stopped) this.scheduleReconnect();
    };

    this.socket = socket;
  };

  private scheduleReconnect(): void {
    if (this.stopped || this.retryTimer) return;
    const delay = Math.min(BASE_RETRY_MS * 2 ** this.retryCount, MAX_RETRY_MS);
    this.retryCount += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.stopped) return;
      void this.connect();
    }, delay);
  }

  close(): void {
    this.stopped = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.appStateSubscription.remove();
    const { socket } = this;
    this.socket = null;
    if (socket) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    }
  }
}