import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => number;
      reset: (optWidgetId?: number) => void;
      getResponse: (optWidgetId?: number) => string;
    };
  }
}

const ONLOAD_NAME = "__medlearnRecaptchaOnLoad";

/** Chave de teste v2 do Google — só em dev se `VITE_RECAPTCHA_SITE_KEY` estiver vazia. */
const GOOGLE_TEST_SITEKEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

export function getRecaptchaSiteKey(): string {
  const fromEnv = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return GOOGLE_TEST_SITEKEY;
  return "";
}

type RecaptchaWidgetProps = {
  /** Recebe o token quando o usuário conclui o desafio; `null` ao expirar ou erro. */
  onChange: (token: string | null) => void;
  className?: string;
};

/**
 * reCAPTCHA v2 (checkbox), render explícito.
 * Carrega `api.js` uma vez e monta o widget no container.
 */
export function RecaptchaWidget({ onChange, className }: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const siteKey = getRecaptchaSiteKey();
    if (!siteKey) return;

    let pollId: ReturnType<typeof setInterval> | undefined;

    const mount = () => {
      const el = containerRef.current;
      if (!el || !window.grecaptcha?.render) return;
      if (widgetIdRef.current != null) return;

      widgetIdRef.current = window.grecaptcha.render(el, {
        sitekey: siteKey,
        callback: (token: string) => onChangeRef.current(token),
        "expired-callback": () => onChangeRef.current(null),
        "error-callback": () => onChangeRef.current(null),
      });
    };

    if (window.grecaptcha?.render) {
      queueMicrotask(mount);
    } else {
      (window as unknown as Record<string, () => void>)[ONLOAD_NAME] = mount;

      const existing = document.querySelector('script[src*="google.com/recaptcha/api.js"]');
      if (existing) {
        pollId = setInterval(() => {
          if (window.grecaptcha?.render) {
            if (pollId) clearInterval(pollId);
            pollId = undefined;
            mount();
          }
        }, 80);
      } else {
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?onload=${ONLOAD_NAME}&render=explicit`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (pollId) clearInterval(pollId);
      if (widgetIdRef.current != null && window.grecaptcha) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, []);

  if (!getRecaptchaSiteKey()) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-500">
        reCAPTCHA não configurado. Defina <code className="rounded bg-muted px-1">VITE_RECAPTCHA_SITE_KEY</code> no
        ambiente de build.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("flex min-h-[78px] justify-center", className)}
    />
  );
}
