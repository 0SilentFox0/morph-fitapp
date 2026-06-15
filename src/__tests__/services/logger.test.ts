import { type LogEvent, logger, setLogSink } from '../../services/logger';

afterEach(() => {
  setLogSink(null);
  jest.restoreAllMocks();
});

describe('logger', () => {
  it('forwards error events to the registered sink with level and error', () => {
    const events: LogEvent[] = [];

    setLogSink((e) => events.push(e));

    const err = new Error('boom');

    logger.error('request failed', err, { path: '/me' });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      level: 'error',
      message: 'request failed',
      error: err,
      context: { path: '/me' },
    });
  });

  it('forwards info/warn events with their level and context', () => {
    const events: LogEvent[] = [];

    setLogSink((e) => events.push(e));

    logger.info('started', { mode: 'cold' });
    logger.warn('slow', { ms: 900 });

    expect(events.map((e) => e.level)).toEqual(['info', 'warn']);
    expect(events[0]!.context).toEqual({ mode: 'cold' });
    expect(events[1]!.context).toEqual({ ms: 900 });
  });

  it('falls back to console when no sink is registered', () => {
    setLogSink(null);

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('no sink');
    expect(spy).toHaveBeenCalled();
  });

  it('never throws when the sink itself throws', () => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    setLogSink(() => {
      throw new Error('sink exploded');
    });
    expect(() => logger.info('safe')).not.toThrow();
  });
});
