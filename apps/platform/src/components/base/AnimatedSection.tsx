import { useEffect, useRef, useState, ReactNode, ElementType } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  variant?: "fade-up" | "fade-in" | "fade-left" | "fade-right";
  delay?: number;
  className?: string;
  as?: ElementType;
  threshold?: number;
}

export default function AnimatedSection({
  children,
  variant = "fade-up",
  delay = 0,
  className = "",
  as: Tag = "div",
  threshold = 0.1,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const hiddenClasses: Record<string, string> = {
    "fade-up": "opacity-0 translate-y-8",
    "fade-in": "opacity-0",
    "fade-left": "opacity-0 -translate-x-8",
    "fade-right": "opacity-0 translate-x-8",
  };

  const visibleClass = "opacity-100 translate-y-0 translate-x-0";
  const transitionClass = "transition-all duration-700 ease-out";

  const animClass = isVisible ? `${transitionClass} ${visibleClass}` : `${transitionClass} ${hiddenClasses[variant]}`;
  const delayStyle = delay > 0 ? { transitionDelay: `${delay}ms` } : {};

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${animClass} ${className}`}
      style={delayStyle}
    >
      {children}
    </Tag>
  );
}
