import { component$, Slot } from '@builder.io/qwik';

export const Modal = component$(() => {
  return (
    <div>
      <Slot />
    </div>
  );
});
