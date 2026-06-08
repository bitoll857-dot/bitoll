import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import { AdminHeader } from "~/features/admin/components/AdminHeader";
import { AdminToast } from "~/features/admin/components/AdminToast";
import { ConfirmModal } from "~/features/admin/components/ConfirmModal";
import { DetailsModal } from "~/features/admin/components/DetailsModal";
import { OwnerTabs } from "~/features/admin/components/OwnerTabs";
import { OperatorQuotesPanel } from "~/features/admin/components/OperatorQuotesPanel";
import { useAdminPanel } from "~/features/admin/hooks/useAdminPanel";

export default component$(() => {
  const admin = useAdminPanel();

  return (
    <main class="min-h-screen bg-slate-950 px-4 pb-8 pt-24 text-white sm:px-6">
      {admin.toastOpen.value && (
        <AdminToast
          title={admin.toastTitle.value}
          message={admin.toastMessage.value}
          onClose$={admin.closeToast$}
        />
      )}

      {admin.detailsOpen.value && (
        <DetailsModal
          imageUrl={admin.detailsImageUrl.value}
          title={admin.detailsTitle.value}
          message={admin.detailsMessage.value}
          onClose$={admin.closeDetails$}
        />
      )}

      {admin.confirmOpen.value && (
        <ConfirmModal
          title={admin.confirmTitle.value}
          message={admin.confirmMessage.value}
          confirmLabel={admin.confirmLabel.value}
          tone={admin.confirmTone.value}
          onCancel$={admin.closeConfirm$}
          onConfirm$={admin.confirmPendingAction$}
        />
      )}

      <section class="mx-auto w-full max-w-6xl">
        <AdminHeader role={admin.adminAccess.value.role} />

        {admin.isLoading.value && (
          <div class="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
            A verificar permissao administrativa...
          </div>
        )}

        {!admin.isLoading.value && !admin.authUser.value && (
          <div class="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
            <h2 class="text-xl font-bold text-amber-100">Login necessario</h2>
            <p class="mt-2 text-sm leading-6 text-amber-100/80">
              Entre com a conta Google autorizada pela Bitoll para abrir o
              painel admin.
            </p>
          </div>
        )}

        {!admin.isLoading.value &&
          admin.authUser.value &&
          !admin.adminAccess.value.isAdmin && (
            <div class="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-6">
              <h2 class="text-xl font-bold text-red-100">Acesso bloqueado</h2>
              <p class="mt-2 text-sm leading-6 text-red-100/80">
                A conta {admin.authUser.value.email} esta autenticada, mas ainda
                nao esta registada como administradora da Bitoll.
              </p>
            </div>
          )}

        {!admin.isLoading.value && admin.adminAccess.value.isAdmin && (
          <div class="mt-6 space-y-8">
            {admin.adminAccess.value.role === "operador" ? (
              <OperatorQuotesPanel admin={admin} />
            ) : (
              <OwnerTabs admin={admin} />
            )}
          </div>
        )}
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Admin | Bitoll",
};
