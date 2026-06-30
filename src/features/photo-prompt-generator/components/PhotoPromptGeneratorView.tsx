import { Slot, component$, useSignal } from "@builder.io/qwik";
import type { QRL, Signal } from "@builder.io/qwik";

import {
  aspectRatios,
  backgroundOptions,
  clothingColorOptions,
  clothingStyleOptions,
  clothingTypeOptions,
  extraDetailOptions,
  getObjectiveOptions,
  groupCompositionOptions,
  hairOptions,
  hairTypeOptions,
  keepOptions,
  lightingOptions,
  photoTypes,
  quickModels,
  shoesOptions,
  styleOptions,
  textOnImageOptions,
} from "../data";
import {
  PHOTO_PROMPT_COIN_VALUE_MZN,
  PHOTO_PROMPT_MIN_START_COINS,
} from "../prompt.helpers";
import { detectMozambiqueWalletMethod } from "../storage.helpers";
import type {
  PhotoPromptForm,
  PhotoPromptIdentity,
  PhotoPromptRequestItem,
  PhotoPromptWalletMethod,
  PhotoPromptWalletTransfer,
  PromptHistoryItem,
} from "../types";

type GeneratorProps = {
  copied: boolean;
  finalPrompt: string;
  form: PhotoPromptForm;
  hasImage: boolean;
  history: PromptHistoryItem[];
  identity: PhotoPromptIdentity;
  imageName: Signal<string>;
  imagePreview: Signal<string>;
  isAdmin: boolean;
  isLoadingPanels: boolean;
  panelMessage: string;
  passwordMessage: string;
  paymentDraft: {
    amount: number;
    coins: number;
    method: PhotoPromptWalletMethod;
    reference: string;
  };
  photoRequests: PhotoPromptRequestItem[];
  promptCost: {
    billableFields: string[];
    coins: number;
    meticais: number;
  };
  submitMessage: string;
  submitting: boolean;
  transferSubmitting: boolean;
  adminTransferSubmittingId: string;
  walletTransfers: PhotoPromptWalletTransfer[];
  adminResponseDraft: {
    coinsCharged: number;
    editedImageUrl: string;
    requestId: string;
    response: string;
  };
  adminTransferDraft: {
    note: string;
    transferId: string;
  };
  onAnswerRequest$: QRL<() => void>;
  onApplyModel$: QRL<(modelIndex: number) => void>;
  onChangePassword$: QRL<() => void>;
  onClearForm$: QRL<() => void>;
  onCopyPrompt$: QRL<() => void>;
  onLogout$: QRL<() => void>;
  onRefreshPanels$: QRL<() => void>;
  onSavePrompt$: QRL<() => void>;
  onSubmitRequest$: QRL<() => void>;
  onSubmitTransfer$: QRL<() => void>;
  onToggleKeepItem$: QRL<(item: string) => void>;
  onUpdateTransferStatus$: QRL<(
    transferId: string,
    status: PhotoPromptWalletTransfer["status"],
  ) => void>;
};

export default component$((props: GeneratorProps) => {
  const identityOpen = useSignal(false);
  const requestsModalOpen = useSignal(false);
  const walletModalOpen = useSignal(false);
  const activeCoins = props.walletTransfers
    .filter((transfer) =>
      transfer.status === "aprovado" || transfer.status === "pendente",
    )
    .reduce((sum, transfer) => sum + Number(transfer.coins || 0), 0);
  const heldCoins = props.walletTransfers
    .filter((transfer) => transfer.status === "retido")
    .reduce((sum, transfer) => sum + Number(transfer.coins || 0), 0);
  const spentCoins = props.photoRequests.reduce(
    (sum, request) => sum + Number(request.coins_charged || 0),
    0,
  );
  const availableCoins = Math.max(0, activeCoins - spentCoins);
  const canStartRequest =
    props.isAdmin || availableCoins >= PHOTO_PROMPT_MIN_START_COINS;
  const pendingRequests = props.photoRequests.filter(
    (request) => request.status !== "respondido",
  ).length;
  const answeredRequests = props.photoRequests.filter(
    (request) => request.status === "respondido",
  ).length;

  return (
    <>
      <HeroSection
        answeredRequests={answeredRequests}
        availableCoins={availableCoins}
        heldCoins={heldCoins}
        identity={props.identity}
        identityOpen={identityOpen}
        isAdmin={props.isAdmin}
        passwordMessage={props.passwordMessage}
        pendingRequests={pendingRequests}
        onChangePassword$={props.onChangePassword$}
        onLogout$={props.onLogout$}
        requestsModalOpen={requestsModalOpen}
        walletModalOpen={walletModalOpen}
      />

      {requestsModalOpen.value && (
        <ToolModal
          title={props.isAdmin ? "Pedidos recebidos" : "Meus pedidos"}
          onClose$={() => {
            requestsModalOpen.value = false;
          }}
        >
          <RequestsPanel
            adminResponseDraft={props.adminResponseDraft}
            identityCode={props.identity.code}
            isAdmin={props.isAdmin}
            panelMessage={props.panelMessage}
            requests={props.photoRequests}
            onAnswerRequest$={props.onAnswerRequest$}
            onRefreshPanels$={props.onRefreshPanels$}
          />
        </ToolModal>
      )}

      {walletModalOpen.value && (
        <ToolModal
          title={props.isAdmin ? "Transferencias de moedas" : "Moedas"}
          onClose$={() => {
            walletModalOpen.value = false;
          }}
        >
          <WalletPanel
            adminTransferDraft={props.adminTransferDraft}
            identity={props.identity}
            isAdmin={props.isAdmin}
            paymentDraft={props.paymentDraft}
            spentCoins={spentCoins}
            transferSubmitting={props.transferSubmitting}
            adminTransferSubmittingId={props.adminTransferSubmittingId}
            transfers={props.walletTransfers}
            onSubmitTransfer$={props.onSubmitTransfer$}
            onUpdateTransferStatus$={props.onUpdateTransferStatus$}
          />
        </ToolModal>
      )}

      {!props.isAdmin && props.isLoadingPanels ? (
        <FormPreload />
      ) : canStartRequest ? (
        <section class="container mx-auto grid gap-6 px-6 py-8 xl:h-[calc(100vh-6rem)] xl:grid-cols-[minmax(0,1fr)_420px] xl:overflow-hidden">
          <div class="grid gap-6 xl:overflow-y-auto xl:pr-2 xl:pb-8">
            <QuickModelsPanel onApplyModel$={props.onApplyModel$} />
            <PhotoObjectivePanel
              form={props.form}
              imageName={props.imageName}
              imagePreview={props.imagePreview}
            />
            {props.hasImage ? (
              <>
                <ProblemsPanel
                  form={props.form}
                  onToggleKeepItem$={props.onToggleKeepItem$}
                />
                <EditDetailsPanel form={props.form} />
              </>
            ) : (
              <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h2 class="text-lg font-black">Proximo passo</h2>
                <p class="mt-2 text-sm leading-6 text-slate-400">
                  Primeiro carregue a foto original. Depois disso abriremos os
                  campos para indicar os problemas, detalhes e estilo desejado.
                </p>
              </div>
            )}
          </div>

          <aside class="grid h-fit gap-6 xl:max-h-full xl:overflow-y-auto xl:pr-2 xl:pb-8">
            <ResultPanel
              copied={props.copied}
              finalPrompt={props.finalPrompt}
              identityCode={props.identity.code}
              isAdmin={props.isAdmin}
              onClearForm$={props.onClearForm$}
              onCopyPrompt$={props.onCopyPrompt$}
              onSavePrompt$={props.onSavePrompt$}
              onSubmitRequest$={props.onSubmitRequest$}
              promptCost={props.promptCost}
              submitMessage={props.submitMessage}
              submitting={props.submitting}
            />
            <HistoryPanel history={props.history} isAdmin={props.isAdmin} />
          </aside>
        </section>
      ) : (
        <section class="container mx-auto px-6 py-10">
          <div class="mx-auto max-w-2xl rounded-2xl border border-amber-300/30 bg-amber-300/10 p-6 text-center">
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-amber-100/70">
              Saldo insuficiente
            </p>
            <h2 class="mt-3 text-2xl font-black text-amber-100">
              Precisa de pelo menos {PHOTO_PROMPT_MIN_START_COINS} moedas para
              iniciar um pedido.
            </h2>
            <p class="mt-3 text-sm leading-6 text-amber-100/75">
              Saldo disponivel: {availableCoins} moedas. Adicione moedas pela
              carteira reconhecida no seu numero para iniciar o pedido.
            </p>
            <button
              type="button"
              class="mt-5 rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-slate-950"
              onClick$={() => {
                walletModalOpen.value = true;
              }}
            >
              Adicionar moedas
            </button>
          </div>
        </section>
      )}
    </>
  );
});

export const FormPreload = component$(() => (
  <section class="container mx-auto px-6 py-10">
    <div class="mx-auto grid max-w-3xl gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div class="flex items-center gap-3">
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
        <p class="text-sm font-black text-cyan-100">A carregar o formulario</p>
      </div>
      <div class="grid gap-3">
        <div class="h-12 rounded-xl bg-slate-800/80" />
        <div class="h-28 rounded-xl bg-slate-800/60" />
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="h-12 rounded-xl bg-slate-800/50" />
          <div class="h-12 rounded-xl bg-slate-800/50" />
        </div>
      </div>
    </div>
  </section>
));

export const HeroSection = component$(
  (props: {
    answeredRequests: number;
    availableCoins: number;
    heldCoins: number;
    identity: PhotoPromptIdentity;
    identityOpen: Signal<boolean>;
    isAdmin: boolean;
    passwordMessage: string;
    pendingRequests: number;
    onChangePassword$: QRL<() => void>;
    onLogout$: QRL<() => void>;
    requestsModalOpen: Signal<boolean>;
    walletModalOpen: Signal<boolean>;
  }) => {
    return (
      <section class="border-b border-slate-800 bg-slate-900/40">
        <div class="container mx-auto px-6 py-5">
          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Ferramentas IA
              </p>
              <h1 class="mt-2 text-2xl font-black md:text-4xl">
                Gerador de Prompt para Fotos
              </h1>
            </div>

            <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] items-stretch gap-2 sm:flex sm:justify-end">
              <button
                type="button"
                class="min-w-0 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-3 text-left text-xs font-bold text-emerald-100 transition hover:bg-emerald-300/20 sm:min-w-36"
                onClick$={() => {
                  props.walletModalOpen.value = true;
                }}
              >
                <span class="block uppercase tracking-[0.12em] opacity-70">
                  Moedas
                </span>
                <span class="text-sm font-black">
                  {props.isAdmin
                    ? "Transferencias"
                    : `${props.availableCoins} disp. / ${props.heldCoins} ret.`}
                </span>
              </button>

              <button
                type="button"
                class="min-w-0 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-3 text-left text-xs font-bold text-amber-100 transition hover:bg-amber-300/20 sm:min-w-36"
                onClick$={() => {
                  props.requestsModalOpen.value = true;
                }}
              >
                <span class="block uppercase tracking-[0.12em] opacity-70">
                  Pedidos
                </span>
                <span class="text-sm font-black">
                  {props.pendingRequests} pend. / {props.answeredRequests} resp.
                </span>
              </button>

              <button
                type="button"
                aria-label={
                  props.identityOpen.value
                    ? "Fechar painel de identidade"
                    : "Abrir painel de identidade"
                }
                title={
                  props.identityOpen.value
                    ? "Fechar painel de identidade"
                    : "Abrir painel de identidade"
                }
                class="grid h-full min-h-11 w-11 place-items-center rounded-xl border border-cyan-400/30 text-xl font-black leading-none text-cyan-100 transition hover:bg-cyan-400/10"
                onClick$={() => {
                  props.identityOpen.value = !props.identityOpen.value;
                }}
              >
                {props.identityOpen.value ? "×" : "☰"}
              </button>
            </div>
          </div>

          {props.identityOpen.value && (
            <aside class="mt-5 max-w-md rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-100/70">
                Identificacao
              </p>
              <p class="mt-2 text-2xl font-black text-cyan-100">
                {props.identity.code || "A criar..."}
              </p>
              <p class="mt-1 text-sm text-cyan-100/70">
                Senha:{" "}
                <span class="font-bold">{props.identity.password || "..."}</span>
              </p>

              <div class="mt-4 grid gap-2">
                <input
                  value={props.identity.currentPassword}
                  placeholder="Senha atual"
                  type="password"
                  class="h-10 rounded-xl border border-cyan-400/20 bg-slate-950 px-3 text-sm text-white outline-none"
                  onInput$={(event) => {
                    props.identity.currentPassword = (
                      event.target as HTMLInputElement
                    ).value;
                  }}
                />
                <input
                  value={props.identity.newPassword}
                  placeholder="Nova senha"
                  type="password"
                  class="h-10 rounded-xl border border-cyan-400/20 bg-slate-950 px-3 text-sm text-white outline-none"
                  onInput$={(event) => {
                    props.identity.newPassword = (
                      event.target as HTMLInputElement
                    ).value;
                  }}
                />
                <button
                  type="button"
                  class="rounded-xl bg-cyan-300 px-3 py-2 text-sm font-black text-slate-950"
                  onClick$={props.onChangePassword$}
                >
                  Alterar senha
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-cyan-400/30 px-3 py-2 text-sm font-bold text-cyan-100"
                  onClick$={props.onLogout$}
                >
                  Trocar ID
                </button>
              </div>

              {props.passwordMessage && (
                <p class="mt-3 text-xs font-bold text-cyan-100">
                  {props.passwordMessage}
                </p>
              )}
            </aside>
          )}
        </div>
      </section>
    );
  },
);

export const ToolModal = component$(
  (props: { title: string; onClose$: QRL<() => void> }) => (
    <div class="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <section class="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
        <div class="mb-4 flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <h2 class="text-lg font-black text-white">{props.title}</h2>
          <button
            type="button"
            class="rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200"
            onClick$={props.onClose$}
          >
            Fechar
          </button>
        </div>
        <Slot />
      </section>
    </div>
  ),
);

export const QuickModelsPanel = component$(
  (props: { onApplyModel$: QRL<(modelIndex: number) => void> }) => (
    <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 class="text-lg font-black">Modelos rapidos</h2>
      <div class="mt-4 flex flex-wrap gap-2">
        {quickModels.map((model, index) => (
          <button
            key={model.label}
            type="button"
            class="rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200"
            onClick$={() => props.onApplyModel$(index)}
          >
            {model.label}
          </button>
        ))}
      </div>
    </div>
  ),
);

export const PhotoObjectivePanel = component$(
  (props: {
    form: PhotoPromptForm;
    imageName: Signal<string>;
    imagePreview: Signal<string>;
  }) => (
    <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 class="text-lg font-black">Foto e objetivo</h2>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <label>
          <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Tipo de foto
          </span>
          <select
            value={props.form.photoType}
            class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
            onChange$={(event) => {
              const nextPhotoType = (event.target as HTMLSelectElement).value;
              const validObjectives = getObjectiveOptions(nextPhotoType);

              props.form.photoType = nextPhotoType;
              props.form.objective = validObjectives[0];
            }}
          >
            {photoTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Objetivo
          </span>
          <select
            value={props.form.objective}
            class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
            onChange$={(event) => {
              props.form.objective = (event.target as HTMLSelectElement).value;
            }}
          >
            {getObjectiveOptions(props.form.photoType).map((objective) => (
              <option key={objective} value={objective}>
                {objective}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label class="mt-4 block">
        <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
          Foto original
        </span>
        <input
          accept="image/*"
          type="file"
          class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-950"
          onChange$={(event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            props.imagePreview.value = file ? URL.createObjectURL(file) : "";
            props.imageName.value = file?.name || "";
          }}
        />
      </label>

      {props.imagePreview.value && (
        <div class="mt-4 flex max-h-[520px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <img
            src={props.imagePreview.value}
            alt="Pre-visualizacao"
            width={640}
            height={520}
            class="max-h-[520px] w-full object-contain"
          />
        </div>
      )}
    </div>
  ),
);

export const ProblemsPanel = component$(
  (props: {
    form: PhotoPromptForm;
    onToggleKeepItem$: QRL<(item: string) => void>;
  }) => (
    <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 class="text-lg font-black">O que deve ser mantido</h2>
      <div class="mt-4 grid gap-2 md:grid-cols-2">
        {keepOptions.map((item) => (
          <label
            key={item}
            class="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-300"
          >
            <input
              checked={props.form.keepItems.includes(item)}
              type="checkbox"
              onChange$={() => props.onToggleKeepItem$(item)}
            />
            {item}
          </label>
        ))}
      </div>
    </div>
  ),
);

export const EditDetailsPanel = component$(
  (props: { form: PhotoPromptForm }) => (
    <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 class="text-lg font-black">Detalhes da edicao</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <SelectOption
          value={props.form.clothingType}
          label="Tipo de roupa"
          options={clothingTypeOptions}
          onChange$={(value) => {
            props.form.clothingType = value;
          }}
        />
        {(props.form.photoType === "Foto com muitas pessoas" ||
          props.form.photoType === "Quadros ou colagens") && (
          <SelectOption
            value={props.form.groupComposition}
            label="Composicao das pessoas"
            options={groupCompositionOptions}
            onChange$={(value) => {
              props.form.groupComposition = value;
            }}
          />
        )}
        <SelectOption
          value={props.form.clothingColor}
          label="Cor da roupa"
          options={clothingColorOptions}
          onChange$={(value) => {
            props.form.clothingColor = value;
          }}
        />
        <SelectOption
          value={props.form.clothingStyle}
          label="Estilo da roupa"
          options={clothingStyleOptions}
          onChange$={(value) => {
            props.form.clothingStyle = value;
          }}
        />
        <SelectOption
          value={props.form.hair}
          label="Cabelo"
          options={hairOptions}
          onChange$={(value) => {
            props.form.hair = value;
            if (value === "Manter cabelo original") {
              props.form.hairType = "Manter tipo original";
            }
          }}
        />
        {props.form.hair !== "Manter cabelo original" && (
          <SelectOption
            value={props.form.hairType}
            label="Tipo de cabelo ou tranca"
            options={hairTypeOptions}
            onChange$={(value) => {
              props.form.hairType = value;
            }}
          />
        )}
        <SelectOption
          value={props.form.shoes}
          label="Calcado"
          options={shoesOptions}
          onChange$={(value) => {
            props.form.shoes = value;
          }}
        />
        <label>
          <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Estilo final
          </span>
        <select
          value={props.form.finalStyle}
          class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
          onChange$={(event) => {
            props.form.finalStyle = (event.target as HTMLSelectElement).value;
          }}
        >
          {styleOptions.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
        </label>
        <label>
          <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Proporcao
          </span>
        <select
          value={props.form.aspectRatio}
          class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
          onChange$={(event) => {
            props.form.aspectRatio = (event.target as HTMLSelectElement).value;
          }}
        >
          {aspectRatios.map((ratio) => (
            <option key={ratio} value={ratio}>
              {ratio}
            </option>
          ))}
        </select>
        </label>
        <SelectOption
          value={props.form.textOnImage}
          label="Texto na imagem"
          options={textOnImageOptions}
          onChange$={(value) => {
            props.form.textOnImage = value;
            if (value === "Sem texto" || value === "Manter texto existente") {
              props.form.textOnImageContent = "";
            }
          }}
        />
        {props.form.textOnImage !== "Sem texto" &&
          props.form.textOnImage !== "Manter texto existente" && (
            <label>
              <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Conteudo do texto
              </span>
              <input
                value={props.form.textOnImageContent}
                placeholder="Escreva o texto"
                class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                onInput$={(event) => {
                  props.form.textOnImageContent = (
                    event.target as HTMLInputElement
                  ).value;
                }}
              />
            </label>
          )}
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
      <SelectOption
        value={props.form.background}
        label="Fundo e ambiente"
        options={backgroundOptions}
        onChange$={(value) => {
          props.form.background = value;
        }}
      />
      <SelectOption
        value={props.form.lighting}
        label="Iluminacao"
        options={lightingOptions}
        onChange$={(value) => {
          props.form.lighting = value;
        }}
      />
      <SelectOption
        value={props.form.extraDetails}
        label="Detalhe rapido"
        options={extraDetailOptions}
        onChange$={(value) => {
          props.form.extraDetails = value;
        }}
      />
      <TextOption
        value={props.form.observations}
        label="Observacoes do cliente"
        placeholder="Ex.: quero uma foto mais clara e natural"
        onInput$={(value) => {
          props.form.observations = value;
        }}
      />
      <TextOption
        value={props.form.removeElements}
        label="Elementos a remover"
        placeholder="Ex.: pessoas ao fundo, manchas, objetos"
        onInput$={(value) => {
          props.form.removeElements = value;
        }}
      />
      <TextOption
        value={props.form.addElements}
        label="Elementos a adicionar"
        placeholder="Ex.: fundo limpo, nome, detalhe discreto"
        onInput$={(value) => {
          props.form.addElements = value;
        }}
      />
      <TextOption
        value={props.form.styleReference}
        label="Referencia de estilo"
        placeholder="Ex.: foto profissional de LinkedIn"
        onInput$={(value) => {
          props.form.styleReference = value;
        }}
      />
      </div>

      <div class="mt-4 grid gap-2 md:grid-cols-2">
        <BooleanOption
          checked={props.form.preserveIdentity}
          label="Preservar identidade"
          onChange$={(checked) => {
            props.form.preserveIdentity = checked;
          }}
        />
        <BooleanOption
          checked={props.form.preserveBody}
          label="Preservar corpo e pose"
          onChange$={(checked) => {
            props.form.preserveBody = checked;
          }}
        />
        <BooleanOption
          checked={props.form.childSubject}
          label="Sujeito e crianca"
          onChange$={(checked) => {
            props.form.childSubject = checked;
          }}
        />
        <BooleanOption
          checked={props.form.negativePrompt}
          label="Incluir prompt negativo"
          onChange$={(checked) => {
            props.form.negativePrompt = checked;
          }}
        />
      </div>
    </div>
  ),
);

export const SelectOption = component$(
  (props: {
    label: string;
    onChange$: QRL<(value: string) => void>;
    options: string[];
    value: string;
  }) => (
    <label>
      <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        {props.label}
      </span>
      <select
        value={props.value}
        class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onChange$={(event) => {
          props.onChange$((event.target as HTMLSelectElement).value);
        }}
      >
        {props.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  ),
);

export const TextOption = component$(
  (props: {
    label: string;
    onInput$: QRL<(value: string) => void>;
    placeholder: string;
    value: string;
  }) => (
    <label>
      <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        {props.label}
      </span>
      <input
        value={props.value}
        placeholder={props.placeholder}
        class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
        onInput$={(event) => {
          props.onInput$((event.target as HTMLInputElement).value);
        }}
      />
    </label>
  ),
);

export const BooleanOption = component$(
  (props: {
    checked: boolean;
    label: string;
    onChange$: QRL<(checked: boolean) => void>;
  }) => (
    <label class="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-300">
      <input
        checked={props.checked}
        type="checkbox"
        onChange$={(event) => {
          props.onChange$((event.target as HTMLInputElement).checked);
        }}
      />
      {props.label}
    </label>
  ),
);

export const ResultPanel = component$(
  (props: {
    copied: boolean;
    finalPrompt: string;
    identityCode: string;
    isAdmin: boolean;
    onClearForm$: QRL<() => void>;
    onCopyPrompt$: QRL<() => void>;
    onSavePrompt$: QRL<() => void>;
    onSubmitRequest$: QRL<() => void>;
    promptCost: {
      billableFields: string[];
      coins: number;
      meticais: number;
    };
    submitMessage: string;
    submitting: boolean;
  }) => (
    <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-black">Resultado</h2>
        {props.isAdmin && (
          <span class="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">
            Admin
          </span>
        )}
      </div>

      {props.isAdmin ? (
        <textarea
          value={props.finalPrompt}
          readOnly
          class="mt-4 min-h-96 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm leading-6 text-slate-100 outline-none"
          onInput$={() => undefined}
        />
      ) : (
        <div class="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
          <p class="text-sm font-bold text-cyan-100">
            Pedido preparado com seguranca.
          </p>
          <p class="mt-2 text-sm leading-6 text-cyan-100/70">
            Envie o codigo {props.identityCode} para a equipa Bitoll acompanhar
            e responder ao seu pedido com mais seguranca.
          </p>
        </div>
      )}

      {!props.isAdmin && (
        <div class="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-amber-100/70">
            Custo do pedido
          </p>
          <p class="mt-2 text-2xl font-black text-amber-100">
            {props.promptCost.coins} moedas
          </p>
          <p class="mt-1 text-sm text-amber-100/70">
            1 moeda = {PHOTO_PROMPT_COIN_VALUE_MZN.toLocaleString("pt-MZ")} MT.
            Cada campo aplicado custa 10 moedas.
          </p>
          <p class="mt-1 text-xs font-bold text-amber-100/70">
            Equivalente: {props.promptCost.meticais.toLocaleString("pt-MZ")} MT /
            Campos: {props.promptCost.billableFields.length}
          </p>
        </div>
      )}

      {props.isAdmin && (
        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            class="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
            onClick$={props.onCopyPrompt$}
          >
            {props.copied ? "Copiado" : "Copiar prompt"}
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
            onClick$={props.onSavePrompt$}
          >
            Salvar
          </button>
        </div>
      )}

      {!props.isAdmin && (
        <button
          type="button"
          class="mt-4 w-full rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={props.submitting}
          onClick$={props.onSubmitRequest$}
        >
          {props.submitting ? "Enviando..." : "Enviar pedido"}
        </button>
      )}

      {props.submitMessage && (
        <p class="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
          {props.submitMessage}
        </p>
      )}

      <button
        type="button"
        class="mt-2 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
        onClick$={props.onClearForm$}
      >
        Limpar campos
      </button>
    </section>
  ),
);

export const HistoryPanel = component$(
  (props: { history: PromptHistoryItem[]; isAdmin: boolean }) => (
    <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 class="text-lg font-black">Historico</h2>
      <div class="mt-4 grid gap-3">
        {props.history.map((item) => (
          <article
            key={item.id}
            class="rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <p class="text-sm font-bold text-white">{item.objective}</p>
            <p class="mt-1 text-xs text-slate-500">
              {item.photoType} /{" "}
              {new Date(item.createdAt).toLocaleDateString("pt-MZ")}
            </p>
            {props.isAdmin && (
              <button
                type="button"
                class="mt-3 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
                onClick$={() => {
                  navigator.clipboard.writeText(item.prompt);
                }}
              >
                Copiar prompt salvo
              </button>
            )}
          </article>
        ))}

        {props.history.length === 0 && (
          <p class="text-sm text-slate-500">
            Ainda nao ha prompts guardados neste navegador.
          </p>
        )}
      </div>
    </section>
  ),
);

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString("pt-MZ") : "Por responder";

const formatStatus = (value: string) =>
  ({
    aprovado: "Aprovado",
    pendente: "Pendente",
    respondido: "Respondido",
    retido: "Retido",
  })[value] ?? value;

const whatsappHref = (phone: string, text: string) => {
  const digits = phone.replace(/\D/g, "");

  return digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
    : "";
};

export const RequestsPanel = component$(
  (props: {
    adminResponseDraft: {
      coinsCharged: number;
      editedImageUrl: string;
      requestId: string;
      response: string;
    };
    identityCode: string;
    isAdmin: boolean;
    panelMessage: string;
    requests: PhotoPromptRequestItem[];
    onAnswerRequest$: QRL<() => void>;
    onRefreshPanels$: QRL<() => void>;
  }) => (
    <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-black">
          {props.isAdmin ? "Pedidos recebidos" : "Meus pedidos"}
        </h2>
        <button
          type="button"
          class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
          onClick$={props.onRefreshPanels$}
        >
          Atualizar
        </button>
      </div>

      {props.panelMessage && (
        <p class="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm font-bold text-cyan-100">
          {props.panelMessage}
        </p>
      )}

      <div class="mt-4 grid gap-3">
        {props.requests.map((request) => {
          const message = [
            "Boa noite.",
            `Pedido IA: ${request.id}`,
            `Cliente/ID: ${request.whatsapp || props.identityCode}`,
            request.edited_image_url
              ? `Foto editada: ${request.edited_image_url}`
              : "",
            request.admin_response ? `Resposta: ${request.admin_response}` : "",
            "Bitoll - Seguranca e Tecnologia",
          ]
            .filter(Boolean)
            .join("\n");
          const href = whatsappHref(request.whatsapp, message);

          return (
            <article
              key={request.id}
              class="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-black text-white">{request.objective}</p>
                  <p class="mt-1 text-xs text-slate-500">
                    {request.photo_type} / {formatDate(request.created_at)}
                  </p>
                  <p class="mt-1 text-xs font-bold text-cyan-100">
                    Estado: {formatStatus(request.status)}
                  </p>
                </div>
                <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200">
                  {request.image_name || "Sem nome da imagem"}
                </span>
              </div>

              {request.admin_response && (
                <p class="mt-3 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">
                  {request.admin_response}
                </p>
              )}

              {request.edited_image_url && (
                <a
                  href={request.edited_image_url}
                  target="_blank"
                  class="mt-3 inline-flex rounded-lg border border-cyan-300/30 px-3 py-2 text-xs font-bold text-cyan-100"
                >
                  Abrir foto editada
                </a>
              )}

              {props.isAdmin && (
                <div class="mt-4 grid gap-3">
                  <button
                    type="button"
                    class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
                    onClick$={() => {
                      props.adminResponseDraft.requestId = request.id;
                      props.adminResponseDraft.response =
                        request.admin_response || "";
                      props.adminResponseDraft.editedImageUrl =
                        request.edited_image_url || "";
                      props.adminResponseDraft.coinsCharged =
                        request.coins_charged || 0;
                    }}
                  >
                    Responder este pedido
                  </button>

                  {props.adminResponseDraft.requestId === request.id && (
                    <div class="grid gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                      <textarea
                        value={props.adminResponseDraft.response}
                        placeholder="Resposta para o cliente"
                        class="min-h-24 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                        onInput$={(event) => {
                          props.adminResponseDraft.response = (
                            event.target as HTMLTextAreaElement
                          ).value;
                        }}
                      />
                      <input
                        value={props.adminResponseDraft.editedImageUrl}
                        placeholder="Link da foto editada"
                        class="h-11 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                        onInput$={(event) => {
                          props.adminResponseDraft.editedImageUrl = (
                            event.target as HTMLInputElement
                          ).value;
                        }}
                      />
                      <input
                        value={props.adminResponseDraft.coinsCharged}
                        placeholder="Moedas cobradas"
                        type="number"
                        min={0}
                        class="h-11 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                        onInput$={(event) => {
                          props.adminResponseDraft.coinsCharged = Number(
                            (event.target as HTMLInputElement).value || 0,
                          );
                        }}
                      />
                      <div class="grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          class="rounded-xl bg-emerald-300 px-3 py-2 text-sm font-black text-slate-950"
                          onClick$={props.onAnswerRequest$}
                        >
                          Guardar resposta
                        </button>
                        {href && (
                          <a
                            href={href}
                            target="_blank"
                            class="rounded-xl border border-emerald-300/30 px-3 py-2 text-center text-sm font-bold text-emerald-100"
                          >
                            Abrir WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}

        {props.requests.length === 0 && (
          <p class="text-sm text-slate-500">
            {props.isAdmin
              ? "Ainda nao ha pedidos de edicao de imagem."
              : "Ainda nao enviou pedidos de edicao de imagem."}
          </p>
        )}
      </div>
    </section>
  ),
);

export const WalletTransferList = component$(
  (props: {
    emptyMessage: string;
    transfers: PhotoPromptWalletTransfer[];
  }) => (
    <div class="grid gap-3">
      {props.transfers.map((transfer) => (
        <article
          key={transfer.id}
          class="rounded-xl border border-slate-800 bg-slate-950 p-4"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-sm font-black text-white">
                {transfer.method} / {transfer.transfer_reference}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {transfer.whatsapp} / {formatDate(transfer.created_at)}
              </p>
            </div>
            <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200">
              {formatStatus(transfer.status)}
            </span>
          </div>
          <p class="mt-3 text-sm text-slate-300">
            Valor: {Number(transfer.amount || 0).toLocaleString("pt-MZ")} MZN
            / Moedas: {transfer.coins}
          </p>
          {transfer.admin_note && (
            <p class="mt-2 text-xs font-bold text-amber-100">
              {transfer.admin_note}
            </p>
          )}
        </article>
      ))}

      {props.transfers.length === 0 && (
        <p class="text-sm text-slate-500">{props.emptyMessage}</p>
      )}
    </div>
  ),
);

export const WalletPanel = component$(
  (props: {
    adminTransferDraft: {
      note: string;
      transferId: string;
    };
    identity: PhotoPromptIdentity;
    isAdmin: boolean;
    paymentDraft: {
      amount: number;
      coins: number;
      method: PhotoPromptWalletMethod;
      reference: string;
    };
    spentCoins: number;
    transferSubmitting: boolean;
    adminTransferSubmittingId: string;
    transfers: PhotoPromptWalletTransfer[];
    onSubmitTransfer$: QRL<() => void>;
    onUpdateTransferStatus$: QRL<(
      transferId: string,
      status: PhotoPromptWalletTransfer["status"],
    ) => void>;
  }) => {
    const transferStatusModal = useSignal<"aprovado" | "retido" | "">("");
    const activeTransfers = props.transfers.filter(
      (transfer) =>
        transfer.status === "aprovado" || transfer.status === "pendente",
    );
    const heldTransfers = props.transfers.filter(
      (transfer) => transfer.status === "retido",
    );
    const activeCoins = props.transfers
      .filter((transfer) =>
        transfer.status === "aprovado" || transfer.status === "pendente",
      )
      .reduce((sum, transfer) => sum + Number(transfer.coins || 0), 0);
    const approvedCoins = props.transfers
      .filter((transfer) => transfer.status === "aprovado")
      .reduce((sum, transfer) => sum + Number(transfer.coins || 0), 0);
    const availableCoins = Math.max(0, activeCoins - props.spentCoins);
    const heldCoins = props.transfers
      .filter((transfer) => transfer.status === "retido")
      .reduce((sum, transfer) => sum + Number(transfer.coins || 0), 0);
    const visibleTransfers = props.transfers;
    const detectedWallet = detectMozambiqueWalletMethod(props.identity.code);

    return (
      <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 class="text-lg font-black">
          {props.isAdmin ? "Transferencias de moedas" : "Moedas do sistema"}
        </h2>

        {!props.isAdmin && (
          <div class="mt-4 grid gap-3">
            <div class="grid gap-2 sm:grid-cols-3">
              <div class="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                <p class="text-xs font-bold text-emerald-100/70">Disponiveis</p>
                <p class="mt-1 text-2xl font-black text-emerald-100">
                  {availableCoins}
                </p>
              </div>
              <button
                type="button"
                class="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-left transition hover:bg-cyan-300/20"
                onClick$={() => {
                  transferStatusModal.value = "aprovado";
                }}
              >
                <p class="text-xs font-bold text-cyan-100/70">Aprovados</p>
                <p class="mt-1 text-2xl font-black text-cyan-100">
                  {approvedCoins}
                </p>
              </button>
              <button
                type="button"
                class="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-left transition hover:bg-amber-300/20"
                onClick$={() => {
                  transferStatusModal.value = "retido";
                }}
              >
                <p class="text-xs font-bold text-amber-100/70">Retidos</p>
                <p class="mt-1 text-2xl font-black text-amber-100">
                  {heldCoins}
                </p>
              </button>
            </div>

            <div class="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p class="text-sm font-black text-white">Comprar moedas</p>
              <div class="mt-3 grid gap-2">
                <label class="grid gap-1 text-xs font-bold text-slate-400">
                  Numero usado para transferencia
                  <input
                    value={props.identity.code}
                    readOnly
                    class="h-11 rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-slate-300 outline-none"
                  />
                </label>
                <div
                  class={[
                    "rounded-xl border p-3",
                    detectedWallet.method
                      ? "border-emerald-300/20 bg-emerald-300/10"
                      : "border-red-300/30 bg-red-300/10",
                  ]}
                >
                  <p
                    class={[
                      "text-xs font-bold",
                      detectedWallet.method
                        ? "text-emerald-100/70"
                        : "text-red-100/80",
                    ]}
                  >
                    Carteira reconhecida
                  </p>
                  <p
                    class={[
                      "mt-1 text-sm font-black",
                      detectedWallet.method ? "text-emerald-100" : "text-red-100",
                    ]}
                  >
                    {detectedWallet.method || "Operacao indisponivel"}
                  </p>
                  {!detectedWallet.method && (
                    <p class="mt-2 text-xs font-bold text-red-100/80">
                      {detectedWallet.error}
                    </p>
                  )}
                </div>
                <label class="grid gap-1 text-xs font-bold text-slate-400">
                  ID da transacao
                  <input
                    value={props.paymentDraft.reference}
                    placeholder="Ex.: PP123456789"
                    class="h-11 rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
                    onInput$={(event) => {
                      props.paymentDraft.reference = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                </label>
                <label class="grid gap-1 text-xs font-bold text-slate-400">
                  Valor transferido
                  <input
                    value={props.paymentDraft.amount}
                    placeholder="Ex.: 10"
                    type="number"
                    min={0}
                    step={0.1}
                    class="h-11 rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
                    onInput$={(event) => {
                      const amount = Number(
                        (event.target as HTMLInputElement).value || 0,
                      );
                      props.paymentDraft.amount = amount;
                      props.paymentDraft.coins = Math.floor(
                        amount / PHOTO_PROMPT_COIN_VALUE_MZN,
                      );
                    }}
                  />
                </label>
                <div class="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3">
                  <p class="text-xs font-bold text-cyan-100/70">
                    Moedas a adicionar
                  </p>
                  <p class="mt-1 text-2xl font-black text-cyan-100">
                    {props.paymentDraft.coins}
                  </p>
                </div>
                <p class="text-xs font-bold text-slate-500">
                  Taxa: 1 moeda = {PHOTO_PROMPT_COIN_VALUE_MZN.toLocaleString("pt-MZ")} MT. A compra entra como pendente e o admin pode reter caso o ID da transacao nao seja evidente.
                </p>
                <button
                  type="button"
                  disabled={props.transferSubmitting || !detectedWallet.method}
                  class="flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  onClick$={props.onSubmitTransfer$}
                >
                  {props.transferSubmitting && (
                    <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  )}
                  {props.transferSubmitting
                    ? "A enviar transferencia"
                    : "Enviar transferencia"}
                </button>
              </div>
            </div>
          </div>
        )}

        {transferStatusModal.value && (
          <ToolModal
            title={
              transferStatusModal.value === "aprovado"
                ? "Compras aprovadas e pendentes"
                : "Moedas retidas"
            }
            onClose$={() => {
              transferStatusModal.value = "";
            }}
          >
            <WalletTransferList
              emptyMessage={
                transferStatusModal.value === "aprovado"
                  ? "Ainda nao ha compras aprovadas ou pendentes."
                  : "Ainda nao ha moedas retidas."
              }
              transfers={
                transferStatusModal.value === "aprovado"
                  ? activeTransfers
                  : heldTransfers
              }
            />
          </ToolModal>
        )}

        {props.isAdmin && (
        <div class="mt-4 grid gap-3">
          {visibleTransfers.map((transfer) => (
            <article
              key={transfer.id}
              class="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-black text-white">
                    {transfer.method} / {transfer.transfer_reference}
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    {transfer.whatsapp} / {formatDate(transfer.created_at)}
                  </p>
                </div>
                <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200">
                  {formatStatus(transfer.status)}
                </span>
              </div>
              <p class="mt-3 text-sm text-slate-300">
                Valor: {Number(transfer.amount || 0).toLocaleString("pt-MZ")} MZN
                / Moedas: {transfer.coins}
              </p>
              {transfer.admin_note && (
                <p class="mt-2 text-xs font-bold text-amber-100">
                  {transfer.admin_note}
                </p>
              )}

              {props.isAdmin && (
                <div class="mt-3 grid gap-2">
                  <input
                    value={
                      props.adminTransferDraft.transferId === transfer.id
                        ? props.adminTransferDraft.note
                        : ""
                    }
                    placeholder="Nota do admin"
                    class="h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
                    onInput$={(event) => {
                      props.adminTransferDraft.transferId = transfer.id;
                      props.adminTransferDraft.note = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                  <div class="grid gap-2 sm:grid-cols-2">
                    {props.adminTransferSubmittingId === transfer.id && (
                      <div class="flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-100 sm:col-span-2">
                        <span class="h-4 w-4 animate-spin rounded-full border-2 border-cyan-100 border-t-transparent" />
                        A atualizar transferencia
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={Boolean(props.adminTransferSubmittingId)}
                      class="rounded-lg bg-emerald-300 px-3 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                      onClick$={() =>
                        props.onUpdateTransferStatus$(transfer.id, "aprovado")
                      }
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(props.adminTransferSubmittingId)}
                      class="rounded-lg border border-amber-300/40 px-3 py-2 text-xs font-bold text-amber-100 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
                      onClick$={() =>
                        props.onUpdateTransferStatus$(transfer.id, "retido")
                      }
                    >
                      Reter
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}

          {visibleTransfers.length === 0 && (
            <p class="text-sm text-slate-500">
              Ainda nao ha transferencias de moedas.
            </p>
          )}
        </div>
        )}
      </section>
    );
  },
);
