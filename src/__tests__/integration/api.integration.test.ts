/**
 * API integration / contract tests — exercise the REAL FitConnect backend
 * (https://morph-server.desmait.tech/api/v1) through the actual service layer.
 *
 * These catch contract drift the unit tests (which mock `fetch`) cannot:
 * field/enum/nullable mismatches between the live API and our Zod schemas,
 * the auth lifecycle, the cursor-pagination envelope, and the 422 error shape.
 *
 * Run only via `yarn test:integration` (sets RUN_INTEGRATION=1) — they need
 * network access and register a disposable account that is soft-deleted in
 * afterAll. They are skipped in the normal unit run.
 */
import { authApi, usersApi, clientsApi, programsApi, sessionsApi, notificationsApi, ApiError, tokenStore } from '../../services/api';
import { API_BASE_URL } from '../../config/env';

const RUN = process.env.RUN_INTEGRATION === '1';
const d = RUN ? describe : describe.skip;

// Unique disposable account per run.
const stamp = Date.now();
const EMAIL = `qa.integration.${stamp}@example.com`;
const PASSWORD = 'Password123!';

d('FitConnect API integration', () => {
  beforeAll(async () => {
    await tokenStore.clear();
  });

  afterAll(async () => {
    // Best-effort cleanup: soft-delete the disposable account.
    try {
      await authApi.deleteAccount();
    } catch {
      /* ignore cleanup failure */
    }
    await tokenStore.clear();
  });

  describe('auth lifecycle', () => {
    it('registers a new trainer and persists a valid token', async () => {
      const tokens = await authApi.register({
        name: 'QA Integration',
        email: EMAIL,
        password: PASSWORD,
        password_confirmation: PASSWORD,
        role: 'trainer',
      });
      expect(tokens.access_token).toEqual(expect.any(String));
      expect(tokens.refresh_token).toEqual(expect.any(String));
      expect(tokens.token_type).toBe('Bearer');
      expect(await tokenStore.getAccessToken()).toBe(tokens.access_token);
    });

    it('logs in with the registered credentials', async () => {
      const tokens = await authApi.login({ email: EMAIL, password: PASSWORD });
      expect(tokens.access_token).toEqual(expect.any(String));
      expect(await tokenStore.getAccessToken()).toBe(tokens.access_token);
    });

    it('returns the authenticated profile from /me matching UserSchema', async () => {
      // getMe() validates the response against UserSchema; a parse failure throws.
      const { data } = await usersApi.getMe();
      expect(data.email).toBe(EMAIL);
      expect(data.role).toBe('trainer');
      // Nullable collection fields must be coerced to arrays (backend sends null).
      expect(Array.isArray(data.certifications)).toBe(true);
      expect(Array.isArray(data.training_types)).toBe(true);
      expect(Array.isArray(data.goals)).toBe(true);
    });

    it('rotates the refresh token and the new access token works', async () => {
      const refresh_token = await tokenStore.getRefreshToken();
      expect(refresh_token).toEqual(expect.any(String));
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      });
      expect(res.ok).toBe(true);
      const json = (await res.json()) as { data: { access_token: string } };
      expect(json.data.access_token).toEqual(expect.any(String));
      // Persist the rotated token, then confirm it authenticates /me.
      await tokenStore.setTokens({ ...json.data, refresh_token: refresh_token!, token_type: 'Bearer', expires_at: '' } as never);
      const me = await usersApi.getMe();
      expect(me.data.email).toBe(EMAIL);
    });
  });

  describe('contract: list endpoints parse against their schemas', () => {
    // Each call validates the live response against its Zod schema via the
    // service layer; a shape mismatch throws and fails the test.
    it('GET /clients → paginated Client envelope', async () => {
      const res = await clientsApi.listClients({ per_page: 5 });
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('GET /programs → paginated Program envelope', async () => {
      const res = await programsApi.listPrograms({ per_page: 5 });
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('GET /sessions/schedule → Session list', async () => {
      const res = await sessionsApi.getSchedule('2026-06-01', '2026-06-30');
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('GET /notifications/unread-count → { unread_count }', async () => {
      const res = await notificationsApi.unreadCount();
      expect(typeof res.data.unread_count).toBe('number');
    });

    it('GET /notifications → paginated Notification envelope', async () => {
      const res = await notificationsApi.listNotifications({ per_page: 5 });
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('contract: write + error shape', () => {
    let createdClientId: string | null = null;

    it('POST /clients creates a client matching ClientSchema', async () => {
      const { data } = await clientsApi.createClient({ name: 'QA Client', type: 'personal' });
      expect(data.id).toEqual(expect.any(String));
      expect(data.name).toBe('QA Client');
      expect(data.type).toBe('personal');
      createdClientId = data.id;
    });

    it('the created client appears in the list', async () => {
      const res = await clientsApi.listClients({ per_page: 50 });
      expect(res.data.some((c) => c.id === createdClientId)).toBe(true);
    });

    it('POST /programs/{id}/assign uses singular client_id and returns a ClientProgram', async () => {
      const { data: program } = await programsApi.createProgram({ name: 'QA Program', difficulty: 'beginner' });
      const clientId = createdClientId ?? (await clientsApi.createClient({ name: 'QA Client 2', type: 'personal' })).data.id;
      const assignment = await programsApi.assignProgram(program.id, clientId);
      expect(assignment.data.program_id).toBe(program.id);
      expect(assignment.data.client_id).toBe(clientId);
    });

    it('a 422 surfaces ApiError with fieldErrors', async () => {
      // Mismatched password_confirmation → validation error.
      await expect(
        authApi.register({
          name: 'X',
          email: `qa.bad.${stamp}@example.com`,
          password: 'abc',
          password_confirmation: 'different',
          role: 'trainer',
        }),
      ).rejects.toMatchObject({ status: 422 });
      try {
        await authApi.register({
          name: 'X',
          email: `qa.bad2.${stamp}@example.com`,
          password: 'abc',
          password_confirmation: 'different',
          role: 'trainer',
        });
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        expect((e as ApiError).fieldErrors).toBeDefined();
      }
    });
  });
});
