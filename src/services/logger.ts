/**
 * Tiny structured logging facade.
 *
 * The app logs through `logger.*` rather than `console.*` directly so that a
 * single transport (Sentry, Bugsnag, a remote collector, …) can be wired in
 * once via `setLogSink` without touching call sites.
 *
 * To activate crash reporting in production:
 *   1. `npx expo install @sentry/react-native`
 *   2. `Sentry.init({ dsn: ... })` at app start
 *   3. `setLogSink(({ level, message, error, context }) => {
 *        if (level === 'error') Sentry.captureException(error ?? new Error(message), { extra: context });
 *        else Sentry.addBreadcrumb({ level, message, data: context });
 *      })`
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEvent {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

export type LogSink = (event: LogEvent) => void;

let sink: LogSink | null = null;

/** Register the transport that receives every log event. Pass null to reset. */
export function setLogSink(next: LogSink | null): void {
  sink = next;
}

function toConsole(event: LogEvent): void {
  // Resolved at call time (not module load) so test spies on console.* are honoured.
  const method =
    event.level === 'error'
      ? console.error
      : event.level === 'warn'
        ? console.warn
        : event.level === 'info'
          ? (console.info ?? console.log)
          : (console.debug ?? console.log);
  const args: unknown[] = [event.message];
  if (event.error !== undefined) args.push(event.error);
  if (event.context !== undefined) args.push(event.context);
  method(...args);
}

function emit(event: LogEvent): void {
  if (sink) {
    try {
      sink(event);
      return;
    } catch {
      // A logging transport must never crash the app; fall through to console.
    }
  }
  toConsole(event);
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    emit({ level: 'debug', message, context });
  },
  info(message: string, context?: Record<string, unknown>): void {
    emit({ level: 'info', message, context });
  },
  warn(message: string, context?: Record<string, unknown>): void {
    emit({ level: 'warn', message, context });
  },
  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    emit({ level: 'error', message, error, context });
  },
};
