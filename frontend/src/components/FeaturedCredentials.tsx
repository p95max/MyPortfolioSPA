import {
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useCredentials } from "../hooks/useCredentials";
import { CredentialCard } from "./CredentialCard";
import { useTranslation } from "../i18n";
import "./FeaturedCredentials.css";

const AUTOPLAY_DELAY_MS = 5200;
const MOBILE_BREAKPOINT_PX = 700;

function getSlidesPerView(): number {
  if (typeof window === "undefined") {
    return 2;
  }

  return window.innerWidth <= MOBILE_BREAKPOINT_PX ? 1 : 2;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function FeaturedCredentials() {
  const { credentials, error, loading } = useCredentials({ featured: true });
  const { t } = useTranslation();
  const trackRef = useRef<HTMLUListElement>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView);
  const [paused, setPaused] = useState(false);

  const maxIndex = Math.max(0, credentials.length - slidesPerView);
  const navigationItems = useMemo(
    () => Array.from({ length: maxIndex + 1 }, (_, index) => index),
    [maxIndex],
  );

  const goTo = useCallback((index: number) => {
    const normalizedIndex = Math.min(Math.max(index, 0), maxIndex);
    setCurrentIndex(normalizedIndex);
  }, [maxIndex]);

  useEffect(() => {
    const handleResize = () => setSlidesPerView(getSlidesPerView());

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  useEffect(() => {
    const track = trackRef.current;
    const slide = track?.children.item(currentIndex) as HTMLElement | null;

    if (!track || !slide || typeof track.scrollTo !== "function") {
      return;
    }

    track.scrollTo({
      left: slide.offsetLeft,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [currentIndex, slidesPerView]);

  useEffect(() => {
    if (paused || maxIndex === 0 || prefersReducedMotion()) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCurrentIndex((index) => index >= maxIndex ? 0 : index + 1);
    }, AUTOPLAY_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [currentIndex, maxIndex, paused]);

  if (loading || error || credentials.length === 0) {
    return null;
  }

  const handleFocusLeave = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setPaused(false);
    }
  };

  const handleKeyboardNavigation = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(currentIndex > 0 ? currentIndex - 1 : maxIndex);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }
  };

  const syncIndexAfterScroll = () => {
    if (scrollTimerRef.current !== null) {
      window.clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = window.setTimeout(() => {
      const track = trackRef.current;
      if (!track) {
        return;
      }

      const slides = Array.from(track.children) as HTMLElement[];
      const closestIndex = slides.reduce((closest, slide, index) => {
        const currentDistance = Math.abs(slide.offsetLeft - track.scrollLeft);
        const closestDistance = Math.abs(slides[closest].offsetLeft - track.scrollLeft);
        return currentDistance < closestDistance ? index : closest;
      }, 0);

      setCurrentIndex(Math.min(closestIndex, maxIndex));
    }, 120);
  };

  return (
    <section
      className="featured-credentials"
      aria-labelledby="featured-credentials-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={handleFocusLeave}
    >
      <div className="featured-credentials__header">
        <div>
          <p className="featured-credentials__eyebrow">{t("credentials.featuredEyebrow")}</p>
          <h2 id="featured-credentials-title" className="featured-credentials__title">
            {t("credentials.featuredTitle")}
          </h2>
        </div>

        <div className="featured-credentials__header-actions">
          {maxIndex > 0 && (
            <div className="featured-credentials__controls" aria-label={t("credentials.carouselControls")}>
              <button
                className="featured-credentials__control"
                type="button"
                aria-label={t("credentials.previous")}
                onClick={() => goTo(currentIndex > 0 ? currentIndex - 1 : maxIndex)}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                className="featured-credentials__control"
                type="button"
                aria-label={t("credentials.next")}
                onClick={() => goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1)}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

          <Link className="featured-credentials__link" to="/credentials">
            {t("credentials.viewAll")}
          </Link>
        </div>
      </div>

      <div className="featured-credentials__carousel">
        <ul
          ref={trackRef}
          className="featured-credentials__track"
          aria-label={t("credentials.carousel")}
          aria-roledescription="carousel"
          tabIndex={0}
          onKeyDown={handleKeyboardNavigation}
          onScroll={syncIndexAfterScroll}
        >
          {credentials.map((credential, index) => (
            <li
              key={credential.id}
              className="featured-credentials__slide"
              aria-label={t("credentials.slide", { current: index + 1, total: credentials.length })}
            >
              <CredentialCard credential={credential} />
            </li>
          ))}
        </ul>
      </div>

      {maxIndex > 0 && (
        <div className="featured-credentials__footer">
          <div className="featured-credentials__dots" aria-label={t("credentials.chooseGroup")}>
            {navigationItems.map((index) => (
              <button
                key={index}
                className="featured-credentials__dot"
                type="button"
                aria-label={t("credentials.showGroup", { number: index + 1 })}
                aria-current={currentIndex === index ? "true" : undefined}
                onClick={() => goTo(index)}
              />
            ))}
          </div>

          <p
            className="featured-credentials__status"
            aria-label={t("credentials.group", { current: currentIndex + 1, total: maxIndex + 1 })}
            aria-live="polite"
          >
            <span aria-hidden="true">
              {String(currentIndex + 1).padStart(2, "0")}
              {" / "}
              {String(maxIndex + 1).padStart(2, "0")}
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
