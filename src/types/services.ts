import type { Component } from "@builder.io/qwik";

export interface Service {
  slug?: string;
  title: string;
  icon?: string;
  shortDescription?: string;
  description: string;
  image: Component;
  features?: string[];
  benefits?: string[];
  experience?: string;
  audience?: string[];
  technologies?: string[];
}
