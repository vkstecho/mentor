const conflicts = new Set(['auth/credential-already-in-use', 'auth/account-exists-with-different-credential']);
const expired = new Set(['auth/session-expired', 'auth/code-expired', 'auth/invalid-verification-id', 'auth/missing-verification-id']);
const unusableProof = new Set([...expired, 'auth/invalid-credential', 'auth/invalid-verification-code', 'auth/invalid-login-credentials',
  'auth/missing-phone-number', 'auth/missing-verification-code', 'auth/user-token-expired']);
const problem = code => Object.assign(new Error(code), { code });

export function createMentorPhoneAuth({ waitForAuth, currentUser, createVerifier, signInWithPhone, verifyGuestPhone,
  makeCredential, linkCredential, credentialFromError, signInCredential }) {
  let attempt = null;
  let busy = false;
  const userKey = () => currentUser()?.uid || null;

  async function run(action) {
    if (busy) throw problem('mentor/auth-busy');
    busy = true;
    try {
      await waitForAuth();
      return await action();
    } finally {
      busy = false;
    }
  }

  function requireAttempt(context) {
    if (attempt?.context !== context) throw problem('mentor/otp-required');
    if (userKey() !== attempt.uid || (attempt.mode === 'upgrade' && !currentUser()?.isAnonymous)) {
      attempt = null;
      throw problem('mentor/account-changed');
    }
    return attempt;
  }

  async function issue(phone, mode, context) {
    const user = currentUser();
    if (mode === 'upgrade' && !user?.isAnonymous) throw problem('mentor/guest-required');
    const pending = { kind: 'expired', mode, context, phone, uid: user?.uid || null };
    attempt = pending;
    const { verifier, clear } = createVerifier(context);
    try {
      await verifier.render();
      const challenge = mode === 'upgrade'
        ? await verifyGuestPhone(phone, verifier)
        : await signInWithPhone(phone, verifier);
      requireAttempt(context);
      attempt = { ...pending, kind: 'code', challenge };
      return { status: 'code-required' };
    } finally {
      clear();
    }
  }

  function finish(result, pending) {
    const user = result?.user;
    attempt = null;
    if (!user || user.isAnonymous || user.phoneNumber !== pending.phone || userKey() !== user.uid ||
        (pending.mode === 'upgrade' && user.uid !== pending.uid)) throw problem('mentor/account-changed');
    return user;
  }

  return {
    inProgress: () => busy || attempt !== null,
    send(mobile, { mode = 'sign-in', context = 'login' } = {}) {
      return run(() => {
        if (!/^[6-9]\d{9}$/.test(mobile)) throw problem('auth/invalid-phone-number');
        if (mode !== 'sign-in' && (mode !== 'upgrade' || context !== 'login')) throw problem('mentor/guest-required');
        if (attempt?.kind === 'conflict' && attempt.context === context) throw problem('mentor/account-conflict');
        return issue('+91' + mobile, mode, context);
      });
    },
    resend(context = 'login') {
      return run(() => {
        const pending = requireAttempt(context);
        if (pending.kind === 'conflict') throw problem('mentor/account-conflict');
        return issue(pending.phone, pending.mode, context);
      });
    },
    verify(code, context = 'login') {
      return run(async () => {
        if (!/^\d{6}$/.test(code)) throw problem('auth/invalid-verification-code');
        const pending = requireAttempt(context);
        if (pending.kind === 'conflict') throw problem('mentor/account-conflict');
        if (pending.kind === 'expired') throw problem('auth/session-expired');
        try {
          const result = pending.mode === 'upgrade'
            ? await linkCredential(currentUser(), makeCredential(pending.challenge, code))
            : await pending.challenge.confirm(code);
          return finish(result, pending);
        } catch (error) {
          if (pending.mode === 'upgrade' && conflicts.has(error?.code)) {
            requireAttempt(context);
            let recovery = null;
            try { recovery = credentialFromError(error); } catch { /* A new code can recover the account. */ }
            attempt = { ...pending, kind: 'conflict', challenge: null, recovery };
            throw problem('mentor/account-conflict');
          }
          if (expired.has(error?.code) || ['auth/invalid-credential', 'auth/invalid-login-credentials'].includes(error?.code)) {
            attempt = { ...pending, kind: 'expired', challenge: null };
          }
          throw error;
        }
      });
    },
    continueExisting() {
      return run(async () => {
        const pending = requireAttempt('login');
        if (pending.kind !== 'conflict') throw problem('mentor/otp-required');
        const recovery = pending.recovery;
        attempt = { ...pending, recovery: null };
        if (recovery) {
          try {
            const result = await signInCredential(recovery);
            return { status: 'signed-in', user: finish(result, { ...pending, mode: 'sign-in' }) };
          } catch (error) {
            if (!unusableProof.has(error?.code)) throw error;
            requireAttempt('login');
          }
        }
        try {
          return await issue(pending.phone, 'sign-in', 'login');
        } catch (error) {
          if (userKey() === pending.uid && currentUser()?.isAnonymous) attempt = { ...pending, recovery: null };
          throw error;
        }
      });
    },
    cancel(context = 'login') {
      if (busy) return false;
      if (attempt?.context === context) attempt = null;
      return true;
    }
  };
}
