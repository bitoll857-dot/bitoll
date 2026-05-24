export type ContrastMode = "default" | "dark-high" | "light-high" | "reading";

export type TextSizeMode = "normal" | "medium" | "large";

export type FontMode = "default" | "readable";

export type MotionMode = "normal" | "reduced";

export interface AccessibilityPreferences {
  contrastMode: ContrastMode;
  textSize: TextSizeMode;
  fontMode: FontMode;
  motionMode: MotionMode;
}

export type AccessibilitySegmentOption<T extends string> = {
  label: string;
  value: T;
  description: string;
};
