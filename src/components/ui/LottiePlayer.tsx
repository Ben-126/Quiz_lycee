"use client";
import Lottie from "lottie-react";
import type { CSSProperties } from "react";

interface LottiePlayerProps {
  src: object;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
  style?: CSSProperties;
  className?: string;
}

export default function LottiePlayer({
  src,
  width = 80,
  height = 80,
  loop = true,
  autoplay = true,
  style,
  className,
}: LottiePlayerProps) {
  return (
    <Lottie
      animationData={src}
      loop={loop}
      autoplay={autoplay}
      style={{ width, height, ...style }}
      className={className}
      rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
    />
  );
}
