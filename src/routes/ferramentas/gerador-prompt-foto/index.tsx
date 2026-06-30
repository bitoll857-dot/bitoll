import {
  $,
  component$,
  useComputed$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import Header from "~/components/shared/header/Header";
import Footer from "~/components/shared/sections/Footer";
import { showBitollToast } from "~/components/ui/toast";
import PhotoPromptAccessGate from "~/features/photo-prompt-generator/components/PhotoPromptAccessGate";
import PhotoPromptGeneratorView from "~/features/photo-prompt-generator/components/PhotoPromptGeneratorView";
import { quickModels } from "~/features/photo-prompt-generator/data";
import {
  changePhotoPromptPassword,
  createPhotoPromptAccount,
  listPhotoPromptRequests,
  listPhotoPromptWalletTransfers,
  loadCurrentProfilePhone,
  loginPhotoPromptAccount,
  requestPhotoPromptRecovery,
  resetPhotoPromptPassword,
  submitPhotoPromptRequest,
  submitPhotoPromptWalletTransfer,
  updatePhotoPromptRequestResponse,
  updatePhotoPromptWalletTransferStatus,
  verifyPhotoPromptSession,
} from "~/features/photo-prompt-generator/photo-prompt-account.service";
import {
  buildPhotoPrompt,
  calculatePhotoPromptCost,
  createDefaultPhotoPromptForm,
  PHOTO_PROMPT_COIN_VALUE_MZN,
  PHOTO_PROMPT_MIN_START_COINS,
  resetPhotoPromptForm,
} from "~/features/photo-prompt-generator/prompt.helpers";
import {
  clearPhotoPromptSession,
  createClientPassword,
  createRecoveryCode,
  detectMozambiqueWalletMethod,
  historyKey,
  loadPhotoPromptIdentity,
  normalizeWhatsapp,
  savePhotoPromptSession,
  savePhotoPromptIdentity,
  sessionKey,
} from "~/features/photo-prompt-generator/storage.helpers";
import type {
  PhotoPromptAccessForm,
  PhotoPromptAccessMode,
  PhotoPromptIdentity,
  PhotoPromptRequestItem,
  PhotoPromptWalletMethod,
  PhotoPromptWalletTransfer,
  PromptHistoryItem,
} from "~/features/photo-prompt-generator/types";
import { getCachedAdminAccess, loadAdminAccess } from "~/lib/supabase/admin";

export default component$(() => {
  const accessMode = useSignal<PhotoPromptAccessMode>("login");
  const lockedWhatsapp = useSignal(false);
  const isAuthenticated = useSignal(false);
  const isAdmin = useSignal(false);
  const copied = useSignal(false);
  const imagePreview = useSignal("");
  const imageName = useSignal("");
  const panelsLoading = useSignal(true);
  const passwordMessage = useSignal("");
  const submitMessage = useSignal("");
  const submitting = useSignal(false);
  const transferSubmitting = useSignal(false);
  const adminTransferSubmitting = useSignal("");
  const history = useSignal<PromptHistoryItem[]>([]);
  const panelMessage = useSignal("");
  const photoRequests = useSignal<PhotoPromptRequestItem[]>([]);
  const walletTransfers = useSignal<PhotoPromptWalletTransfer[]>([]);

  const access = useStore<PhotoPromptAccessForm>({
    countryDialCode: "+258",
    generatedPassword: createClientPassword(),
    message: "",
    newPassword: "",
    password: "",
    recoveryCode: "",
    sentCode: "",
    whatsapp: "",
  });

  const identity = useStore<PhotoPromptIdentity>({
    code: "",
    currentPassword: "",
    newPassword: "",
    password: "",
  });

  const form = useStore(createDefaultPhotoPromptForm());
  const paymentDraft = useStore({
    amount: 0,
    coins: 0,
    method: "E-Mola" as PhotoPromptWalletMethod,
    reference: "",
  });
  const adminResponseDraft = useStore({
    coinsCharged: 0,
    editedImageUrl: "",
    requestId: "",
    response: "",
  });
  const adminTransferDraft = useStore({
    note: "",
    transferId: "",
  });

  const finalPrompt = useComputed$(() => buildPhotoPrompt(identity, form));
  const promptCost = useComputed$(() => calculatePhotoPromptCost(form));
  const availableCoins = useComputed$(() => {
    const activeCoins = walletTransfers.value
      .filter((transfer) =>
        transfer.status === "aprovado" || transfer.status === "pendente",
      )
      .reduce((sum, transfer) => sum + Number(transfer.coins || 0), 0);
    const spentCoins = photoRequests.value.reduce(
      (sum, request) => sum + Number(request.coins_charged || 0),
      0,
    );

    return Math.max(0, activeCoins - spentCoins);
  });

  const refreshToolPanels$ = $(async () => {
    if (!identity.code || !identity.password) {
      panelsLoading.value = false;
      return;
    }

    panelsLoading.value = true;

    try {
      const [requestsResult, transfersResult] = await Promise.all([
        listPhotoPromptRequests(identity.code, identity.password, isAdmin.value),
        listPhotoPromptWalletTransfers(
          identity.code,
          identity.password,
          isAdmin.value,
        ),
      ]);

      photoRequests.value = requestsResult.items;
      walletTransfers.value = transfersResult.items;

      panelMessage.value =
        requestsResult.error ||
        transfersResult.error ||
        (requestsResult.ok && transfersResult.ok ? "" : "Nao foi possivel atualizar os dados.");
    } finally {
      panelsLoading.value = false;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const cachedAccess = getCachedAdminAccess();
    isAdmin.value =
      cachedAccess.role === "owner" || cachedAccess.role === "admin";

    const adminAccess = await loadAdminAccess();
    isAdmin.value =
      adminAccess.role === "owner" || adminAccess.role === "admin";

    if (adminAccess.role === "owner" || adminAccess.role === "admin") {
      const profilePhone = normalizeWhatsapp(await loadCurrentProfilePhone());

      if (profilePhone) {
        access.whatsapp = profilePhone;
        lockedWhatsapp.value = true;
      } else {
        access.message =
          "O seu perfil admin precisa ter numero de WhatsApp para criar acesso.";
      }
    }

    const savedSession = localStorage.getItem(sessionKey);

    if (savedSession) {
      const savedIdentity = loadPhotoPromptIdentity();
      const verifiedSession = await verifyPhotoPromptSession(
        savedSession,
        savedIdentity.password || "",
      );

      if (verifiedSession.ok && verifiedSession.whatsapp) {
        identity.code = verifiedSession.whatsapp;
        identity.password = savedIdentity.password || "";
        isAuthenticated.value = true;
        await refreshToolPanels$();
      } else {
        clearPhotoPromptSession();
        access.message =
          verifiedSession.error ||
          "A sessao guardada ja nao e valida. Entre novamente.";
      }
    }

    history.value = JSON.parse(localStorage.getItem(historyKey) || "[]");
  });

  const setAccessMode$ = $((mode: PhotoPromptAccessMode) => {
    accessMode.value = mode;
    access.message = "";
    access.password = "";
    access.recoveryCode = "";
    access.newPassword = "";

    if (mode === "create" && !access.generatedPassword) {
      access.generatedPassword = createClientPassword();
    }
  });

  const generateAccessPassword$ = $(() => {
    access.generatedPassword = createClientPassword();
    access.message = "Senha automatica criada. Pode usar esta ou escrever outra.";
  });

  const createAccount$ = $(async () => {
    const whatsapp = normalizeWhatsapp(access.whatsapp, access.countryDialCode);

    if (whatsapp.length < 8) {
      access.message = "Introduza um numero de WhatsApp valido.";
      return;
    }

    if (access.generatedPassword.trim().length < 4) {
      access.message = "A senha deve ter pelo menos 4 caracteres.";
      return;
    }

    const result = await createPhotoPromptAccount(
      whatsapp,
      access.generatedPassword.trim(),
    );

    if (!result.ok || !result.whatsapp) {
      access.message =
        result.error ||
        "Nao foi possivel criar o acesso. Verifique os dados e tente novamente.";
      return;
    }

    savePhotoPromptSession(result.whatsapp);

    identity.code = result.whatsapp;
    identity.password = access.generatedPassword.trim();
    savePhotoPromptIdentity(identity);

    isAuthenticated.value = true;
    access.message = "";
    await refreshToolPanels$();
  });

  const login$ = $(async () => {
    const whatsapp = normalizeWhatsapp(access.whatsapp, access.countryDialCode);
    const result = await loginPhotoPromptAccount(whatsapp, access.password);

    if (!result.ok || !result.whatsapp) {
      access.message = result.error || "ID ou senha invalida.";
      return;
    }

    savePhotoPromptSession(result.whatsapp);
    identity.code = result.whatsapp;
    identity.password = access.password;
    savePhotoPromptIdentity(identity);
    isAuthenticated.value = true;
    access.message = "";
    await refreshToolPanels$();
  });

  const requestRecovery$ = $(async () => {
    const whatsapp = normalizeWhatsapp(access.whatsapp, access.countryDialCode);
    const code = createRecoveryCode();
    const result = await requestPhotoPromptRecovery(whatsapp, code);

    if (!result.ok) {
      access.message =
        result.error || "Nao encontramos este numero. Confirme o WhatsApp usado.";
      return;
    }

    access.sentCode = code;
    access.message = `Codigo enviado para o WhatsApp. Codigo temporario: ${code}`;
  });

  const resetPassword$ = $(async () => {
    const whatsapp = normalizeWhatsapp(access.whatsapp, access.countryDialCode);

    if (access.newPassword.trim().length < 4) {
      access.message = "A nova senha deve ter pelo menos 4 caracteres.";
      return;
    }

    const result = await resetPhotoPromptPassword(
      whatsapp,
      access.recoveryCode.trim(),
      access.newPassword.trim(),
    );

    if (!result.ok) {
      access.message = result.error || "Codigo invalido ou expirado.";
      return;
    }

    access.message = "Senha alterada. Agora pode entrar.";
    access.password = "";
    access.newPassword = "";
    access.recoveryCode = "";
    accessMode.value = "login";
  });

  const changePassword$ = $(async () => {
    passwordMessage.value = "";

    if (identity.newPassword.trim().length < 4) {
      passwordMessage.value = "A nova senha deve ter pelo menos 4 caracteres.";
      return;
    }

    const nextPassword = identity.newPassword.trim();
    const result = await changePhotoPromptPassword(
      identity.code,
      identity.currentPassword,
      nextPassword,
    );

    if (!result.ok) {
      passwordMessage.value = result.error || "Senha atual invalida.";
      return;
    }

    identity.password = nextPassword;
    identity.currentPassword = "";
    identity.newPassword = "";
    passwordMessage.value = "Senha alterada.";
    savePhotoPromptIdentity(identity);

  });

  const logout$ = $(() => {
    clearPhotoPromptSession();
    identity.code = "";
    identity.password = "";
    identity.currentPassword = "";
    identity.newPassword = "";
    isAuthenticated.value = false;
    accessMode.value = "login";
    access.password = "";
    access.message = "Pode entrar com outro ID.";
    submitMessage.value = "";
    passwordMessage.value = "";
    panelMessage.value = "";
    photoRequests.value = [];
    walletTransfers.value = [];
    panelsLoading.value = true;
  });

  const toggleKeepItem$ = $((item: string) => {
    form.keepItems = form.keepItems.includes(item)
      ? form.keepItems.filter((selectedItem) => selectedItem !== item)
      : [...form.keepItems, item];
  });

  const applyModel$ = $((modelIndex: number) => {
    const model = quickModels[modelIndex];

    form.photoType = model.photoType;
    form.objective = model.objective;
    form.problems = model.problems;
    form.finalStyle = model.style;
    form.childSubject = model.label === "Foto de crianca";
  });

  const savePrompt$ = $(() => {
    const item = {
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      objective: form.objective,
      photoType: form.photoType,
      prompt: finalPrompt.value,
    };
    const nextHistory = [item, ...history.value].slice(0, 12);

    history.value = nextHistory;
    localStorage.setItem(historyKey, JSON.stringify(nextHistory));
  });

  const submitRequest$ = $(async () => {
    submitMessage.value = "";

    if (isAdmin.value) {
      submitMessage.value =
        "O admin prepara e responde pedidos, mas nao envia pedido comprado.";
      return;
    }

    if (!imagePreview.value) {
      submitMessage.value = "Carregue a foto antes de enviar o pedido.";
      return;
    }

    if (!isAdmin.value && availableCoins.value < PHOTO_PROMPT_MIN_START_COINS) {
      submitMessage.value = `Precisa de pelo menos ${PHOTO_PROMPT_MIN_START_COINS} moedas para iniciar um pedido.`;
      return;
    }

    if (!isAdmin.value && availableCoins.value < promptCost.value.coins) {
      submitMessage.value = `Moedas insuficientes. Este pedido custa ${promptCost.value.coins} moedas e o seu saldo disponivel e ${availableCoins.value}.`;
      return;
    }

    submitting.value = true;

    const result = await submitPhotoPromptRequest(
      identity.code,
      identity.password,
      form,
      finalPrompt.value,
      imageName.value,
      promptCost.value.coins,
    );

    submitting.value = false;

    if (!result.ok) {
      submitMessage.value =
        result.error ||
        "Nao foi possivel enviar o pedido. Confirme o acesso e tente novamente.";
      return;
    }

    submitMessage.value = `Pedido enviado com sucesso. Referencia: ${result.id}`;
    await refreshToolPanels$();
  });

  const submitTransfer$ = $(async () => {
    panelMessage.value = "";

    if (transferSubmitting.value) {
      return;
    }

    if (!paymentDraft.reference.trim()) {
      panelMessage.value = "Informe o ID da transacao.";
      showBitollToast("Dados incompletos", panelMessage.value);
      return;
    }

    const detectedWallet = detectMozambiqueWalletMethod(identity.code);

    if (!detectedWallet.method) {
      panelMessage.value =
        detectedWallet.error ||
        "Nao foi possivel reconhecer a carteira deste numero.";
      showBitollToast("Operacao indisponivel", panelMessage.value);
      return;
    }

    const calculatedCoins = Math.floor(
      paymentDraft.amount / PHOTO_PROMPT_COIN_VALUE_MZN,
    );

    if (paymentDraft.amount <= 0 || calculatedCoins <= 0) {
      panelMessage.value = "Informe o valor transferido.";
      showBitollToast("Dados incompletos", panelMessage.value);
      return;
    }

    paymentDraft.coins = calculatedCoins;
    paymentDraft.method = detectedWallet.method;
    transferSubmitting.value = true;

    const result = await submitPhotoPromptWalletTransfer(
      identity.code,
      identity.password,
      detectedWallet.method,
      paymentDraft.reference,
      paymentDraft.amount,
      calculatedCoins,
    ).catch((error: unknown) => ({
      error:
        error instanceof Error
          ? error.message
          : "Erro inesperado ao enviar a transferencia.",
      ok: false,
    }));

    transferSubmitting.value = false;

    if (!result.ok) {
      panelMessage.value =
        result.error ||
        "Nao foi possivel enviar a transferencia para verificacao.";
      showBitollToast("Transferencia nao enviada", panelMessage.value);
      return;
    }

    paymentDraft.reference = "";
    paymentDraft.amount = 0;
    paymentDraft.coins = 0;
    panelMessage.value =
      "Transferencia registada como pendente. As moedas ja contam no saldo, mas o admin pode reter se o ID da transacao nao for evidente.";
    showBitollToast("Transferencia pendente", panelMessage.value);
    await refreshToolPanels$();
  });

  const answerRequest$ = $(async () => {
    if (!adminResponseDraft.requestId) {
      panelMessage.value = "Escolha um pedido para responder.";
      return;
    }

    const result = await updatePhotoPromptRequestResponse(
      adminResponseDraft.requestId,
      adminResponseDraft.response,
      adminResponseDraft.editedImageUrl,
      adminResponseDraft.coinsCharged,
    );

    if (!result.ok) {
      panelMessage.value =
        result.error || "Nao foi possivel guardar a resposta do pedido.";
      return;
    }

    adminResponseDraft.requestId = "";
    adminResponseDraft.response = "";
    adminResponseDraft.editedImageUrl = "";
    adminResponseDraft.coinsCharged = 0;
    panelMessage.value =
      "Pedido respondido. Use o WhatsApp do cliente para enviar a foto editada.";
    await refreshToolPanels$();
  });

  const updateTransferStatus$ = $(async (
    transferId: string,
    status: PhotoPromptWalletTransfer["status"],
  ) => {
    if (adminTransferSubmitting.value) {
      return;
    }

    adminTransferSubmitting.value = transferId;

    try {
      const result = await updatePhotoPromptWalletTransferStatus(
        transferId,
        status,
        adminTransferDraft.transferId === transferId
          ? adminTransferDraft.note
          : "",
      );

      panelMessage.value = result.ok
        ? "Transferencia atualizada."
        : result.error || "Nao foi possivel atualizar a transferencia.";

      if (result.ok) {
        adminTransferDraft.transferId = "";
        adminTransferDraft.note = "";
        await refreshToolPanels$();
      }
    } finally {
      adminTransferSubmitting.value = "";
    }
  });

  const copyPrompt$ = $(async () => {
    await navigator.clipboard.writeText(finalPrompt.value);
    copied.value = true;

    window.setTimeout(() => {
      copied.value = false;
    }, 1800);
  });

  const clearForm$ = $(() => {
    resetPhotoPromptForm(form);
    imagePreview.value = "";
    imageName.value = "";
    submitMessage.value = "";
  });

  return (
    <>
      <Header />

      <main class="min-h-screen bg-slate-950 pt-24 text-white">
        {isAuthenticated.value ? (
          <PhotoPromptGeneratorView
            copied={copied.value}
            finalPrompt={finalPrompt.value}
            form={form}
            hasImage={Boolean(imagePreview.value)}
            history={history.value}
            identity={identity}
            imageName={imageName}
            imagePreview={imagePreview}
            isAdmin={isAdmin.value}
            isLoadingPanels={panelsLoading.value}
            panelMessage={panelMessage.value}
            passwordMessage={passwordMessage.value}
            paymentDraft={paymentDraft}
            photoRequests={photoRequests.value}
            promptCost={promptCost.value}
            submitMessage={submitMessage.value}
            submitting={submitting.value}
            transferSubmitting={transferSubmitting.value}
            adminTransferSubmittingId={adminTransferSubmitting.value}
            walletTransfers={walletTransfers.value}
            adminResponseDraft={adminResponseDraft}
            adminTransferDraft={adminTransferDraft}
            onAnswerRequest$={answerRequest$}
            onApplyModel$={applyModel$}
            onChangePassword$={changePassword$}
            onClearForm$={clearForm$}
            onCopyPrompt$={copyPrompt$}
            onLogout$={logout$}
            onRefreshPanels$={refreshToolPanels$}
            onSavePrompt$={savePrompt$}
            onSubmitRequest$={submitRequest$}
            onSubmitTransfer$={submitTransfer$}
            onToggleKeepItem$={toggleKeepItem$}
            onUpdateTransferStatus$={updateTransferStatus$}
          />
        ) : (
          <PhotoPromptAccessGate
            access={access}
            lockedWhatsapp={lockedWhatsapp.value}
            mode={accessMode.value}
            onCreateAccount$={createAccount$}
            onGeneratePassword$={generateAccessPassword$}
            onLogin$={login$}
            onRequestRecovery$={requestRecovery$}
            onResetPassword$={resetPassword$}
            onSetMode$={setAccessMode$}
          />
        )}

        <Footer />
      </main>
    </>
  );
});

export const head: DocumentHead = {
  title: "Gerador de Prompt para Fotos | Bitoll",
  meta: [
    {
      content:
        "Ferramenta Bitoll para gerar prompts seguros e profissionais para edicao de fotos com IA.",
      name: "description",
    },
  ],
};
