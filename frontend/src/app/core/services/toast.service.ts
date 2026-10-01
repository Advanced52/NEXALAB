import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly messages = signal<ToastMessage[]>([]);

  success(text: string) {
    this.push('success', text);
  }

  error(text: string) {
    this.push('error', text);
  }

  info(text: string) {
    this.push('info', text);
  }

  dismiss(id: number) {
    this.messages.update((list) => list.filter((m) => m.id !== id));
  }

  private push(kind: ToastKind, text: string) {
    const id = ++this.seq;
    this.messages.update((list) => [...list, { id, kind, text }]);
    setTimeout(() => this.dismiss(id), 3500);
  }
}
