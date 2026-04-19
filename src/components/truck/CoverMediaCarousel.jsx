import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const SLIDE_INTERVAL = 4000;

export default function CoverMediaCarousel({ media = [], fallbackUrl }) {
  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const videoRefs = useRef({});
  const timerRef = useRef(null);

  // Build slides — use cover_media if present, else fallback
  const slides = media.length > 0
    ? media
    : fallbackUrl
      ? [{ type: 'image', url: fallbackUrl }]
      : [];

  const current = slides[idx];
  const isVideo = current?.type === 'video';

  const goTo = useCallback((newIdx) => {
    setIdx(newIdx);
  }, []);

  const next = useCallback(() => {
    setIdx(i => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setIdx(i => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance (skip for videos — they advance on end, or after interval)
  useEffect(() => {
    if (slides.length <= 1) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, SLIDE_INTERVAL);
    return () => clearTimeout(timerRef.current);
  }, [idx, slides.length, next]);

  // Autoplay/pause videos as slide changes
  useEffect(() => {
    slides.forEach((_, i) => {
      const vid = videoRefs.current[i];
      if (!vid) return;
      if (i === idx) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [idx, slides]);

  // Sync muted state
  useEffect(() => {
    Object.values(videoRefs.current).forEach(vid => {
      if (vid) vid.muted = muted;
    });
  }, [muted]);

  // Touch swipe
  const onTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    setTouchStart(null);
  };

  if (!slides.length) return null;

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: '56vw', minHeight: 240, maxHeight: 340 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === idx ? 1 : 0, pointerEvents: i === idx ? 'auto' : 'none' }}
        >
          {slide.type === 'video' ? (
            <video
              ref={el => { if (el) videoRefs.current[i] = el; }}
              src={slide.url}
              poster={slide.thumbnail_url || undefined}
              className="w-full h-full object-cover"
              muted={muted}
              loop
              playsInline
              autoPlay={i === idx}
            />
          ) : (
            <img
              src={slide.url}
              alt=""
              className="w-full h-full object-cover"
              style={{ animation: i === idx ? 'heroZoom 14s ease-in-out infinite alternate' : 'none' }}
            />
          )}
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(13,21,23,0.3) 0%, rgba(13,21,23,0.05) 50%, rgba(13,21,23,0.75) 100%)' }} />

      {/* Volume toggle (videos only) */}
      {isVideo && (
        <button
          onClick={() => setMuted(m => !m)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {muted
            ? <VolumeX className="w-4 h-4 text-white" />
            : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all"
              style={{
                width: i === idx ? 20 : 6,
                height: 6,
                background: i === idx ? '#77ffc8' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}