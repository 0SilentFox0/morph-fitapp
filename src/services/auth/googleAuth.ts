import { apiReadiness } from '../../config/apiReadiness';

/**
 * Obtain a Google OIDC `id_token` on-device, to be exchanged with our backend
 * (`POST /auth/google`) for Sanctum tokens.
 *
 * SCAFFOLD: while `apiReadiness.google` is false we return a deterministic dev
 * token so the "Continue with Google" flow is navigable in development without a
 * configured OAuth client. The moment the backend ships `/auth/google` and the
 * Expo client IDs are set, flip the flag and replace the live branch below with
 * the real `expo-auth-session/providers/google` flow:
 *
 *   import * as Google from 'expo-auth-session/providers/google';
 *   const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
 *     iosClientId, androidClientId, webClientId,
 *   });
 *   // ...await promptAsync(); read response.params.id_token
 *
 * (That hook-based API must live in the component; this helper would then accept
 * the resolved id_token instead of producing one.)
 */
export async function getGoogleIdToken(): Promise<string> {
  if (!apiReadiness.google) {
    return 'mock-google-id-token';
  }

  throw new Error(
    'Google Sign-In is not configured yet: install expo-auth-session and set the ' +
      'OAuth client IDs, then wire the id_token flow in services/auth/googleAuth.ts.'
  );
}
