/**
 * Guest guard — enforces the "one free cert" rule.
 *
 * Guests (not signed in) can use one certification freely.
 * If they try to activate a second different cert, they must sign in first.
 *
 * Rules:
 * - If the user is signed in → always allow, no check needed
 * - If the target cert is already the active cert → allow (no switch)
 * - If the guest has no active cert yet → allow the first cert
 * - If the guest is switching to a different cert → require sign-in
 */

import { UserProgress } from '../types';

/**
 * Returns true if the guest should be prompted to sign in before
 * activating the given cert.
 *
 * @param isSignedIn  Whether the user has an active auth session
 * @param targetCertId  The cert they're trying to activate
 * @param progress  Current user progress
 */
export function requiresAuthForCert(
  isSignedIn: boolean,
  targetCertId: string,
  progress: UserProgress,
): boolean {
  // Signed-in users can switch freely
  if (isSignedIn) return false;

  // Already on this cert — no switch needed
  if (targetCertId === progress.selectedCertification) return false;

  // A guest may choose their initial certification, but switching away from
  // it requires an authenticated account even before study progress exists.
  return progress.selectedCertification !== '';
}
