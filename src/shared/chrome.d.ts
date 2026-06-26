declare namespace chrome {
  namespace storage { namespace local { function get<T>(defaults: T): Promise<T>; function set(items: Record<string, unknown>): Promise<void>; } }
  namespace runtime {
    const onInstalled: { addListener(callback: () => void): void };
    const onMessage: { addListener(callback: (message: import('./types').RuntimeMessage) => void): void };
    function sendMessage(message: import('./types').RuntimeMessage): void;
  }
  namespace tabs {
    interface Tab { id?: number; }
    function query(queryInfo: Record<string, unknown>): Promise<Tab[]>;
    function sendMessage(tabId: number, message: import('./types').RuntimeMessage): Promise<void>;
  }
}
