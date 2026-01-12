type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'dismiss';

export interface ToastEvent {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

class ToastManager {
    private listeners: ((toast: ToastEvent) => void)[] = [];

    subscribe(listener: (toast: ToastEvent) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private emit(message: string, type: ToastType, duration: number = 3000, id?: string) {
        const toastId = id || Math.random().toString(36).substring(2, 9);
        const event: ToastEvent = { id: toastId, message, type, duration };
        this.listeners.forEach(l => l(event));
    }

    success(message: string, options?: { autoClose?: number }) {
        this.emit(message, 'success', options?.autoClose);
    }

    error(message: string, options?: { autoClose?: number }) {
        this.emit(message, 'error', options?.autoClose);
    }

    info(message: string, options?: { autoClose?: number }) {
        this.emit(message, 'info', options?.autoClose);
    }

    warning(message: string, options?: { autoClose?: number }) {
        this.emit(message, 'warning', options?.autoClose);
    }

    loading(message: string): string {
        const id = Math.random().toString(36).substring(2, 9);
        this.emit(message, 'loading', 0, id);
        return id;
    }

    dismiss(id: string) {
        this.emit('', 'dismiss', 0, id);
    }
}

export const toast = new ToastManager();
