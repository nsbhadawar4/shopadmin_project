"use client";
import { useCallback, useEffect, useState } from "react";

type Props = {
  images: string[];
  alt: string;
  className?: string;
};

export default function ImageSlider({ images, alt, className = "" }: Props) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % images.length),
    [images.length],
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [next, images.length]);

  useEffect(() => {
    const reset = () => setCurrent(0);
    reset();
  }, [images]);

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {/* Sliding track */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={i} className="min-w-full h-full relative overflow-hidden">
            <img
              src={img}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-150 blur-3xl pointer-events-none select-none"
            />
            {/* Sharp foreground — floats on top of the matching background */}
            <div className="relative z-10 h-full flex items-center justify-center p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${alt} ${i + 1}`}
                className="max-h-full max-w-full object-contain rounded-md select-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Controls — only when multiple images */}
      {images.length > 1 && (
        <>
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white text-xl leading-none flex items-center justify-center transition-colors"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white text-xl leading-none flex items-center justify-center transition-colors"
            aria-label="Next"
          >
            ›
          </button> */}

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-blue-500 w-4"
                    : "bg-white/50 w-1.5 hover:bg-white/80"
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>

          <span className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold">
            {current + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}
