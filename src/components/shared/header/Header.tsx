import {
  component$,
  useSignal,
  useComputed$,
  $,
  useOnWindow,
} from "@builder.io/qwik";

import AccessibilityButton from "../button/Accessibility";
import AccessibilityModal from "../modal/Accessibility";

import SearchModal from "../modal/Search";

import HeaderLink from "../link/Header";
import MobileMenu from "../menu/Mobile";
import UserSidebar from "../sidebar/User";
import UserAvatar from "../avatar/User";

import { headerLinks } from "~/data/links";
import { getCachedAuthUser } from "~/lib/supabase/client";
import type { User } from "~/types/user";

import { searchEverything } from "~/utils/search";

export default component$(() => {
  /*
   |--------------------------------------------------------------------------
   | SEARCH
   |--------------------------------------------------------------------------
   */

  const search = useSignal("");

  const searchModal = useSignal(false);

  const results = useComputed$(() => {
    return searchEverything(search.value);
  });

  /*
   |--------------------------------------------------------------------------
   | UI STATES
   |--------------------------------------------------------------------------
   */

  const mobileMenu = useSignal(false);

  const userSidebar = useSignal(false);

  const accessibilityModal = useSignal(false);
  const authReady = useSignal(false);
  const isAuthenticated = useSignal(false);
  const authUser = useSignal<User | null>(null);

  /*
   |--------------------------------------------------------------------------
   | HANDLERS
   |--------------------------------------------------------------------------
   */


  
  const handleSearch$ = $((value: string) => {
    search.value = value;
  });

  useOnWindow(
    "load",
    $(() => {
      authUser.value = getCachedAuthUser();
      isAuthenticated.value =
        !!authUser.value &&
        localStorage.getItem("bitoll-auth-state") !== "guest";
      authReady.value = true;
    }),
  );

  useOnWindow(
    "bitoll-auth-change",
    $((event) => {
      isAuthenticated.value =
        !!(event as CustomEvent<{ isAuthenticated: boolean }>).detail
          ?.isAuthenticated;
      authUser.value =
        (event as CustomEvent<{ user?: User | null }>).detail?.user ??
        getCachedAuthUser();
      authReady.value = true;
    }),
  );


  return (
    <>
    <header class="fixed left-0 top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">

      {/* BACKGROUND EFFECT */}
      <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] via-transparent to-blue-500/[0.03]" />

      {/* CONTAINER */}
      <div class="container relative z-10 mx-auto px-6">

        <div class="flex h-20 items-center justify-between">

          {/* LOGO */}
          <div class="flex items-center gap-3">
            <div class="hidden lg:block" data-guide="accessibility">
              <AccessibilityButton
                onClick$={() => {
                  accessibilityModal.value = true;
                }}
              />
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-base font-bold text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.20)]">
              B
            </div>

            <div class="hidden sm:block">

              <h1 class="text-lg font-bold tracking-wide text-white">
                Bitoll
              </h1>

              <p class="text-xs tracking-wide text-slate-400">
                Segurança & Tecnologia
              </p>

            </div>

          </div>

          {/* DESKTOP NAVIGATION */}
          <nav class="hidden xl:flex items-center gap-8">

            {headerLinks.map((link) => (
              <HeaderLink
                key={link.href}
                href={link.href}
                label={link.label}
              />
            ))}

          </nav>

          {/* RIGHT */}
          <div class="flex items-center gap-3">

            {/* SEARCH */}
            <div
              class="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 backdrop-blur-xl transition-all duration-300 focus-within:border-cyan-400/40 focus-within:bg-slate-900 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.12)]"
              data-guide="search"
            >

              {/* ICON */}
              <div class="text-base text-slate-500 transition-colors duration-300">
                🔍
              </div>

              {/* INPUT */}
              <input
                type="text"
                placeholder="Pesquisar..."
                value={search.value}
                onInput$={(event) => {
                const target = event.target as HTMLInputElement;

                search.value = target.value;

                }}
                onKeyDown$={(event) => {
                if (event.key === "Enter") {
                event.preventDefault();

                  if (search.value.trim()) {
                    searchModal.value = true;
                  }
                }

                }}
                class="w-[120px] bg-transparent text-sm text-white placeholder:text-slate-500 outline-none sm:w-[160px] lg:w-[220px]"
              />

            </div>

            {/* USER DESKTOP */}
            <button
              type="button"
              aria-label="Abrir painel do usuario"
              class="hidden rounded-full transition-all duration-300 hover:scale-105 lg:flex"
              data-guide="account"
              onClick$={() => {
                userSidebar.value = true;
              }}
            >
              <UserAvatar
                avatarUrl={isAuthenticated.value ? authUser.value?.avatarUrl : ""}
                isAuthenticated={authReady.value && isAuthenticated.value}
                name={isAuthenticated.value ? authUser.value?.name : undefined}
              />
            </button>

            {/* MOBILE USER */}
            <button
              type="button"
              aria-label="Abrir painel do usuario"
              class="flex rounded-full transition-all duration-300 hover:scale-105 lg:hidden"
              data-guide="account-mobile"
              onClick$={() => {
                mobileMenu.value = false;
                userSidebar.value = true;
              }}
            >
              <UserAvatar
                avatarUrl={isAuthenticated.value ? authUser.value?.avatarUrl : ""}
                isAuthenticated={authReady.value && isAuthenticated.value}
                name={isAuthenticated.value ? authUser.value?.name : undefined}
              />
            </button>

            {/* MOBILE MENU BUTTON */}
            <button
              class="flex lg:hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-lg text-white backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10"
              data-guide="mobile-menu"
              onClick$={() => {
                mobileMenu.value = !mobileMenu.value;
              }}
            >
              {mobileMenu.value ? "✕" : "☰"}
            </button>

          </div>

        </div>

      </div>      

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={searchModal.value}
        query={search.value}
        results={results.value}
        onSearch$={handleSearch$}
        onClose$={$(() => {
          searchModal.value = false;
        })}
      />

      {/* MOBILE MENU */}
      {mobileMenu.value && (
        <MobileMenu
          onOpenAccessibility$={() => {
            mobileMenu.value = false;
            accessibilityModal.value = true;
          }}
        />
      )}

      {/* USER SIDEBAR */}
      {userSidebar.value && (
        <UserSidebar
          isAuthenticated={isAuthenticated.value}
          onClose$={() => {
            userSidebar.value = false;
          }}
        />
      )}

      {/* ACCESSIBILITY MODAL */}
      {accessibilityModal.value && (
        <AccessibilityModal
          onClose$={() => {
            accessibilityModal.value = false;
          }}
        />
      )}

    </header>
    </>
  );

});
