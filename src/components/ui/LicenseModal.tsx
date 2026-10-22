'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, KeyRound, LoaderCircle, Sparkles, X } from 'lucide-react';
import { DEMO_LICENSE_KEY, saveLicense } from '@/lib/license';
import type { LicenseData } from '@/lib/license';

interface LicenseModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (license: LicenseData) => void;
  /** Render inside an existing player instead of using a fullscreen backdrop. */
  inline?: boolean;
}

type LicenseType = 'demo' | 'master' | 'custom';
type BusyAction = 'demo' | 'activate';
type Feedback = { kind: 'error' | 'success'; message: string } | null;

type VerifyResponse = {
  valid?: boolean;
  type?: LicenseType;
  key?: string;
  name?: string;
  expiresAt?: number | null;
  message?: string;
};

export const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  inline = false,
}) => {
  const headingId = useId();
  const inputId = useId();
  const feedbackId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  const [mounted, setMounted] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => setMounted(true), []);

  // Cancel verification if the parent hides or unmounts this modal.
  useEffect(() => {
    if (!isOpen) requestRef.current?.abort();
    return () => requestRef.current?.abort();
  }, [isOpen]);

  useEffect(() => {
    if (!mounted || !isOpen || inline) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';

    const focusFrame = requestAnimationFrame(() => panelRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [inline, isOpen, mounted, onClose]);

  const verifyLicense = async (key: string, action: BusyAction, expectedType?: LicenseType) => {
    if (busy) return;
    setBusy(action);
    setFeedback(null);

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const response = await fetch('/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
        cache: 'no-store',
        signal: controller.signal,
      });

      const data: VerifyResponse = await response.json().catch(() => ({}));
      if (!response.ok || !data.valid) {
        throw new Error(data.message || 'Unable to verify your license key. Please try again.');
      }

      if (expectedType && data.type !== expectedType) {
        throw new Error('License type mismatch. Please try again.');
      }

      const activatedAt = Date.now();
      const resultType: LicenseType = data.type || (data.expiresAt === null ? 'master' : 'custom');

      const license: LicenseData = {
        type: resultType,
        key: data.key || key,
        name: data.name,
        activatedAt,
        expiresAt:
          typeof data.expiresAt === 'number' && Number.isFinite(data.expiresAt)
            ? data.expiresAt
            : resultType === 'master'
              ? null
              : activatedAt + 30 * 60 * 1000,
      };

      if (controller.signal.aborted) return;
      saveLicense(license);
      setFeedback({
        kind: 'success',
        message: data.message || 'Access activated successfully.',
      });
      onSuccess(license);
    } catch (error) {
      if (controller.signal.aborted) return;
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Connection failed. Please try again.',
      });
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setBusy(null);
      }
    }
  };

  const activateDemo = () => void verifyLicense(DEMO_LICENSE_KEY, 'demo', 'demo');

  const activateLicense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const key = licenseKey.trim();
    if (!key) {
      setFeedback({ kind: 'error', message: 'Enter your license key to continue.' });
      return;
    }
    void verifyLicense(key, 'activate');
  };

  if (!inline && (!mounted || !isOpen)) return null;

  const content = (
    <div
      ref={panelRef}
      tabIndex={-1}
      aria-labelledby={headingId}
      aria-describedby={feedback ? feedbackId : undefined}
      role={inline ? 'region' : 'dialog'}
      aria-modal={inline ? undefined : true}
      className={`relative mx-auto w-full max-w-[460px] overflow-y-auto rounded-2xl border p-6 sm:p-8 transition-colors shadow-2xl outline-none ${
        inline
          ? 'border-white/10 bg-[#121215] text-zinc-100'
          : 'border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-[#121215] dark:text-zinc-100'
      }`}
      style={{ maxHeight: inline ? '100%' : 'calc(100dvh - 2rem)' }}
      onClick={(event) => event.stopPropagation()}
    >
      {onClose && !inline && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500"
        >
          <X size={18} strokeWidth={1.8} />
        </button>
      )}

      {/* Header */}
      <header className="pb-6">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/20">
            <KeyRound size={14} strokeWidth={2} />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Streaming Access
          </span>
        </div>
        <h2
          id={headingId}
          className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-[28px] leading-tight"
        >
          Ready to Watch?
        </h2>
        <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          Activate a 30-minute demo to explore streaming, or unlock extended playback with a license key (e.g. MAGANGBPS2026 or Master Key).
        </p>
      </header>

      {/* Trial / Demo Card */}
      <section
        className={`rounded-xl border p-4 sm:p-5 transition-colors ${
          inline
            ? 'border-zinc-800 bg-zinc-900/40'
            : 'border-zinc-200/90 bg-zinc-50/80 dark:border-zinc-800/80 dark:bg-zinc-900/40'
        }`}
        aria-labelledby={`${headingId}-trial`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-rose-500 dark:text-rose-400 shrink-0" />
              <h3 id={`${headingId}-trial`} className="text-sm font-semibold text-zinc-900 dark:text-white">
                Visitor Trial
              </h3>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Free 30-minute instant access to test all video players and servers.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-rose-600 dark:text-rose-400">
            30 MIN
          </span>
        </div>

        <button
          type="button"
          onClick={activateDemo}
          disabled={busy !== null}
          className="mt-4 flex min-h-11 w-full items-center justify-between rounded-lg bg-rose-600 px-4 text-xs sm:text-sm font-semibold text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-500 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{busy === 'demo' ? 'Starting trial...' : 'Start 30-Minute Trial'}</span>
          {busy === 'demo' ? (
            <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </section>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        <span
          className={`absolute px-3 font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ${
            inline ? 'bg-[#121215]' : 'bg-white dark:bg-[#121215]'
          }`}
        >
          Or enter license key
        </span>
      </div>

      {/* Custom & Master License Form */}
      <section aria-labelledby={`${headingId}-license`}>
        <div className="flex items-center justify-between mb-1">
          <h3 id={`${headingId}-license`} className="text-sm font-semibold text-zinc-900 dark:text-white">
            Have a License Key?
          </h3>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Master / Custom
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Saved locally in your browser so you won&apos;t have to re-enter it.
        </p>

        <form onSubmit={activateLicense} noValidate>
          <div className="relative">
            <input
              id={inputId}
              type={showKey ? 'text' : 'password'}
              value={licenseKey}
              onChange={(event) => {
                setLicenseKey(event.target.value);
                if (feedback?.kind === 'error') setFeedback(null);
              }}
              disabled={busy !== null}
              placeholder="Enter your License Key (e.g. MAGANGBPS2026)..."
              autoComplete="off"
              spellCheck={false}
              aria-invalid={feedback?.kind === 'error' ? true : undefined}
              aria-describedby={feedback ? feedbackId : undefined}
              className={`h-11 w-full rounded-lg border py-2 pl-3.5 pr-11 font-mono text-xs outline-none transition-colors placeholder:font-sans placeholder:text-zinc-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 disabled:opacity-50 ${
                inline
                  ? 'border-zinc-700/80 bg-black/40 text-white placeholder:text-zinc-500 focus:border-rose-500/70'
                  : 'border-zinc-300 bg-zinc-50/80 text-zinc-900 dark:border-zinc-700/80 dark:bg-black/40 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-rose-500/70'
              }`}
            />
            <button
              type="button"
              aria-label={showKey ? 'Hide key' : 'Show key'}
              aria-pressed={showKey}
              title={showKey ? 'Hide key' : 'Show key'}
              onClick={() => setShowKey((value) => !value)}
              disabled={busy !== null}
              className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              {showKey ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={busy !== null || !licenseKey.trim()}
            className={`mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-4 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${
              inline
                ? 'border-zinc-700 bg-zinc-800/90 text-zinc-100 hover:bg-zinc-700'
                : 'border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 dark:text-zinc-100'
            }`}
          >
            {busy === 'activate' && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
            {busy === 'activate' ? 'Verifying Key...' : 'Activate License Key'}
          </button>
        </form>
      </section>

      {/* Feedback Alerts */}
      {feedback && (
        <div
          id={feedbackId}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
          className={`mt-4 flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs font-medium transition-all ${
            feedback.kind === 'error'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          {feedback.kind === 'error' ? (
            <AlertCircle size={15} className="shrink-0 text-red-500 dark:text-red-400" />
          ) : (
            <Check size={15} className="shrink-0 text-emerald-500 dark:text-emerald-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-y-auto bg-black/90 p-3 sm:p-5">
        {content}
      </div>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm dark:bg-black/80 dark:backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      {content}
    </div>,
    document.body,
  );
};

export default LicenseModal;
