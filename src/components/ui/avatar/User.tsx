import { component$ } from "@builder.io/qwik";

type UserAvatarProps = {
  avatarUrl?: string;
  isAuthenticated: boolean;
  name?: string;
  size?: "sm" | "lg";
};

export default component$<UserAvatarProps>(
  ({ avatarUrl, isAuthenticated, name = "Usuario", size = "sm" }) => {
    const sizeClass = size === "lg" ? "h-20 w-20" : "h-11 w-11";
    const iconHeadClass = size === "lg" ? "h-4 w-4" : "h-2.5 w-2.5";
    const iconBodyClass = size === "lg" ? "h-7 w-9" : "h-4 w-5";

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={name}
          class={`${sizeClass} rounded-full border border-cyan-400/30 object-cover shadow-[0_0_35px_rgba(6,182,212,0.25)]`}
          width={size === "lg" ? 80 : 44}
          height={size === "lg" ? 80 : 44}
        />
      );
    }

    return (
      <div
        class={[
          "flex shrink-0 flex-col items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300",
          sizeClass,
          isAuthenticated
            ? "border-cyan-300/50 bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.35)]"
            : "border-slate-800 bg-slate-900/70 text-slate-500",
        ]}
        aria-hidden="true"
      >
        <span
          class={[
            "rounded-full",
            iconHeadClass,
            isAuthenticated ? "bg-slate-950" : "bg-slate-500",
          ]}
        />
        <span
          class={[
            "-mt-0.5 rounded-t-full",
            iconBodyClass,
            isAuthenticated ? "bg-slate-950" : "bg-slate-500",
          ]}
        />
      </div>
    );
  },
);
