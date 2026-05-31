import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

import ActionToast from "./ActionToast";

type ToastEventDetail = {
  message: string;
  title: string;
};

export const showBitollToast = (title: string, message: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ToastEventDetail>("bitoll-toast", {
      detail: { message, title },
    }),
  );
};

export default component$(() => {
  const toastOpen = useSignal(false);
  const toastTitle = useSignal("");
  const toastMessage = useSignal("");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastEventDetail>).detail;

      if (!detail?.title || !detail.message) {
        return;
      }

      toastTitle.value = detail.title;
      toastMessage.value = detail.message;
      toastOpen.value = true;
    };

    window.addEventListener("bitoll-toast", handleToast);
    cleanup(() => window.removeEventListener("bitoll-toast", handleToast));
  });

  return (
    <ActionToast
      isOpen={toastOpen.value}
      title={toastTitle.value}
      message={toastMessage.value}
      onClose$={() => {
        toastOpen.value = false;
      }}
    />
  );
});
