'use client';

import { useEffect } from 'react';

const SCRIPTS = [
  '/assets/js/jquery.js',
  '/assets/js/popper.min.js',
  '/assets/js/bootstrap.min.js',
  '/assets/js/slick.min.js',
  '/assets/js/slick-animation.min.js',
  '/assets/js/jquery.fancybox.js',
  '/assets/js/wow.js',
  '/assets/js/appear.js',
  '/assets/js/nice-select.min.js',
  '/assets/js/mixitup.js',
  '/assets/js/flatpickr.js',
  '/assets/js/bxslider.js',
  '/assets/js/aos.js',
  '/assets/js/gsap.js',
  '/assets/js/ScrollTrigger.min.js',
  '/assets/js/SplitText.min.js',
  '/assets/js/splitType.js',
  '/assets/js/script-gsap.js',
  '/assets/js/script.js',
  'https://cdn.jotfor.ms/agent/embedjs/019ba0e88d9a75818a9eb585e5e34a649697/embed.js',
];

let loaded = false;

function loadScriptSequential(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[data-legacy-src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.setAttribute('data-legacy-src', src);
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

export default function LegacyScripts() {
  useEffect(() => {
    if (loaded) return;
    loaded = true;

    let cancelled = false;
    (async () => {
      for (const src of SCRIPTS) {
        if (cancelled) break;
        await loadScriptSequential(src);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
