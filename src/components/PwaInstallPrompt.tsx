import { useEffect, useMemo, useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'wayone_install_prompt_dismissed_at';
const DISMISS_MS = 3 * 24 * 60 * 60 * 1000;

function isIosSafari() {
  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios|chrome/.test(ua);
  return isIOS && isSafari;
}

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const isInIframe = useMemo(() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
    setIsInstalled(isStandaloneMode());

    const savedDismiss = window.localStorage.getItem(DISMISS_KEY);
    if (savedDismiss && Date.now() - Number(savedDismiss) < DISMISS_MS) {
      setDismissed(true);
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowFallback(false);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowFallback(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    const fallbackTimer = window.setTimeout(() => {
      if (!isStandaloneMode() && window.isSecureContext) {
        setShowFallback(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  const dismissPrompt = () => {
    setDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const manualInstall = isIosSafari() || (!deferredPrompt && showFallback);
  const title = deferredPrompt ? 'Installa WAY ONE' : 'Aggiungi WAY ONE alla schermata Home';
  const description = isIosSafari()
    ? 'Su iPhone o iPad tocca Condividi e poi Aggiungi alla schermata Home.'
    : deferredPrompt
      ? 'Aggiungi l'app alla home per un accesso rapido e un'esperienza più stabile.'
      : 'Se il browser non mostra il popup automatico, usa il menu del browser e scegli Installa app o Aggiungi alla schermata Home.';

  if (isInstalled || dismissed || isInIframe || !window.isSecureContext) return null;
  if (!deferredPrompt && !manualInstall) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[60] mx-auto max-w-lg animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-card p-4 shadow-lg shadow-primary/10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
          {manualInstall ? <Smartphone className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {deferredPrompt ? (
          <Button size="sm" onClick={handleInstall} className="shrink-0">Installa</Button>
        ) : (
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[11px] text-muted-foreground">
            <Share2 className="h-3.5 w-3.5" /> Menu browser
          </div>
        )}
        <button onClick={dismissPrompt} className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
