import type { Notification as ApiNotification } from '../../schemas/api/models';
import * as notificationsApi from '../../services/api/notifications';
import {
  apiNotificationToUi,
  loadNotifications,
  loadUnreadCount,
} from '../../services/repositories/notificationsRepository';

afterEach(() => jest.restoreAllMocks());

const apiNotification: ApiNotification = {
  id: 'n1',
  type: 'chat_message',
  title: 'New message',
  body: 'Hey!',
  payload: {},
  source_type: 'conversation',
  source_id: 's1',
  read_at: null,
  created_at: '2026-06-15T10:00:00Z',
};

describe('apiNotificationToUi', () => {
  it('maps fields and derives read from read_at', () => {
    expect(apiNotificationToUi(apiNotification)).toMatchObject({
      id: 'n1',
      title: 'New message',
      body: 'Hey!',
      read: false,
    });
    expect(
      apiNotificationToUi({ ...apiNotification, read_at: '2026-06-15T11:00:00Z' })
        .read
    ).toBe(true);
  });
});

describe('loadNotifications / loadUnreadCount', () => {
  it('maps the live list', async () => {
    jest
      .spyOn(notificationsApi, 'listNotifications')
      .mockResolvedValue({ data: [apiNotification] } as never);

    const result = await loadNotifications();

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('n1');
  });

  it('returns the unread count', async () => {
    jest
      .spyOn(notificationsApi, 'unreadCount')
      .mockResolvedValue({ data: { unread_count: 4 } } as never);

    expect(await loadUnreadCount()).toBe(4);
  });
});
