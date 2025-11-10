import { Injectable } from '@nestjs/common';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, any>;
}

@Injectable()
export class LogBufferService {
  private readonly maxEntries = 500;
  private buffer: LogEntry[] = [];
  private seq = 0;

  addEntry(entry: { level: LogLevel; message: string; meta?: Record<string, any>; timestamp?: string }): void {
    const logEntry: LogEntry = {
      id: ++this.seq,
      timestamp: entry.timestamp ?? new Date().toISOString(),
      level: entry.level,
      message: entry.message,
      meta: entry.meta,
    };
    this.buffer.push(logEntry);
    if (this.buffer.length > this.maxEntries) {
      this.buffer.splice(0, this.buffer.length - this.maxEntries);
    }
  }

  getEntries(sinceId?: number): LogEntry[] {
    if (!sinceId) {
      return [...this.buffer];
    }
    return this.buffer.filter(entry => entry.id > sinceId);
  }
}
