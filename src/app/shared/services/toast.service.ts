import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private message: MessageService) {}

  private show(severity: ToastSeverity, summary: string, detail?: string, life = 2500) {
    this.message.add({
      severity,
      summary,
      detail,
      life,          
      closable: true 
    });
  }

  success(summary: string, detail?: string, life?: number) {
    this.show('success', summary, detail, life);
  }

  info(summary: string, detail?: string, life?: number) {
    this.show('info', summary, detail, life);
  }

  warn(summary: string, detail?: string, life?: number) {
    this.show('warn', summary, detail, life);
  }

  error(summary: string, detail?: string, life = 3500) {
    this.show('error', summary, detail, life);
  }

  clear() {
    this.message.clear();
  }
}