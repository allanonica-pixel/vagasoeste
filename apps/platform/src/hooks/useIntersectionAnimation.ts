import { useEffect, useRef, useState } from "react";

interface UseIntersectionAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useIntersectionAnimation(options: UseIntersectionAnimationOptions = {}) {
  const { threshold = 0.12, rootMargin = "0px 0px -40px 0px", once = true } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}

export function getAnimationClass(
  isVisible: boolean,
  variant: "fade-up" | "fade-in" | "fade-left" | "fade-right" = "fade-up",
  delay: number = 0
): string {
  const base = "transition-all duration-700 ease-out";
  const delayClass = delay > 0 ? `delay-[${delay}ms]` : "";

  if (!isVisible) {
    const hidden: Record<string, string> = {
      "fade-up": "opacity-0 translate-y-8",
      "fade-in": "opacity-0",
      "fade-left": "opacity-0 -translate-x-8",
      "fade-right": "opacity-0 translate-x-8",
    };
    return `${base} ${delayClass} ${hidden[variant]}`;
  }

  return `${base} ${delayClass} opacity-100 translate-y-0 translate-x-0`;
}
