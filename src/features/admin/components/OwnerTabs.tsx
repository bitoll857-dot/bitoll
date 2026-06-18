import { component$, useSignal } from "@builder.io/qwik";

import type { AdminPanelState } from "../hooks/useAdminPanel";
import type { OwnerTab } from "../types/admin.types";
import { asNumber, getStructureEstimatedDays } from "../utils/admin.utils";
import { formatMoney } from "~/lib/formatters/money";
import { getSupabaseBrowserClient } from "~/lib/supabase/client";

import {
  OperatorQuotesPanel,
} from "./OperatorQuotesPanel";
import {
  ProductForm,
  PromotionForm,
  ServiceForm,
  StructureOptionForm,
  TemplateForm,
} from "./OwnerForms";

type Props = {
  admin: AdminPanelState;
};

type OwnerViewMode = "table" | "cards" | "list";

type CustomerAccessResponse = {
  customerId?: string;
  message?: string;
  ok: boolean;
  temporaryPassword?: string;
  trackingUrl?: string;
  username?: string;
};

const headerTabs: { value: OwnerTab; label: string }[] = [
  { value: "services", label: "Geral" },
  { value: "revenues", label: "Receitas" },
  { value: "users", label: "Usuarios" },
];

const tabs: { value: OwnerTab; label: string }[] = [
  { value: "services", label: "Servicos" },
  { value: "operations", label: "Operador" },
  { value: "structures", label: "Estruturas" },
  { value: "products", label: "Artigos" },
  { value: "templates", label: "Cotacoes padrao" },
  { value: "customQuotes", label: "Cotacao personalizada" },
  { value: "promotions", label: "Promocoes" },
  { value: "quotes", label: "Solicitacoes" },
];

const viewModes: { value: OwnerViewMode; label: string }[] = [
  { value: "table", label: "Tabela" },
  { value: "cards", label: "Cartao" },
  { value: "list", label: "Lista" },
];

const tableClass = "w-full text-left text-sm max-md:block";
const tableHeadClass =
  "text-xs uppercase tracking-[0.14em] text-slate-500 max-md:hidden";
const tableBodyClass =
  "divide-y divide-slate-800 max-md:grid max-md:gap-3 max-md:divide-y-0";
const tableRowClass =
  "max-md:block max-md:rounded-xl max-md:border max-md:border-slate-800 max-md:bg-slate-950 max-md:p-4";
const tableCellClass =
  "py-3 max-md:flex max-md:items-start max-md:justify-between max-md:gap-4 max-md:border-b max-md:border-slate-800 max-md:py-3 max-md:text-right max-md:last:border-b-0 max-md:before:shrink-0 max-md:before:content-[attr(data-label)] max-md:before:text-left max-md:before:text-xs max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.12em] max-md:before:text-slate-500";
const tableActionCellClass = `${tableCellClass} text-right`;

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const createSimplePdfBlob = (lines: string[]) => {
  const safeLines = lines.flatMap((line) => {
    const chunks = line.match(/.{1,78}/g) ?? [""];

    return chunks;
  });
  const contentLines = [
    "BT",
    "/F1 11 Tf",
    "50 790 Td",
    "14 TL",
    ...safeLines.map((line, index) =>
      index === 0
        ? `(${escapePdfText(line)}) Tj`
        : `T* (${escapePdfText(line)}) Tj`,
    ),
    "ET",
  ];
  const content = contentLines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const normalizeWhatsAppPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  if (digits.length === 9 && digits.startsWith("8")) {
    return `258${digits}`;
  }

  return digits;
};

const getCustomQuoteWhatsAppHref = (
  quote: {
    commitment_terms?: string;
    currency: string;
    customer_contact: string;
    customer_name: string;
    notes?: string;
    quote_number: string;
    selected_items: unknown;
    total: number | string;
  },
) => {
  const phone = normalizeWhatsAppPhone(quote.customer_contact);

  if (!phone || phone.length < 8) {
    return "";
  }

  const items = Array.isArray(quote.selected_items)
    ? quote.selected_items
    : [];
  const itemLines = items
    .map((item, index) => {
      const row = item as {
        name?: string;
        quantity?: number;
        shortName?: string;
        unit?: string;
        unitPrice?: number;
      };
      const quantity = asNumber(row.quantity || 1);
      const unitPrice = asNumber(row.unitPrice || 0);
      const articleName = row.shortName || row.name || "Artigo";

      return `${index + 1}. ${articleName} - ${quantity.toLocaleString(
        "pt-MZ",
      )} ${row.unit || "Un"} - ${formatMoney(
        quantity * unitPrice,
        quote.currency,
      )}`;
    })
    .join("\n");
  const message = [
    `Boa noite, ${quote.customer_name || "cliente"}.`,
    `Segue a cotacao personalizada ${quote.quote_number}.`,
    "",
    itemLines ? `Artigos:\n${itemLines}` : "",
    `Total: ${formatMoney(asNumber(quote.total), quote.currency)}`,
    quote.commitment_terms
      ? `\nTermos de compromisso:\n${quote.commitment_terms}`
      : "",
    quote.notes ? `\nNotas:\n${quote.notes}` : "",
    "",
    "Bitoll - Seguranca e Tecnologia",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const formatProformaStatus = (status: string) =>
  ({
    enviado: "Enviado",
    fatura_proforma_cumprida: "Fatura proforma cumprida",
    recebido: "Recebido",
    recusado: "Recusado",
  })[status] ?? status;

export const OwnerTabs = component$<Props>(({ admin }) => {
  const ownerViewMode = useSignal<OwnerViewMode>("table");
  const areaSelectOpen = useSignal(false);
  const customQuoteActionsId = useSignal("");
  const quoteActionsId = useSignal("");
  const serviceAreaModal = useSignal<OwnerTab | "">("");
  const serviceAreasOpenId = useSignal("");
  const viewSelectOpen = useSignal(false);
  const searchTerm = admin.ownerSearch.value.trim().toLowerCase();
  const procedureQuote = admin.operatorQuotes.value.find(
    (quote) => quote.id === admin.quoteProcedureQuoteId.value,
  );
  const procedureStructureKey =
    typeof procedureQuote?.request_payload?.structureType === "string"
      ? procedureQuote.request_payload.structureType
      : "";
  const procedureStructure = admin.ownerStructureOptions.value.find(
    (option) =>
      option.service_slug === procedureQuote?.service_slug &&
      option.structure === procedureStructureKey,
  );
  const procedureSteps =
    admin.quoteProcedureSteps.items.length > 0
      ? admin.quoteProcedureSteps.items
      : procedureStructure?.steps.length
        ? procedureStructure.steps.map((step) => ({
            checked: false,
            day: step.day,
            label: step.label,
          }))
        : [];
  const procedureEstimatedDays = getStructureEstimatedDays(procedureSteps);
  const procedureServiceEndDate =
    admin.quoteProcedureStartDate.value && procedureEstimatedDays > 0
      ? (() => {
          const date = new Date(
            `${admin.quoteProcedureStartDate.value}T00:00:00`,
          );

          date.setDate(date.getDate() + procedureEstimatedDays);

          return date.toISOString().slice(0, 10);
        })()
      : "";
  const procedurePaymentLabel =
    admin.quoteProcedurePaymentType.value === "proforma"
      ? "Pagou a fatura proforma"
      : admin.quoteProcedurePaymentType.value === "labor"
        ? "Pagou mao de obra da fatura proforma"
        : "";
  const procedureAccountingAmount =
    admin.quoteProcedurePaymentType.value === "labor"
      ? asNumber(procedureQuote?.labor_total ?? 0)
      : admin.quoteProcedurePaymentType.value === "proforma"
        ? asNumber(procedureQuote?.total ?? 0)
        : 0;
  const procedureReceiptNumber =
    admin.quoteProcedureReceiptNumber.value ||
    (procedureQuote ? `REC-${procedureQuote.quote_number}` : "");
  const procedureWhatsappPhone = normalizeWhatsAppPhone(
    procedureQuote?.profiles?.phone ??
      (typeof procedureQuote?.request_payload?.contacto === "string"
        ? procedureQuote.request_payload.contacto
        : ""),
  );
  const procedureWhatsappText = procedureQuote
    ? [
        `Boa noite, ${procedureQuote.profiles?.full_name ?? "cliente"}.`,
        `Confirmamos o pagamento: ${procedurePaymentLabel || "pagamento da solicitacao"}.`,
        `Recibo: ${procedureReceiptNumber}.`,
        `Solicitacao: ${procedureQuote.quote_number}.`,
        `Total registado: ${formatMoney(asNumber(procedureQuote.total), procedureQuote.currency)}.`,
        "Segue o recibo em PDF para anexar nesta conversa.",
        "",
        "Bitoll - Seguranca e Tecnologia",
      ].join("\n")
    : "";
  const procedureWhatsappHref =
    procedureWhatsappPhone && procedureWhatsappText
      ? `https://wa.me/${procedureWhatsappPhone}?text=${encodeURIComponent(
          procedureWhatsappText,
        )}`
      : "";
  const procedureHasPaymentProof =
    Boolean(admin.quoteProcedurePaymentType.value) &&
    admin.quoteProcedurePaymentAmount.value > 0 &&
    Boolean(admin.quoteProcedurePaymentMethod.value) &&
    (admin.quoteProcedurePaymentMethod.value === "cash" ||
      (Boolean(admin.quoteProcedurePaymentOriginType.value) &&
        Boolean(admin.quoteProcedurePaymentOriginNumber.value.trim()) &&
        Boolean(admin.quoteProcedurePaymentDestinationType.value) &&
        Boolean(admin.quoteProcedurePaymentDestinationNumber.value.trim())));
  const procedureHasOperator = Boolean(admin.quoteProcedureOperatorId.value);
  const procedureHasStartDate = Boolean(admin.quoteProcedureStartDate.value);
  const procedureHasSteps = procedureSteps.some((step) => step.label.trim());
  const procedureReady =
    procedureHasPaymentProof &&
    procedureHasOperator &&
    procedureHasStartDate &&
    procedureHasSteps &&
    Boolean(procedureReceiptNumber);

  const filteredServices = searchTerm
    ? admin.ownerServices.value.filter((service) =>
        `${service.title} ${service.slug} ${service.short_description}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerServices.value;

  const filteredProducts = searchTerm
    ? admin.ownerProducts.value.filter((product) =>
        `${product.name} ${product.service_slug} ${product.brand}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerProducts.value;

  const filteredStructures = searchTerm
    ? admin.ownerStructureOptions.value.filter((option) =>
        `${option.title} ${option.service_slug} ${option.structure}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerStructureOptions.value;

  const filteredTemplates = searchTerm
    ? admin.ownerTemplates.value.filter((template) =>
        `${template.title} ${template.service_slug} ${template.structure}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerTemplates.value;

  const filteredPromotions = searchTerm
    ? admin.ownerPromotions.value.filter((promotion) =>
        `${promotion.title} ${promotion.slug ?? ""} ${promotion.discount_label}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerPromotions.value;

  const filteredQuotes = searchTerm
    ? admin.operatorQuotes.value.filter((quote) =>
        `${quote.quote_number} ${quote.service_slug ?? ""} ${
          quote.profiles?.full_name ?? ""
        } ${quote.profiles?.email ?? ""} ${quote.profiles?.phone ?? ""}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.operatorQuotes.value;

  const filteredCustomQuotes = searchTerm
    ? admin.ownerCustomQuotes.value.filter((quote) =>
        `${quote.quote_number} ${quote.customer_name} ${quote.customer_contact} ${quote.service_slug ?? ""} ${quote.status}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerCustomQuotes.value;
  const filteredUsers = searchTerm
    ? admin.ownerCustomers.value.filter((user) =>
        `${user.full_name ?? ""} ${user.email ?? ""} ${user.phone ?? ""} ${
          user.city ?? ""
        }`
          .toLowerCase()
          .includes(searchTerm),
      )
    : admin.ownerCustomers.value;
  const lastCreatedCustomQuote = admin.ownerCustomQuotes.value.find(
    (quote) => quote.id === admin.customQuoteLastCreatedId.value,
  );

  const customQuoteProductSearch =
    admin.customQuoteProductSearch.value.trim().toLowerCase();
  const customQuoteProducts = admin.ownerProducts.value.filter((product) => {
    const matchesService =
      !admin.customQuoteDraft.serviceSlug ||
      product.service_slug === admin.customQuoteDraft.serviceSlug;
    const matchesStructure =
      !admin.customQuoteDraft.structure ||
      product.structure === admin.customQuoteDraft.structure;
    const matchesSearch =
      !customQuoteProductSearch ||
      `${product.name} ${product.service_slug} ${product.structure} ${product.category} ${product.brand}`
        .toLowerCase()
        .includes(customQuoteProductSearch);

    return product.active && matchesService && matchesStructure && matchesSearch;
  });
  const customQuoteContactPhone = normalizeWhatsAppPhone(
    admin.customQuoteDraft.contacto,
  );
  const customQuoteContactLooksLikeWhatsApp =
    customQuoteContactPhone.length >= 8 &&
    !admin.customQuoteDraft.contacto.includes("@");
  const customQuoteProductSubtotal = admin.customQuoteDraft.items.reduce(
    (sum, item) => sum + asNumber(item.unitPrice) * asNumber(item.quantity),
    0,
  );
  const customQuoteExecutionBaseItem = admin.customQuoteDraft.items.find(
    (item) => item.id === admin.customQuoteDraft.executionBaseItemId,
  );
  const customQuoteExecutionQuantity = customQuoteExecutionBaseItem
    ? Math.max(1, asNumber(customQuoteExecutionBaseItem.quantity) || 1)
    : 0;
  const customQuoteExecutionTotal =
    customQuoteExecutionQuantity *
    Math.max(0, asNumber(admin.customQuoteDraft.executionUnitPrice));
  const customQuoteSubtotal =
    customQuoteProductSubtotal + customQuoteExecutionTotal;
  const customQuoteBaseTemplates = admin.ownerTemplates.value.filter(
    (template) =>
      (!admin.customQuoteDraft.serviceSlug ||
        template.service_slug === admin.customQuoteDraft.serviceSlug) &&
      (!admin.customQuoteDraft.structure ||
        template.structure === admin.customQuoteDraft.structure),
  );
  const customQuoteStructureOptions = admin.ownerStructureOptions.value.filter(
    (option) =>
      !admin.customQuoteDraft.serviceSlug ||
      option.service_slug === admin.customQuoteDraft.serviceSlug,
  );
  const showInlineOwnerForm = false as boolean;
  const showInlineCustomQuoteForm = false as boolean;
  const supportsOwnerForm =
    admin.ownerTab.value !== "quotes" &&
    admin.ownerTab.value !== "customQuotes" &&
    admin.ownerTab.value !== "operations" &&
    admin.ownerTab.value !== "revenues" &&
    admin.ownerTab.value !== "users";
  const revenueQuotes = admin.operatorQuotes.value.filter(
    (quote) => quote.status === "finalizado" || quote.status === "concluido",
  );
  const revenueTotal = revenueQuotes.reduce(
    (sum, quote) => sum + asNumber(quote.total),
    0,
  );
  const revenueAverage =
    revenueQuotes.length > 0 ? revenueTotal / revenueQuotes.length : 0;
  const revenueByService = revenueQuotes.reduce(
    (items, quote) => {
      const service = quote.service_slug ?? "Servico Bitoll";
      const current = items[service] ?? { count: 0, total: 0 };

      return {
        ...items,
        [service]: {
          count: current.count + 1,
          total: current.total + asNumber(quote.total),
        },
      };
    },
    {} as Record<string, { count: number; total: number }>,
  );

  const getTabCount = (tab: OwnerTab) => {
    if (tab === "users") {
      return admin.ownerCustomers.value.length;
    }

    if (tab === "revenues") {
      return revenueQuotes.length;
    }

    if (tab === "services") {
      return admin.ownerServices.value.length;
    }

    if (tab === "operations") {
      return admin.operatorQuotes.value.filter(
        (quote) => quote.status === "em_atividade" || quote.status === "aprovado",
      ).length;
    }

    if (tab === "structures") {
      return admin.ownerStructureOptions.value.length;
    }

    if (tab === "products") {
      return admin.ownerProducts.value.length;
    }

    if (tab === "templates") {
      return admin.ownerTemplates.value.length;
    }

    if (tab === "promotions") {
      return admin.ownerPromotions.value.length;
    }

    if (tab === "customQuotes") {
      return admin.ownerCustomQuotes.value.length;
    }

    return admin.operatorQuotes.value.length;
  };

  const modeTableClass =
    ownerViewMode.value === "cards"
      ? "block min-w-0 [&_thead]:hidden [&_tbody]:grid [&_tbody]:gap-4 [&_tbody]:divide-y-0 md:[&_tbody]:grid-cols-2 xl:[&_tbody]:grid-cols-3 [&_tr]:block [&_tr]:rounded-xl [&_tr]:border [&_tr]:border-slate-800 [&_tr]:bg-slate-950 [&_tr]:p-4 [&_td]:block [&_td]:border-b [&_td]:border-slate-800 [&_td]:py-3 [&_td]:text-left [&_td]:before:hidden [&_td:last-child]:border-b-0 [&_td:last-child]:text-right"
      : ownerViewMode.value === "list"
        ? "block min-w-0 [&_thead]:hidden [&_tbody]:grid [&_tbody]:gap-2 [&_tbody]:divide-y-0 [&_tr]:grid [&_tr]:gap-2 [&_tr]:rounded-xl [&_tr]:border [&_tr]:border-slate-800 [&_tr]:bg-slate-950/80 [&_tr]:px-4 [&_tr]:py-3 md:[&_tr]:grid-cols-[1.4fr_1fr_auto_auto] [&_td]:block [&_td]:py-1 [&_td]:text-left [&_td]:before:hidden [&_td:last-child]:text-right"
        : "";

  const widthClass = (value: string) =>
    ownerViewMode.value === "table" ? value : "min-w-0";

  const selectedTab = tabs.find((tab) => tab.value === admin.ownerTab.value);
  const selectedViewMode =
    viewModes.find((mode) => mode.value === ownerViewMode.value) ??
    viewModes[0];
  const selectedActionStructure = admin.ownerStructureOptions.value.find(
    (option) => option.id === admin.openStructureActionsId.value,
  );
  const selectedActionProduct = admin.ownerProducts.value.find(
    (product) => product.id === admin.openProductActionsId.value,
  );
  const selectedActionTemplate = admin.ownerTemplates.value.find(
    (template) => template.id === admin.openTemplateActionsId.value,
  );
  const selectedActionPromotion = admin.ownerPromotions.value.find(
    (promotion) => promotion.id === admin.openPromotionActionsId.value,
  );
  const selectedActionCustomQuote = admin.ownerCustomQuotes.value.find(
    (quote) => quote.id === customQuoteActionsId.value,
  );
  const selectedActionQuote = admin.operatorQuotes.value.find(
    (quote) => quote.id === quoteActionsId.value,
  );
  const selectedActionQuoteIsUnprocessed =
    selectedActionQuote?.status === "em_processamento" ||
    selectedActionQuote?.status === "enviado";
  const selectedActionCustomQuoteItems = selectedActionCustomQuote
    ? Array.isArray(selectedActionCustomQuote.selected_items)
      ? selectedActionCustomQuote.selected_items
      : []
    : [];
  const selectedActionCustomQuoteWhatsAppHref = selectedActionCustomQuote
    ? getCustomQuoteWhatsAppHref(selectedActionCustomQuote)
    : "";
  const selectedActionCustomQuoteItemLines =
    selectedActionCustomQuoteItems
      .map((item, index) => {
        const quantity = asNumber(item.quantity || 1);
        const unitPrice = asNumber(item.unitPrice || 0);

        return `${index + 1}. ${item.name || "Artigo"} | Qtd: ${quantity.toLocaleString("pt-MZ")} ${item.unit || "Un"} | Total: ${formatMoney(quantity * unitPrice, selectedActionCustomQuote?.currency ?? "MZN")}`;
      })
      .join("\n") || "Sem artigos guardados";
  const selectedActionTemplateItems = selectedActionTemplate
    ? admin.ownerTemplateItems.value.filter(
        (item) => item.template_id === selectedActionTemplate.id,
      )
    : [];
  const selectedActionTemplateFields = selectedActionTemplate
    ? admin.ownerTemplateFields.value.filter(
        (field) => field.template_id === selectedActionTemplate.id,
      )
    : [];
  const selectedActionService = admin.ownerServices.value.find(
    (service) => service.id === admin.openServiceActionsId.value,
  );
  const selectedServiceStructures = selectedActionService
    ? admin.ownerStructureOptions.value.filter(
        (option) => option.service_slug === selectedActionService.slug,
      )
    : [];
  const selectedServiceProducts = selectedActionService
    ? admin.ownerProducts.value.filter(
        (product) => product.service_slug === selectedActionService.slug,
      )
    : [];
  const selectedServiceTemplates = selectedActionService
    ? admin.ownerTemplates.value.filter(
        (template) => template.service_slug === selectedActionService.slug,
      )
    : [];
  const selectedServiceCustomQuotes = selectedActionService
    ? admin.ownerCustomQuotes.value.filter(
        (quote) => quote.service_slug === selectedActionService.slug,
      )
    : [];
  const selectedServicePromotions = selectedActionService
    ? admin.ownerPromotions.value.filter(
        (promotion) => promotion.service_slug === selectedActionService.slug,
      )
    : [];
  const selectedServiceQuotes = selectedActionService
    ? admin.operatorQuotes.value.filter(
        (quote) => quote.service_slug === selectedActionService.slug,
      )
    : [];
  const selectedServiceStructureCount = selectedActionService
    ? selectedServiceStructures.length
    : 0;
  const selectedServiceProductCount = selectedActionService
    ? selectedServiceProducts.length
    : 0;
  const selectedServiceTemplateCount = selectedActionService
    ? selectedServiceTemplates.length
    : 0;
  const selectedServiceCustomQuoteCount = selectedActionService
    ? selectedServiceCustomQuotes.length
    : 0;
  const selectedServicePromotionCount = selectedActionService
    ? selectedServicePromotions.length
    : 0;
  const selectedServiceQuoteCount = selectedActionService
    ? selectedServiceQuotes.length
    : 0;
  const serviceAreaModalLabel =
    tabs.find((tab) => tab.value === serviceAreaModal.value)?.label ?? "";
  const openServiceAreaModal = (tab: OwnerTab) => {
    serviceAreaModal.value = tab;
  };

  return (
    <>
      <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
        <p class="text-sm font-semibold text-cyan-100">Sessao admin ativa</p>

        <p class="mt-1 break-words text-sm text-cyan-100/70">
          {admin.authUser.value?.name} / {admin.authUser.value?.email} / papel{" "}
          {admin.adminAccess.value.role}
        </p>
      </div>

      <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div class="mb-4 grid gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-2 md:hidden">
          {headerTabs.map((tab) => (
            <button
              key={`smart-${tab.value}`}
              type="button"
              class={[
                "flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-black transition",
                admin.ownerTab.value === tab.value
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-200 hover:bg-slate-900",
              ]}
              onClick$={() => {
                admin.ownerTab.value = tab.value;
                admin.showOwnerForm.value = false;
              }}
            >
              <span>{tab.label}</span>
              <span class="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-cyan-100">
                {getTabCount(tab.value)}
              </span>
            </button>
          ))}
        </div>

        {selectedTab && (
          <div class="relative max-w-sm">
            <button
              type="button"
              class={[
                "flex h-12 w-full items-center justify-between gap-4 rounded-xl border bg-slate-950 px-4 text-left text-sm transition",
                areaSelectOpen.value
                  ? "border-cyan-400/60"
                  : "border-slate-800 hover:border-cyan-400/40",
              ]}
              aria-haspopup="listbox"
              aria-expanded={areaSelectOpen.value}
              onClick$={() => {
                areaSelectOpen.value = !areaSelectOpen.value;
              }}
            >
              <span class="min-w-0">
                <span class="block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Area
                </span>
                <span class="block truncate font-black text-slate-100">
                  {selectedTab.label}
                </span>
              </span>

              <span class="flex shrink-0 items-center gap-3">
                <span class="rounded-full bg-cyan-300 px-2.5 py-1 text-xs font-black text-slate-950">
                  {getTabCount(selectedTab.value)}
                </span>
                <span class="text-slate-400">{areaSelectOpen.value ? "-" : "+"}</span>
              </span>
            </button>

            {areaSelectOpen.value && (
              <div
                role="listbox"
                class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-2xl shadow-slate-950/60"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    role="option"
                    aria-selected={admin.ownerTab.value === tab.value}
                    class={[
                      "flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left text-sm transition",
                      admin.ownerTab.value === tab.value
                        ? "bg-cyan-400 text-slate-950"
                        : "text-slate-200 hover:bg-slate-900",
                    ]}
                    onClick$={() => {
                      admin.ownerTab.value = tab.value;
                      admin.showOwnerForm.value = false;
                      areaSelectOpen.value = false;
                    }}
                  >
                    <span class="font-black">{tab.label}</span>
                    <span
                      class={[
                        "rounded-full px-2 py-0.5 text-xs font-black",
                        admin.ownerTab.value === tab.value
                          ? "bg-slate-950 text-cyan-200"
                          : "bg-slate-800 text-slate-300",
                      ]}
                    >
                      {getTabCount(tab.value)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div class="mt-4 flex flex-nowrap items-center gap-2">
          <input
            value={admin.ownerSearch.value}
            placeholder="Pesquisar nesta area"
            class="h-11 min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
            onInput$={(event) => {
              admin.ownerSearch.value = (
                event.target as HTMLInputElement
              ).value;
            }}
          />

          {supportsOwnerForm && (
            <button
              type="button"
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 px-0 text-sm font-bold text-slate-200 transition hover:border-cyan-400/40 sm:w-auto sm:px-4"
              aria-label={
                admin.showOwnerForm.value
                  ? "Ocultar formulario"
                  : "Mostrar formulario"
              }
              title={
                admin.showOwnerForm.value
                  ? "Ocultar formulario"
                  : "Mostrar formulario"
              }
              onClick$={() => {
                admin.showOwnerForm.value = !admin.showOwnerForm.value;
              }}
            >
              <span class="text-lg leading-none">
                {admin.showOwnerForm.value ? "x" : "+"}
              </span>
              <span class="hidden sm:inline">
                {admin.showOwnerForm.value
                  ? "Fechar formulario"
                  : "Abrir formulario"}
              </span>
            </button>
          )}

          <div class="relative w-[132px] shrink-0 sm:w-40">
            <button
              type="button"
              class={[
                "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-slate-950 px-3 text-left text-sm transition",
                viewSelectOpen.value
                  ? "border-cyan-400/60"
                  : "border-slate-800 hover:border-cyan-400/40",
              ]}
              aria-haspopup="listbox"
              aria-expanded={viewSelectOpen.value}
              onClick$={() => {
                viewSelectOpen.value = !viewSelectOpen.value;
              }}
            >
              <span class="min-w-0">
                <span class="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Exibir
                </span>
                <span class="block truncate font-black text-slate-100">
                  {selectedViewMode.label}
                </span>
              </span>

              <span class="shrink-0 text-slate-400">
                {viewSelectOpen.value ? "-" : "+"}
              </span>
            </button>

            {viewSelectOpen.value && (
              <div
                role="listbox"
                class="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-44 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-2xl shadow-slate-950/60"
              >
                {viewModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    role="option"
                    aria-selected={ownerViewMode.value === mode.value}
                    class={[
                      "flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left text-sm transition",
                      ownerViewMode.value === mode.value
                        ? "bg-cyan-400 text-slate-950"
                        : "text-slate-200 hover:bg-slate-900",
                    ]}
                    onClick$={() => {
                      ownerViewMode.value = mode.value;
                      viewSelectOpen.value = false;
                    }}
                  >
                    <span class="font-black">{mode.label}</span>
                    <span
                      class={[
                        "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em]",
                        ownerViewMode.value === mode.value
                          ? "bg-slate-950 text-cyan-200"
                          : "bg-slate-800 text-slate-300",
                      ]}
                    >
                      Vista
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {admin.ownerTab.value === "operations" && (
          <div class="mt-5">
            <OperatorQuotesPanel admin={admin} />
          </div>
        )}

        {admin.ownerTab.value === "revenues" && (
          <div class="mt-5 grid gap-5">
            <div class="grid gap-3 md:grid-cols-3">
              <div class="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-emerald-100/70">
                  Receitas confirmadas
                </p>
                <p class="mt-2 text-2xl font-black text-emerald-100">
                  {formatMoney(revenueTotal, "MZN")}
                </p>
              </div>

              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Servicos finalizados
                </p>
                <p class="mt-2 text-2xl font-black text-white">
                  {revenueQuotes.length}
                </p>
              </div>

              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Media por servico
                </p>
                <p class="mt-2 text-2xl font-black text-white">
                  {formatMoney(revenueAverage, "MZN")}
                </p>
              </div>
            </div>

            <div class="rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
              Apenas solicitacoes com estado Finalizado entram nas receitas. As
              solicitacoes em processamento, em actividade ou reclamacao ficam fora
              deste calculo.
            </div>

            {Object.keys(revenueByService).length > 0 && (
              <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(revenueByService).map(([service, revenue]) => (
                  <div
                    key={service}
                    class="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p class="text-sm font-black text-white">{service}</p>
                    <p class="mt-1 text-xs text-slate-500">
                      {revenue.count} servico{revenue.count === 1 ? "" : "s"}
                    </p>
                    <p class="mt-3 text-lg font-black text-cyan-100">
                      {formatMoney(revenue.total, "MZN")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div class="md:overflow-x-auto">
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[760px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Solicitacao</th>
                    <th class="pb-3">Cliente</th>
                    <th class="pb-3">Servico</th>
                    <th class="pb-3">Data</th>
                    <th class="pb-3 text-right">Receita</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {revenueQuotes.map((quote) => (
                    <tr key={quote.id} class={tableRowClass}>
                      <td data-label="Solicitacao" class={tableCellClass}>
                        <div class="font-semibold text-white">
                          {quote.quote_number}
                        </div>
                        <div class="mt-1 text-xs text-emerald-200">
                          Finalizado
                        </div>
                      </td>

                      <td data-label="Cliente" class={tableCellClass}>
                        <div class="font-semibold text-white">
                          {quote.profiles?.full_name ?? "Cliente"}
                        </div>
                        <div class="mt-1 text-xs text-slate-500">
                          {quote.profiles?.phone ??
                            quote.profiles?.email ??
                            "Sem contacto"}
                        </div>
                      </td>

                      <td data-label="Servico" class={tableCellClass}>
                        {quote.service_slug ?? "Servico Bitoll"}
                      </td>

                      <td data-label="Data" class={tableCellClass}>
                        {new Date(quote.created_at).toLocaleDateString("pt-MZ")}
                      </td>

                      <td
                        data-label="Receita"
                        class={[tableActionCellClass, "font-black text-emerald-100"]}
                      >
                        {formatMoney(asNumber(quote.total), quote.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {revenueQuotes.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Ainda nao ha receitas. Uma solicitacao so entra aqui depois de
                  estar finalizada.
                </div>
              )}
            </div>
          </div>
        )}

        {admin.ownerTab.value === "users" && (
          <div class="mt-5 md:overflow-x-auto">
            <table
              class={[
                tableClass,
                modeTableClass,
                widthClass("md:min-w-[760px]"),
              ]}
            >
              <thead class={tableHeadClass}>
                <tr>
                  <th class="pb-3">Usuario</th>
                  <th class="pb-3">Historico</th>
                  <th class="pb-3">Papel admin</th>
                  <th class="pb-3 text-right">Acoes</th>
                </tr>
              </thead>

              <tbody class={tableBodyClass}>
                {filteredUsers.map((user) => {
                  const adminUser = admin.ownerAdminUsers.value.find(
                    (item) => item.id === user.id,
                  );
                  const userQuotes = admin.operatorQuotes.value.filter(
                    (quote) => quote.profile_id === user.id,
                  );
                  const userCustomQuotes = admin.ownerCustomQuotes.value.filter(
                    (quote) => quote.profile_id === user.id,
                  );
                  const role = adminUser?.adminActive
                    ? adminUser.adminRole
                    : "";

                  return (
                    <tr key={user.id} class={tableRowClass}>
                      <td data-label="Usuario" class={tableCellClass}>
                        <div class="font-semibold text-white">
                          {user.full_name || "Usuario sem nome"}
                        </div>
                        <div class="mt-1 text-xs text-slate-500">
                          {user.phone || user.email || "Sem contacto"}
                        </div>
                        <div class="mt-1 text-xs text-slate-500">
                          {user.city || "Sem cidade"} / {user.status || "Conta"}
                        </div>
                      </td>

                      <td data-label="Historico" class={tableCellClass}>
                        <div class="text-slate-300">
                          {userQuotes.length} solicitacao
                          {userQuotes.length === 1 ? "" : "es"}
                        </div>
                        <div class="mt-1 text-xs text-slate-500">
                          {userCustomQuotes.length} cotacao
                          {userCustomQuotes.length === 1 ? "" : "es"} personalizada
                        </div>
                      </td>

                      <td data-label="Papel admin" class={tableCellClass}>
                        <select
                          value={role}
                          class="h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                          onChange$={(event) =>
                            admin.saveAdminUserRole$(
                              user.id,
                              (event.target as HTMLSelectElement).value as
                                | "owner"
                                | "admin"
                                | "operador"
                                | "",
                            )
                          }
                        >
                          <option value="">Usuario comum</option>
                          <option value="admin">Admin</option>
                          <option value="operador">Operador</option>
                          <option value="owner">Owner</option>
                        </select>
                      </td>

                      <td data-label="Acoes" class={tableActionCellClass}>
                        <button
                          type="button"
                          class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"
                          onClick$={() =>
                            admin.showDetails$(
                              "Historico do usuario",
                              [
                                `Nome: ${user.full_name || "Sem nome"}`,
                                `Email: ${user.email || "Sem email"}`,
                                `Contacto: ${
                                  user.phone || user.email || "Sem contacto"
                                }`,
                                `Cidade: ${user.city || "Sem cidade"}`,
                                `Papel admin: ${role || "Usuario comum"}`,
                                `Solicitacoes: ${userQuotes.length}`,
                                `Cotacoes personalizadas: ${userCustomQuotes.length}`,
                              ].join("\n"),
                            )
                          }
                        >
                          Historico
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                Nenhum usuario encontrado.
              </div>
            )}
          </div>
        )}

        {admin.ownerTab.value === "services" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
            {showInlineOwnerForm && admin.showOwnerForm.value && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <ServiceForm admin={admin} />
              </div>
            )}

            <div
              class={[
                "md:overflow-x-auto",
                !showInlineOwnerForm || !admin.showOwnerForm.value ? "lg:col-span-2" : "",
              ]}
            >
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[520px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Item</th>
                    <th class="pb-3">Resumo</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredServices.map((service) => (
                      <tr key={service.id} class={tableRowClass}>
                        <td data-label="Item" class={tableCellClass}>
                          <div class="flex items-center gap-3 text-left">
                            {service.image_url ? (
                              <img
                                src={service.image_url}
                                alt={service.title}
                                width={56}
                                height={40}
                                class="h-10 w-14 rounded-lg object-cover"
                              />
                            ) : (
                              <div class="h-10 w-14 rounded-lg border border-slate-800 bg-slate-900" />
                            )}

                            <div>
                              <div class="font-semibold text-white">
                                {service.title}
                              </div>

                              <div class="mt-1 text-xs text-slate-500">
                                {service.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                          {service.short_description || "Sem descricao curta"}
                        </td>

                        <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                          {service.active ? "Publico" : "Oculto"}
                        </td>

                        <td data-label="Acoes" class={tableActionCellClass}>
                          <div class="flex justify-end">
                            <button
                              type="button"
                              class={[
                                "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-black transition",
                                admin.openServiceActionsId.value === service.id
                                  ? "border-cyan-300 bg-cyan-300 text-slate-950"
                                  : "border-slate-700 text-slate-200 hover:border-cyan-400/50 hover:bg-slate-900",
                              ]}
                              aria-haspopup="dialog"
                              onClick$={() => {
                                admin.openServiceActionsId.value = service.id;
                                serviceAreasOpenId.value = "";
                              }}
                            >
                              <span>Acoes</span>
                              <span class="text-sm leading-none">+</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {filteredServices.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhum servico encontrado.
                </div>
              )}
            </div>
          </div>
        )}

        {selectedActionService && (
          <div
            role="dialog"
            aria-modal="true"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
          >
            <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950">
              <div class="flex items-start justify-between gap-4 border-b border-slate-800 p-4">
                <div class="flex min-w-0 items-center gap-3">
                  {selectedActionService.image_url ? (
                    <img
                      src={selectedActionService.image_url}
                      alt={selectedActionService.title}
                      width={52}
                      height={52}
                      class="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div class="h-12 w-12 rounded-full border border-slate-800 bg-slate-900" />
                  )}

                  <div class="min-w-0">
                    <p class="truncate text-base font-black text-white">
                      {selectedActionService.title}
                    </p>
                    <p class="truncate text-xs text-slate-500">
                      {selectedActionService.slug}
                    </p>
                    <p class="mt-1 text-xs font-bold text-slate-400">
                      {selectedActionService.active ? "Publico" : "Oculto"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  class="h-9 w-9 shrink-0 rounded-full border border-slate-700 text-sm font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                  aria-label="Fechar acoes"
                  onClick$={() => {
                    admin.openServiceActionsId.value = "";
                    serviceAreasOpenId.value = "";
                    serviceAreaModal.value = "";
                  }}
                >
                  x
                </button>
              </div>

              <div class="grid gap-2 p-4">
                <button
                  type="button"
                  class="flex w-full items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-3 text-left text-sm font-black text-cyan-100 transition hover:border-cyan-400/40"
                  onClick$={() => {
                    serviceAreasOpenId.value =
                      serviceAreasOpenId.value === selectedActionService.id
                        ? ""
                        : selectedActionService.id;
                  }}
                >
                  <span>Abrir areas</span>
                  <span>
                    {serviceAreasOpenId.value === selectedActionService.id
                      ? "-"
                      : "+"}
                  </span>
                </button>

                {serviceAreasOpenId.value === selectedActionService.id && (
                  <div class="grid gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-2">
                    <button
                      type="button"
                      class="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-200 hover:bg-slate-800"
                      onClick$={() => openServiceAreaModal("structures")}
                    >
                      <span>Estruturas</span>
                      <span class="text-slate-500">
                        {selectedServiceStructureCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      class="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-200 hover:bg-slate-800"
                      onClick$={() => openServiceAreaModal("products")}
                    >
                      <span>Artigos</span>
                      <span class="text-slate-500">
                        {selectedServiceProductCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      class="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-200 hover:bg-slate-800"
                      onClick$={() => openServiceAreaModal("templates")}
                    >
                      <span>Cotacoes padrao</span>
                      <span class="text-slate-500">
                        {selectedServiceTemplateCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      class="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-200 hover:bg-slate-800"
                      onClick$={() => openServiceAreaModal("customQuotes")}
                    >
                      <span>Cotacao personalizada</span>
                      <span class="text-slate-500">
                        {selectedServiceCustomQuoteCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      class="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-200 hover:bg-slate-800"
                      onClick$={() => openServiceAreaModal("promotions")}
                    >
                      <span>Promocoes</span>
                      <span class="text-slate-500">
                        {selectedServicePromotionCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      class="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-200 hover:bg-slate-800"
                      onClick$={() => openServiceAreaModal("quotes")}
                    >
                      <span>Solicitacoes</span>
                      <span class="text-slate-500">
                        {selectedServiceQuoteCount}
                      </span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.showDetails$(
                      "Detalhes do servico",
                      [
                        `Servico: ${selectedActionService.title}`,
                        `Slug: ${selectedActionService.slug}`,
                        `Estado: ${
                          selectedActionService.active ? "Publico" : "Oculto"
                        }`,
                        `Descricao: ${
                          selectedActionService.short_description ||
                          "Sem descricao"
                        }`,
                      ].join("\n"),
                      selectedActionService.image_url,
                    );
                  }}
                >
                  Detalhes
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.editService$(selectedActionService);
                    admin.openServiceActionsId.value = "";
                    serviceAreasOpenId.value = "";
                    serviceAreaModal.value = "";
                  }}
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.requestToggleContent$(
                      "services",
                      selectedActionService.id,
                      !selectedActionService.active,
                      selectedActionService.title,
                    );
                  }}
                >
                  {selectedActionService.active ? "Desativar" : "Ativar"}
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-red-200 transition hover:bg-red-400/10"
                  onClick$={() => {
                    admin.requestDeleteContent$(
                      "services",
                      selectedActionService.id,
                      selectedActionService.title,
                    );
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedActionService && serviceAreaModal.value && (
          <div
            role="dialog"
            aria-modal="true"
            class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
          >
            <div class="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-cyan-400/30 bg-slate-950 shadow-2xl shadow-slate-950">
              <div class="flex items-start justify-between gap-4 border-b border-slate-800 p-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                    {selectedActionService.title}
                  </p>
                  <h3 class="mt-1 text-lg font-black text-white">
                    {serviceAreaModalLabel}
                  </h3>
                </div>

                <button
                  type="button"
                  class="h-9 w-9 shrink-0 rounded-full border border-slate-700 text-sm font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                  aria-label="Fechar area"
                  onClick$={() => {
                    serviceAreaModal.value = "";
                  }}
                >
                  x
                </button>
              </div>

              <div class="grid gap-3 p-4">
                {serviceAreaModal.value === "structures" &&
                  selectedServiceStructures.map((option) => (
                    <article
                      key={option.id}
                      class="rounded-xl border border-slate-800 bg-slate-900/70 p-3"
                    >
                      <div class="flex gap-3">
                        {option.image_url ? (
                          <img
                            src={option.image_url}
                            alt={option.title}
                            width={72}
                            height={56}
                            class="h-14 w-18 rounded-lg object-cover"
                          />
                        ) : (
                          <div class="h-14 w-18 rounded-lg border border-slate-800 bg-slate-950" />
                        )}

                        <div class="min-w-0 flex-1">
                          <p class="font-black text-white">{option.title}</p>
                          <p class="mt-1 text-xs text-slate-400">
                            Codigo: {option.structure} / Custo:{" "}
                            {asNumber(
                              option.structure_cost_percentage,
                            ).toLocaleString("pt-MZ")}
                            % / {option.active ? "Publico" : "Oculto"}
                          </p>
                          <p class="mt-2 text-xs leading-5 text-slate-500">
                            {option.description || "Sem descricao registada."}
                          </p>
                          <p class="mt-2 text-xs font-bold text-cyan-100">
                            {option.steps.length} passo(s) de procedimento
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}

                {serviceAreaModal.value === "products" &&
                  selectedServiceProducts.map((product) => (
                    <article
                      key={product.id}
                      class="rounded-xl border border-slate-800 bg-slate-900/70 p-3"
                    >
                      <div class="flex gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            width={72}
                            height={56}
                            class="h-14 w-18 rounded-lg object-cover"
                          />
                        ) : (
                          <div class="h-14 w-18 rounded-lg border border-slate-800 bg-slate-950" />
                        )}

                        <div class="min-w-0 flex-1">
                          <p class="font-black text-white">{product.name}</p>
                          {product.short_name && (
                            <p class="mt-1 text-xs font-bold text-cyan-100">
                              WhatsApp: {product.short_name}
                            </p>
                          )}
                          <p class="mt-1 text-xs text-slate-400">
                            {product.brand || "Sem marca"} /{" "}
                            {product.category || "Produto"} /{" "}
                            {product.structure}
                          </p>
                          <p class="mt-2 text-sm font-black text-white">
                            {formatMoney(asNumber(product.unit_price))} /{" "}
                            {product.unit || "Un"}
                          </p>
                          <p class="mt-1 text-xs text-slate-500">
                            {product.active ? "Publico" : "Oculto"}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}

                {serviceAreaModal.value === "templates" &&
                  selectedServiceTemplates.map((template) => (
                    <article
                      key={template.id}
                      class="rounded-xl border border-slate-800 bg-slate-900/70 p-3"
                    >
                      <p class="font-black text-white">{template.title}</p>
                      <p class="mt-1 text-xs text-slate-400">
                        {template.structure} / {template.currency} /{" "}
                        {template.active ? "Publico" : "Oculto"}
                      </p>
                      <p class="mt-2 text-xs text-slate-500">
                        Mao de obra:{" "}
                        {formatMoney(
                          asNumber(template.labor_unit_price),
                          template.currency,
                        )}{" "}
                        / Estrutura:{" "}
                        {asNumber(
                          template.structure_cost_percentage,
                        ).toLocaleString("pt-MZ")}
                        %
                      </p>
                      <p class="mt-1 text-xs text-slate-500">
                        {template.notes || "Sem notas registadas."}
                      </p>
                    </article>
                  ))}

                {serviceAreaModal.value === "customQuotes" &&
                  selectedServiceCustomQuotes.map((quote) => (
                    <article
                      key={quote.id}
                      class="rounded-xl border border-slate-800 bg-slate-900/70 p-3"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <p class="font-black text-white">{quote.quote_number}</p>
                        <span class="shrink-0 rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300">
                          {formatProformaStatus(quote.status)}
                        </span>
                      </div>
                      <p class="mt-1 text-xs text-slate-400">
                        {quote.customer_name || "Cliente"} /{" "}
                        {quote.customer_contact || "Sem contacto"}
                      </p>
                      <p class="mt-2 text-sm font-black text-white">
                        {formatMoney(asNumber(quote.total), quote.currency)}
                      </p>
                      <p class="mt-1 text-xs text-slate-500">
                        {quote.selected_items.length} artigo(s) /{" "}
                        {quote.customer_address || "Sem morada"}
                      </p>
                    </article>
                  ))}

                {serviceAreaModal.value === "promotions" &&
                  selectedServicePromotions.map((promotion) => (
                    <article
                      key={promotion.id}
                      class="rounded-xl border border-slate-800 bg-slate-900/70 p-3"
                    >
                      <div class="flex gap-3">
                        {promotion.image ? (
                          <img
                            src={promotion.image}
                            alt={promotion.title}
                            width={72}
                            height={56}
                            class="h-14 w-18 rounded-lg object-cover"
                          />
                        ) : (
                          <div class="h-14 w-18 rounded-lg border border-slate-800 bg-slate-950" />
                        )}

                        <div class="min-w-0 flex-1">
                          <p class="font-black text-white">{promotion.title}</p>
                          <p class="mt-1 text-xs text-slate-400">
                            {promotion.discount_label || "Sem desconto"} /{" "}
                            {promotion.active ? "Publico" : "Oculto"}
                          </p>
                          <p class="mt-2 text-xs text-slate-500">
                            Slug: {promotion.slug ?? "Sem slug"} / Fim:{" "}
                            {promotion.end_date ?? "Sem data definida"}
                          </p>
                          <p class="mt-1 text-xs text-slate-500">
                            Cotacao padrao:{" "}
                            {promotion.quote_template_id ?? "Nao ligada"}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}

                {serviceAreaModal.value === "quotes" &&
                  selectedServiceQuotes.map((quote) => (
                    <article
                      key={quote.id}
                      class="rounded-xl border border-slate-800 bg-slate-900/70 p-3"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <p class="font-black text-white">{quote.quote_number}</p>
                        <span class="shrink-0 rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300">
                          {quote.status}
                        </span>
                      </div>
                      <p class="mt-1 text-xs text-slate-400">
                        {quote.profiles?.full_name ?? "Cliente"} /{" "}
                        {quote.profiles?.phone ??
                          quote.profiles?.email ??
                          "Sem contacto"}
                      </p>
                      <p class="mt-2 text-sm font-black text-white">
                        {formatMoney(asNumber(quote.total), quote.currency)}
                      </p>
                      <p class="mt-1 text-xs text-slate-500">
                        Criada em{" "}
                        {new Date(quote.created_at).toLocaleDateString("pt-MZ")}{" "}
                        / Tecnico: {quote.technician || "Ainda nao atribuido"}
                      </p>
                    </article>
                  ))}

                {((serviceAreaModal.value === "structures" &&
                  selectedServiceStructures.length === 0) ||
                  (serviceAreaModal.value === "products" &&
                    selectedServiceProducts.length === 0) ||
                  (serviceAreaModal.value === "templates" &&
                    selectedServiceTemplates.length === 0) ||
                  (serviceAreaModal.value === "customQuotes" &&
                    selectedServiceCustomQuotes.length === 0) ||
                  (serviceAreaModal.value === "promotions" &&
                    selectedServicePromotions.length === 0) ||
                  (serviceAreaModal.value === "quotes" &&
                    selectedServiceQuotes.length === 0)) && (
                  <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
                    Nenhum item encontrado nesta area para este servico.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedActionStructure && (
          <div
            role="dialog"
            aria-modal="true"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
          >
            <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950">
              <div class="flex items-start justify-between gap-4 border-b border-slate-800 p-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                    Estrutura
                  </p>
                  <h3 class="mt-1 text-lg font-black text-white">
                    {selectedActionStructure.title}
                  </h3>
                  <p class="mt-1 text-xs text-slate-500">
                    {selectedActionStructure.service_slug} /{" "}
                    {selectedActionStructure.structure}
                  </p>
                </div>

                <button
                  type="button"
                  class="h-9 w-9 shrink-0 rounded-full border border-slate-700 text-sm font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                  aria-label="Fechar acoes"
                  onClick$={() => {
                    admin.openStructureActionsId.value = "";
                  }}
                >
                  x
                </button>
              </div>

              <div class="grid gap-2 p-4">
                <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                  <p>
                    Custo da estrutura:{" "}
                    {asNumber(
                      selectedActionStructure.structure_cost_percentage,
                    ).toLocaleString("pt-MZ")}
                    %
                  </p>
                  <p class="mt-1">
                    Estado:{" "}
                    {selectedActionStructure.active ? "Publico" : "Oculto"}
                  </p>
                  <p class="mt-2 text-xs leading-5 text-slate-500">
                    {selectedActionStructure.description ||
                      "Sem descricao registada."}
                  </p>
                </div>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.showDetails$(
                      "Detalhes da estrutura",
                      [
                        `Estrutura: ${selectedActionStructure.title}`,
                        `Codigo: ${selectedActionStructure.structure}`,
                        `Servico: ${selectedActionStructure.service_slug}`,
                        `Custo da estrutura: ${asNumber(
                          selectedActionStructure.structure_cost_percentage,
                        ).toLocaleString("pt-MZ")}%`,
                        `Descricao: ${
                          selectedActionStructure.description ||
                          "Sem descricao"
                        }`,
                      ].join("\n"),
                      selectedActionStructure.image_url,
                    );
                  }}
                >
                  Detalhes
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.editStructureOption$(selectedActionStructure);
                    admin.openStructureActionsId.value = "";
                  }}
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.requestToggleContent$(
                      "service_structure_options",
                      selectedActionStructure.id,
                      !selectedActionStructure.active,
                      selectedActionStructure.title,
                    );
                  }}
                >
                  {selectedActionStructure.active ? "Desativar" : "Ativar"}
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-red-200 transition hover:bg-red-400/10"
                  onClick$={() => {
                    admin.requestDeleteContent$(
                      "service_structure_options",
                      selectedActionStructure.id,
                      selectedActionStructure.title,
                    );
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedActionProduct && (
          <div
            role="dialog"
            aria-modal="true"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
          >
            <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950">
              <div class="flex items-start justify-between gap-4 border-b border-slate-800 p-4">
                <div class="min-w-0">
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                    Artigo
                  </p>
                  <h3 class="mt-1 truncate text-lg font-black text-white">
                    {selectedActionProduct.name}
                  </h3>
                  <p class="mt-1 text-xs text-slate-500">
                    {selectedActionProduct.service_slug} /{" "}
                    {selectedActionProduct.structure}
                  </p>
                </div>

                <button
                  type="button"
                  class="h-9 w-9 shrink-0 rounded-full border border-slate-700 text-sm font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                  aria-label="Fechar acoes"
                  onClick$={() => {
                    admin.openProductActionsId.value = "";
                  }}
                >
                  x
                </button>
              </div>

              <div class="grid gap-2 p-4">
                <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                  <p>{selectedActionProduct.brand || "Sem marca"}</p>
                  {selectedActionProduct.short_name && (
                    <p class="mt-1 text-cyan-100">
                      WhatsApp: {selectedActionProduct.short_name}
                    </p>
                  )}
                  <p class="mt-1">
                    Preco:{" "}
                    {formatMoney(asNumber(selectedActionProduct.unit_price))}
                  </p>
                  <p class="mt-1">
                    Estado:{" "}
                    {selectedActionProduct.active ? "Publico" : "Oculto"}
                  </p>
                </div>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.showDetails$(
                      "Detalhes do artigo",
                      [
                        `Artigo: ${selectedActionProduct.name}`,
                        `Servico: ${selectedActionProduct.service_slug}`,
                        `Marca: ${
                          selectedActionProduct.brand || "Sem marca"
                        }`,
                        `Estrutura: ${selectedActionProduct.structure}`,
                        `Preco unitario: ${formatMoney(
                          asNumber(selectedActionProduct.unit_price),
                        )}`,
                        `Estado: ${
                          selectedActionProduct.active ? "Publico" : "Oculto"
                        }`,
                      ].join("\n"),
                      selectedActionProduct.image_url,
                    );
                  }}
                >
                  Detalhes
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.editProduct$(selectedActionProduct);
                    admin.openProductActionsId.value = "";
                  }}
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.requestToggleContent$(
                      "service_products",
                      selectedActionProduct.id,
                      !selectedActionProduct.active,
                      selectedActionProduct.name,
                    );
                  }}
                >
                  {selectedActionProduct.active ? "Desativar" : "Ativar"}
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-red-200 transition hover:bg-red-400/10"
                  onClick$={() => {
                    admin.requestDeleteContent$(
                      "service_products",
                      selectedActionProduct.id,
                      selectedActionProduct.name,
                    );
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedActionTemplate && (
          <div
            role="dialog"
            aria-modal="true"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
          >
            <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950">
              <div class="flex items-start justify-between gap-4 border-b border-slate-800 p-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                    Cotacao padrao
                  </p>
                  <h3 class="mt-1 text-lg font-black text-white">
                    {selectedActionTemplate.title}
                  </h3>
                  <p class="mt-1 text-xs text-slate-500">
                    {selectedActionTemplate.service_slug} /{" "}
                    {selectedActionTemplate.structure}
                  </p>
                </div>

                <button
                  type="button"
                  class="h-9 w-9 shrink-0 rounded-full border border-slate-700 text-sm font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                  aria-label="Fechar acoes"
                  onClick$={() => {
                    admin.openTemplateActionsId.value = "";
                  }}
                >
                  x
                </button>
              </div>

              <div class="grid gap-2 p-4">
                <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                  <p>
                    Campos: {selectedActionTemplateFields.length} / Artigos:{" "}
                    {selectedActionTemplateItems.length}
                  </p>
                  <p class="mt-1">
                    Mao de obra:{" "}
                    {formatMoney(
                      asNumber(selectedActionTemplate.labor_unit_price),
                      selectedActionTemplate.currency,
                    )}
                  </p>
                  <p class="mt-1">
                    Estado:{" "}
                    {selectedActionTemplate.active ? "Publico" : "Oculto"}
                  </p>
                </div>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.showDetails$(
                      "Detalhes da cotacao padrao",
                      [
                        `Cotacao padrao: ${selectedActionTemplate.title}`,
                        `Servico: ${selectedActionTemplate.service_slug}`,
                        `Estrutura: ${selectedActionTemplate.structure}`,
                        `Estado: ${
                          selectedActionTemplate.active
                            ? "Publico"
                            : "Oculto"
                        }`,
                        `Mao de obra: ${formatMoney(
                          asNumber(selectedActionTemplate.labor_unit_price),
                          selectedActionTemplate.currency,
                        )}`,
                        `Campos: ${selectedActionTemplateFields.length}`,
                        `Artigos: ${selectedActionTemplateItems.length}`,
                        `Notas: ${
                          selectedActionTemplate.notes || "Sem notas"
                        }`,
                      ].join("\n"),
                    );
                  }}
                >
                  Detalhes
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.editTemplate$(selectedActionTemplate);
                    admin.openTemplateActionsId.value = "";
                  }}
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.requestToggleContent$(
                      "service_quote_templates",
                      selectedActionTemplate.id,
                      !selectedActionTemplate.active,
                      selectedActionTemplate.title,
                    );
                  }}
                >
                  {selectedActionTemplate.active ? "Desativar" : "Ativar"}
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-red-200 transition hover:bg-red-400/10"
                  onClick$={() => {
                    admin.requestDeleteContent$(
                      "service_quote_templates",
                      selectedActionTemplate.id,
                      selectedActionTemplate.title,
                    );
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedActionPromotion && (
          <div
            role="dialog"
            aria-modal="true"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
          >
            <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950">
              <div class="flex items-start justify-between gap-4 border-b border-slate-800 p-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                    Promocao
                  </p>
                  <h3 class="mt-1 text-lg font-black text-white">
                    {selectedActionPromotion.title}
                  </h3>
                  <p class="mt-1 text-xs text-slate-500">
                    {selectedActionPromotion.service_slug ?? "Geral"}
                  </p>
                </div>

                <button
                  type="button"
                  class="h-9 w-9 shrink-0 rounded-full border border-slate-700 text-sm font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                  aria-label="Fechar acoes"
                  onClick$={() => {
                    admin.openPromotionActionsId.value = "";
                  }}
                >
                  x
                </button>
              </div>

              <div class="grid gap-2 p-4">
                <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                  <p>
                    {selectedActionPromotion.discount_label || "Sem desconto"}
                  </p>
                  <p class="mt-1">
                    Fim:{" "}
                    {selectedActionPromotion.end_date ?? "Sem data definida"}
                  </p>
                  <p class="mt-1">
                    Estado:{" "}
                    {selectedActionPromotion.active ? "Publico" : "Oculto"}
                  </p>
                </div>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.showDetails$(
                      "Detalhes da promocao",
                      [
                        `Promocao: ${selectedActionPromotion.title}`,
                        `Slug: ${
                          selectedActionPromotion.slug ?? "Sem slug"
                        }`,
                        `Servico: ${
                          selectedActionPromotion.service_slug ?? "Geral"
                        }`,
                        `Desconto: ${
                          selectedActionPromotion.discount_label ||
                          "Sem desconto"
                        }`,
                        `Fim: ${
                          selectedActionPromotion.end_date ??
                          "Sem data definida"
                        }`,
                        `Cotacao padrao: ${
                          selectedActionPromotion.quote_template_id ??
                          "Nao ligada"
                        }`,
                      ].join("\n"),
                      selectedActionPromotion.image,
                    );
                  }}
                >
                  Detalhes
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.editPromotion$(selectedActionPromotion);
                    admin.openPromotionActionsId.value = "";
                  }}
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.requestToggleContent$(
                      "promotions",
                      selectedActionPromotion.id,
                      !selectedActionPromotion.active,
                      selectedActionPromotion.title,
                    );
                  }}
                >
                  {selectedActionPromotion.active ? "Desativar" : "Ativar"}
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-red-200 transition hover:bg-red-400/10"
                  onClick$={() => {
                    admin.requestDeleteContent$(
                      "promotions",
                      selectedActionPromotion.id,
                      selectedActionPromotion.title,
                    );
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedActionCustomQuote && (
          <div
            role="dialog"
            aria-modal="true"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
          >
            <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950">
              <div class="flex items-start justify-between gap-4 border-b border-slate-800 p-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                    Cotacao personalizada
                  </p>
                  <h3 class="mt-1 text-lg font-black text-white">
                    {selectedActionCustomQuote.quote_number}
                  </h3>
                  <p class="mt-1 text-xs text-slate-500">
                    {selectedActionCustomQuote.customer_name || "Cliente"} /{" "}
                    {formatProformaStatus(selectedActionCustomQuote.status)}
                  </p>
                </div>

                <button
                  type="button"
                  class="h-9 w-9 shrink-0 rounded-full border border-slate-700 text-sm font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                  aria-label="Fechar acoes"
                  onClick$={() => {
                    customQuoteActionsId.value = "";
                  }}
                >
                  x
                </button>
              </div>

              <div class="grid gap-2 p-4">
                <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                  <p>
                    Contacto:{" "}
                    {selectedActionCustomQuote.customer_contact ||
                      "Sem contacto"}
                  </p>
                  <p class="mt-1">
                    Total:{" "}
                    {formatMoney(
                      asNumber(selectedActionCustomQuote.total),
                      selectedActionCustomQuote.currency,
                    )}
                  </p>
                  <p class="mt-1">
                    Artigos: {selectedActionCustomQuoteItems.length}
                  </p>
                </div>

                {![
                  "enviado",
                  "recebido",
                  "fatura_proforma_cumprida",
                ].includes(selectedActionCustomQuote.status) && (
                  <button
                    type="button"
                    class="rounded-xl px-3 py-3 text-left text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/10"
                    onClick$={() => {
                      admin.activateCustomQuoteRequest$(
                        selectedActionCustomQuote,
                      );
                    }}
                  >
                    Ativar solicitacao
                  </button>
                )}

                {selectedActionCustomQuoteWhatsAppHref && (
                  <a
                    href={selectedActionCustomQuoteWhatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="rounded-xl px-3 py-3 text-left text-sm font-bold text-emerald-100 transition hover:bg-emerald-400/10"
                  >
                    Enviar WhatsApp
                  </a>
                )}

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.editCustomQuote$(selectedActionCustomQuote);
                    customQuoteActionsId.value = "";
                  }}
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                  onClick$={() => {
                    admin.showDetails$(
                      "Detalhes da cotacao personalizada",
                      [
                        `Cotacao: ${selectedActionCustomQuote.quote_number}`,
                        `Cliente: ${
                          selectedActionCustomQuote.customer_name || "Cliente"
                        }`,
                        `Tipo: ${selectedActionCustomQuote.customer_type}`,
                        `Contacto: ${
                          selectedActionCustomQuote.customer_contact ||
                          "Sem contacto"
                        }`,
                        `Morada: ${
                          selectedActionCustomQuote.customer_address ||
                          "Sem morada"
                        }`,
                        `NUIT: ${
                          selectedActionCustomQuote.customer_nuit ||
                          "Sem NUIT"
                        }`,
                        `Servico: ${
                          selectedActionCustomQuote.service_slug ??
                          "Todos os servicos"
                        }`,
                        `Estrutura: ${
                          selectedActionCustomQuote.structure ||
                          "Sem estrutura"
                        }`,
                        `Estado: ${formatProformaStatus(selectedActionCustomQuote.status)}`,
                        `Total: ${formatMoney(
                          asNumber(selectedActionCustomQuote.total),
                          selectedActionCustomQuote.currency,
                        )}`,
                        `Artigos da cotacao:\n${selectedActionCustomQuoteItemLines}`,
                        `Termos de compromisso: ${
                          selectedActionCustomQuote.commitment_terms ||
                          "Sem termos registados"
                        }`,
                        `Notas: ${
                          selectedActionCustomQuote.notes || "Sem notas"
                        }`,
                      ].join("\n"),
                    );
                  }}
                >
                  Detalhes
                </button>
              </div>
            </div>
          </div>
        )}

        {admin.ownerTab.value === "structures" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
            {showInlineOwnerForm && admin.showOwnerForm.value && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <StructureOptionForm admin={admin} />
              </div>
            )}

            <div
              class={[
                "md:overflow-x-auto",
                !showInlineOwnerForm || !admin.showOwnerForm.value ? "lg:col-span-2" : "",
              ]}
            >
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[560px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Item</th>
                    <th class="pb-3">Resumo</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredStructures.map((option) => (
                    <tr key={option.id} class={tableRowClass}>
                      <td data-label="Item" class={tableCellClass}>
                        <div class="flex items-center gap-3 text-left">
                          {option.image_url ? (
                            <img
                              src={option.image_url}
                              alt={option.title}
                              width={56}
                              height={40}
                              class="h-10 w-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div class="h-10 w-14 rounded-lg border border-slate-800 bg-slate-900" />
                          )}

                          <div>
                            <div class="font-semibold text-white">
                              {option.title}
                            </div>

                            <div class="mt-1 text-xs text-slate-500">
                              {option.structure}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                        <span>
                          {option.service_slug} /{" "}
                          {asNumber(
                            option.structure_cost_percentage,
                          ).toLocaleString("pt-MZ")}
                          %
                        </span>
                      </td>

                      <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                        {option.active ? "Publico" : "Oculto"}
                      </td>

                      <td data-label="Acoes" class={tableActionCellClass}>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            class="inline-flex h-9 items-center gap-2 rounded-full border border-slate-700 px-3 text-xs font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                            aria-haspopup="dialog"
                            onClick$={() => {
                              admin.openStructureActionsId.value = option.id;
                            }}
                          >
                            <span>Acoes</span>
                            <span class="text-sm leading-none">+</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStructures.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhuma estrutura encontrada.
                </div>
              )}
            </div>
          </div>
        )}

        {admin.ownerTab.value === "products" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
            {showInlineOwnerForm && admin.showOwnerForm.value && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <ProductForm admin={admin} />
              </div>
            )}

            <div
              class={[
                "md:overflow-x-auto",
                !showInlineOwnerForm || !admin.showOwnerForm.value ? "lg:col-span-2" : "",
              ]}
            >
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[560px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Item</th>
                    <th class="pb-3">Resumo</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} class={tableRowClass}>
                      <td data-label="Item" class={tableCellClass}>
                        <div class="flex items-center gap-3 text-left">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              width={56}
                              height={40}
                              class="h-10 w-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div class="h-10 w-14 rounded-lg border border-slate-800 bg-slate-900" />
                          )}

                          <div>
                            <div class="font-semibold text-white">
                              {product.name}
                            </div>

                            <div class="mt-1 text-xs text-slate-500">
                              {product.brand || "Sem marca"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                        <span>
                          {product.service_slug} /{" "}
                          {formatMoney(asNumber(product.unit_price))}
                        </span>
                      </td>

                      <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                        {product.active ? "Publico" : "Oculto"}
                      </td>

                      <td data-label="Acoes" class={tableActionCellClass}>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            class="inline-flex h-9 items-center gap-2 rounded-full border border-slate-700 px-3 text-xs font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                            aria-haspopup="dialog"
                            onClick$={() => {
                              admin.openProductActionsId.value = product.id;
                            }}
                          >
                            <span>Acoes</span>
                            <span class="text-sm leading-none">+</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhum artigo encontrado.
                </div>
              )}
            </div>
          </div>
        )}

        {admin.ownerTab.value === "templates" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
            {showInlineOwnerForm && admin.showOwnerForm.value && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <TemplateForm admin={admin} />
              </div>
            )}

            <div
              class={[
                "md:overflow-x-auto",
                !showInlineOwnerForm || !admin.showOwnerForm.value ? "lg:col-span-2" : "",
              ]}
            >
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[560px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Item</th>
                    <th class="pb-3">Resumo</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredTemplates.map((template) => {
                    const fields = admin.ownerTemplateFields.value.filter(
                      (field) => field.template_id === template.id,
                    );

                    const items = admin.ownerTemplateItems.value.filter(
                      (item) => item.template_id === template.id,
                    );
                    const laborProduct = template.labor_product_id
                      ? admin.ownerProducts.value.find(
                          (product) =>
                            product.id === template.labor_product_id,
                        )
                      : null;
                    const matchingStructure =
                      admin.ownerStructureOptions.value.find(
                        (option) =>
                          option.service_slug === template.service_slug &&
                          option.structure === template.structure,
                      );
                    const structurePercentage =
                      asNumber(template.structure_cost_percentage) ||
                      asNumber(
                        matchingStructure?.structure_cost_percentage ?? 0,
                      );
                    const firstProductImage =
                      items
                        .map((item) =>
                          admin.ownerProducts.value.find(
                            (product) => product.id === item.product_id,
                          ),
                        )
                        .find((product) => product?.image_url)?.image_url ?? "";
                    const normalItems = items.filter(
                      (item) => item.product_id !== template.labor_product_id,
                    );
                    const laborItems = items.filter(
                      (item) => item.product_id === template.labor_product_id,
                    );
                    const orderedItems = [...normalItems, ...laborItems];
                    const itemsSubtotal = orderedItems.reduce(
                      (total, item) =>
                        total +
                        asNumber(item.default_quantity) *
                          asNumber(item.unit_price),
                      0,
                    );
                    const fallbackLaborTotal =
                      laborItems.length > 0
                        ? 0
                        : asNumber(template.labor_unit_price);
                    const laborTotal =
                      laborItems.reduce(
                        (total, item) =>
                          total +
                          asNumber(item.default_quantity) *
                            asNumber(item.unit_price),
                        0,
                      ) + fallbackLaborTotal;
                    const priceWithoutPercentage =
                      itemsSubtotal + fallbackLaborTotal;
                    const priceWithoutLabor = Math.max(
                      0,
                      priceWithoutPercentage - laborTotal,
                    );
                    const quotePrice =
                      priceWithoutPercentage *
                      (1 + structurePercentage / 100);
                    const itemLines =
                      orderedItems
                        .map((item, index) => {
                          const quantity = asNumber(item.default_quantity);
                          const unitPrice = asNumber(item.unit_price);
                          const total = quantity * unitPrice;
                          const isLabor =
                            item.product_id === template.labor_product_id;

                          return `${index + 1}. ${isLabor ? "Mao de obra - " : ""}${item.name} | Qtd: ${quantity.toLocaleString("pt-MZ")} ${item.unit || "un"} | Total: ${formatMoney(total, template.currency)}`;
                        })
                        .join("\n") || "Sem artigos preparados";

                    return (
                      <tr key={template.id} class={tableRowClass}>
                        <td data-label="Item" class={tableCellClass}>
                          <div class="font-semibold text-white">
                            {template.title}
                          </div>

                          <div class="mt-1 text-xs text-slate-500">
                            Campos: {fields.length} / Artigos: {items.length}
                          </div>
                        </td>

                        <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                          <span>
                            {template.service_slug} / {template.structure} /{" "}
                            {formatMoney(
                              asNumber(template.labor_unit_price),
                              template.currency,
                            )}
                          </span>
                        </td>

                        <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                          {template.active ? "Publico" : "Oculto"}
                        </td>

                        <td data-label="Acoes" class={tableActionCellClass}>
                          <div class="flex justify-end">
                            <button
                              type="button"
                              class="inline-flex h-9 items-center gap-2 rounded-full border border-slate-700 px-3 text-xs font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                              aria-haspopup="dialog"
                              onClick$={() => {
                                admin.openTemplateActionsId.value = template.id;
                              }}
                            >
                              <span>Acoes</span>
                              <span class="text-sm leading-none">+</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredTemplates.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhuma cotacao padrao encontrada.
                </div>
              )}
            </div>
          </div>
        )}

        {admin.ownerTab.value === "promotions" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
            {showInlineOwnerForm && admin.showOwnerForm.value && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <PromotionForm admin={admin} />
              </div>
            )}

            <div
              class={[
                "md:overflow-x-auto",
                !showInlineOwnerForm || !admin.showOwnerForm.value ? "lg:col-span-2" : "",
              ]}
            >
              <table
                class={[
                  tableClass,
                  modeTableClass,
                  widthClass("md:min-w-[560px]"),
                ]}
              >
                <thead class={tableHeadClass}>
                  <tr>
                    <th class="pb-3">Item</th>
                    <th class="pb-3">Resumo</th>
                    <th class="pb-3">Estado</th>
                    <th class="pb-3 text-right">Acoes</th>
                  </tr>
                </thead>

                <tbody class={tableBodyClass}>
                  {filteredPromotions.map((promotion) => (
                    <tr key={promotion.id} class={tableRowClass}>
                      <td data-label="Item" class={tableCellClass}>
                        <div class="flex items-center gap-3 text-left">
                          {promotion.image ? (
                            <img
                              src={promotion.image}
                              alt={promotion.title}
                              width={56}
                              height={40}
                              class="h-10 w-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div class="h-10 w-14 rounded-lg border border-slate-800 bg-slate-900" />
                          )}

                          <div>
                            <div class="font-semibold text-white">
                              {promotion.title}
                            </div>

                            <div class="mt-1 text-xs text-slate-500">
                              {promotion.slug ?? "Sem slug"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                        <span>
                          {promotion.discount_label || "Sem desconto"} /{" "}
                          {promotion.service_slug ?? "Geral"}
                        </span>
                      </td>

                      <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                        {promotion.active ? "Publico" : "Oculto"}
                      </td>

                      <td data-label="Acoes" class={tableActionCellClass}>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            class="inline-flex h-9 items-center gap-2 rounded-full border border-slate-700 px-3 text-xs font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                            aria-haspopup="dialog"
                            onClick$={() => {
                              admin.openPromotionActionsId.value = promotion.id;
                            }}
                          >
                            <span>Acoes</span>
                            <span class="text-sm leading-none">+</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPromotions.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhuma promocao encontrada.
                </div>
              )}
            </div>
          </div>
        )}

        {admin.ownerTab.value === "customQuotes" && (
          <div class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="text-lg font-black text-white">
                    Cotacao personalizada
                  </h2>
                  <p class="mt-1 text-sm text-slate-400">
                    Monte a cotacao com cliente e artigos ja cadastrados.
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class={[
                      "rounded-xl border px-4 py-2 text-xs font-black transition",
                      admin.customQuoteTableOpen.value
                        ? "border-cyan-400/40 bg-cyan-400 text-slate-950"
                        : "border-slate-700 text-slate-200 hover:border-cyan-400/50",
                    ]}
                    onClick$={() => {
                      admin.customQuoteTableOpen.value =
                        !admin.customQuoteTableOpen.value;
                    }}
                  >
                    {admin.customQuoteTableOpen.value
                      ? "Ocultar tabela"
                      : "Ver tabela"}
                  </button>

                  <button
                    type="button"
                    class={[
                      "rounded-xl border px-4 py-2 text-xs font-black transition",
                      admin.customQuoteFormOpen.value
                        ? "border-slate-700 text-slate-200 hover:border-cyan-400/50"
                        : "border-cyan-400/40 bg-cyan-400 text-slate-950",
                    ]}
                    onClick$={() => {
                      if (admin.customQuoteFormOpen.value) {
                        admin.customQuoteFormOpen.value = false;
                        return;
                      }

                      admin.resetCustomQuoteDraft$();
                      admin.customQuoteFormOpen.value = true;
                    }}
                  >
                    {admin.customQuoteFormOpen.value
                      ? "Ocultar formulario"
                      : "Nova cotacao"}
                  </button>

                  {showInlineCustomQuoteForm && admin.customQuoteFormOpen.value && (
                  <div class="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
                    {(["registered", "temporary"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      class={[
                        "rounded-lg px-3 py-2 text-xs font-black transition",
                        admin.customQuoteDraft.customerMode === mode
                          ? "bg-cyan-400 text-slate-950"
                          : "text-slate-300 hover:bg-slate-800",
                      ]}
                      onClick$={() => {
                        admin.customQuoteDraft.customerMode = mode;
                        admin.customQuoteDraft.profileId = "";
                        if (mode === "temporary") {
                          admin.customQuoteDraft.customerName = "";
                          admin.customQuoteDraft.contacto = "";
                          admin.customQuoteDraft.morada = "";
                        }
                      }}
                    >
                      {mode === "registered" ? "Cadastrado" : "Temporario"}
                    </button>
                    ))}
                  </div>
                  )}
                </div>
              </div>

              {showInlineCustomQuoteForm && admin.customQuoteFormOpen.value && (
                <>
              <div class="mt-5 grid gap-4 md:grid-cols-2">
                {admin.customQuoteDraft.customerMode === "registered" && (
                  <label class="md:col-span-2">
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Cliente cadastrado
                    </span>
                    <select
                      value={admin.customQuoteDraft.profileId}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onChange$={(event) =>
                        admin.selectCustomQuoteCustomer$(
                          (event.target as HTMLSelectElement).value,
                        )
                      }
                    >
                      <option value="">Selecionar cliente</option>
                      {admin.ownerCustomers.value.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.full_name ||
                            customer.email ||
                            customer.phone ||
                            "Cliente sem nome"}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Nome do cliente
                  </span>
                  <input
                    value={admin.customQuoteDraft.customerName}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.customerName = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                </label>

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Contacto
                  </span>
                  <input
                    value={admin.customQuoteDraft.contacto}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.contacto = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                </label>

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Morada
                  </span>
                  <input
                    value={admin.customQuoteDraft.morada}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.morada = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                </label>

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    NUIT
                  </span>
                  <input
                    value={admin.customQuoteDraft.nuit}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.nuit = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                </label>

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Servico
                  </span>
                  <select
                    value={admin.customQuoteDraft.serviceSlug}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onChange$={(event) => {
                      admin.customQuoteDraft.serviceSlug = (
                        event.target as HTMLSelectElement
                      ).value;
                      admin.customQuoteDraft.sourceTemplateId = "";
                    }}
                  >
                    <option value="">Todos os servicos</option>
                    {admin.ownerServices.value.map((service) => (
                      <option key={service.id} value={service.slug}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Cotacao base
                  </span>
                  <select
                    value={admin.customQuoteDraft.sourceTemplateId}
                    class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onChange$={(event) =>
                      admin.applyCustomQuoteTemplate$(
                        (event.target as HTMLSelectElement).value,
                      )
                    }
                  >
                    <option value="">Criar sem base</option>
                    {customQuoteBaseTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label class="md:col-span-2">
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Notas
                  </span>
                  <textarea
                    value={admin.customQuoteDraft.notes}
                    rows={3}
                    class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.notes = (
                        event.target as HTMLTextAreaElement
                      ).value;
                    }}
                  />
                </label>

                <label class="md:col-span-2">
                  <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Termos de compromisso
                  </span>
                  <textarea
                    value={admin.customQuoteDraft.commitmentTerms}
                    rows={5}
                    placeholder="Ex: prazo de validade, forma de pagamento, responsabilidades do cliente e da Bitoll"
                    class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    onInput$={(event) => {
                      admin.customQuoteDraft.commitmentTerms = (
                        event.target as HTMLTextAreaElement
                      ).value;
                    }}
                  />
                </label>
              </div>
                </>
              )}
            </div>

            {showInlineCustomQuoteForm && admin.customQuoteFormOpen.value && (
            <aside class="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                Resumo
              </p>
              <div class="mt-4 space-y-3 text-sm">
                <div class="flex items-center justify-between gap-3 text-slate-300">
                  <span>Artigos</span>
                  <strong class="text-white">
                    {admin.customQuoteDraft.items.length}
                  </strong>
                </div>
                <div class="flex items-center justify-between gap-3 text-slate-300">
                  <span>Subtotal</span>
                  <strong class="text-white">
                    {formatMoney(customQuoteSubtotal)}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                class="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-cyan-400 px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                onClick$={() => {
                  admin.customQuoteProductPickerOpen.value = true;
                }}
              >
                Selecionar artigos
              </button>

              <button
                type="button"
                class="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-700 px-4 text-sm font-bold text-slate-200 transition hover:border-cyan-400/50"
                onClick$={() => admin.saveCustomQuote$()}
              >
                {admin.editingCustomQuoteId.value
                  ? "Atualizar cotacao"
                  : "Guardar cotacao"}
              </button>

              {admin.editingCustomQuoteId.value && (
                <button
                  type="button"
                  class="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-700 px-4 text-sm font-bold text-slate-200 transition hover:border-cyan-400/50"
                  onClick$={() => admin.resetCustomQuoteDraft$()}
                >
                  Cancelar edicao
                </button>
              )}
            </aside>
            )}

            {showInlineCustomQuoteForm && admin.customQuoteFormOpen.value && (
            <div class="lg:col-span-2">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 class="text-sm font-black uppercase tracking-[0.12em] text-slate-300">
                  Artigos da cotacao
                </h3>
                <button
                  type="button"
                  class="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-400/50"
                  onClick$={() => {
                    admin.customQuoteProductPickerOpen.value = true;
                  }}
                >
                  Adicionar
                </button>
              </div>

              <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {admin.customQuoteDraft.items.map((item) => (
                  <article
                    key={item.id}
                    class="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        width={360}
                        height={190}
                        class="h-36 w-full object-cover"
                      />
                    ) : (
                      <div class="h-36 w-full bg-slate-900" />
                    )}

                    <div class="p-4">
                      <h4 class="font-black text-white">{item.name}</h4>
                      <p class="mt-1 text-xs text-slate-500">
                        {item.category || "Produto"} / {item.structure}
                      </p>

                      <div class="mt-4 grid grid-cols-[1fr_auto] items-end gap-3">
                        <label>
                          <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            Quantidade
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            class="mt-2 h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                            onInput$={(event) =>
                              admin.updateCustomQuoteItemQuantity$(
                                item.id,
                                Number((event.target as HTMLInputElement).value),
                              )
                            }
                          />
                        </label>

                        <button
                          type="button"
                          class="h-10 rounded-xl border border-red-400/30 px-3 text-xs font-bold text-red-200 transition hover:bg-red-400/10"
                          onClick$={() =>
                            admin.removeCustomQuoteItem$(item.id)
                          }
                        >
                          Remover
                        </button>
                      </div>

                      <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-sm">
                        <span class="text-slate-400">
                          {formatMoney(asNumber(item.unitPrice))} /{" "}
                          {item.unit}
                        </span>
                        <strong class="text-white">
                          {formatMoney(
                            asNumber(item.unitPrice) * asNumber(item.quantity),
                          )}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {admin.customQuoteDraft.items.length === 0 && (
                <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Nenhum artigo selecionado para esta cotacao.
                </div>
              )}
            </div>
            )}

            {admin.customQuoteTableOpen.value && (
              <div class="lg:col-span-2">
                <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3 class="text-sm font-black uppercase tracking-[0.12em] text-slate-300">
                    Tabela de cotacoes personalizadas
                  </h3>
                  <span class="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-black text-slate-300">
                    {filteredCustomQuotes.length} registo(s)
                  </span>
                </div>

                {admin.customQuoteLastCreatedId.value && (
                  <div class="mb-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100">
                    {lastCreatedCustomQuote
                      ? `${lastCreatedCustomQuote.quote_number} de ${lastCreatedCustomQuote.customer_name} foi inserida na tabela e destacada abaixo.`
                      : "Cotacao inserida na tabela e destacada abaixo."}
                  </div>
                )}

                <div class="md:overflow-x-auto">
                  <table
                    class={[
                      tableClass,
                      modeTableClass,
                      widthClass("md:min-w-[680px]"),
                    ]}
                  >
                    <thead class={tableHeadClass}>
                      <tr>
                        <th class="pb-3">Item</th>
                        <th class="pb-3">Cliente</th>
                        <th class="pb-3">Resumo</th>
                        <th class="pb-3">Estado</th>
                        <th class="pb-3 text-right">Acoes</th>
                      </tr>
                    </thead>

                    <tbody class={tableBodyClass}>
                      {filteredCustomQuotes.map((quote) => {
                        const items = Array.isArray(quote.selected_items)
                          ? quote.selected_items
                          : [];

                        return (
                          <tr
                            key={quote.id}
                            class={[
                              tableRowClass,
                              quote.id === admin.customQuoteLastCreatedId.value
                                ? "bg-emerald-400/10 ring-1 ring-emerald-300/40"
                                : "",
                            ]}
                          >
                            <td data-label="Item" class={tableCellClass}>
                              <div class="font-semibold text-white">
                                {quote.quote_number}
                              </div>
                              <div class="mt-1 text-xs text-slate-500">
                                {new Date(quote.created_at).toLocaleDateString(
                                  "pt-MZ",
                                )}
                              </div>
                            </td>

                            <td data-label="Cliente" class={tableCellClass}>
                              <div class="font-semibold text-white">
                                {quote.customer_name || "Cliente"}
                              </div>
                              <div class="mt-1 text-xs text-slate-500">
                                {quote.customer_contact || "Sem contacto"}
                              </div>
                            </td>

                            <td data-label="Resumo" class={[tableCellClass, "text-slate-300"]}>
                              {quote.service_slug ?? "Todos os servicos"} /{" "}
                              {formatMoney(asNumber(quote.total), quote.currency)} /{" "}
                              {items.length} artigo(s)
                            </td>

                            <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                              {formatProformaStatus(quote.status)}
                            </td>

                            <td data-label="Acoes" class={tableActionCellClass}>
                              <div class="flex justify-end">
                                <button
                                  type="button"
                                  class="inline-flex h-9 items-center gap-2 rounded-full border border-slate-700 px-3 text-xs font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                                  aria-haspopup="dialog"
                                  onClick$={() => {
                                    customQuoteActionsId.value = quote.id;
                                  }}
                                >
                                  <span>Acoes</span>
                                  <span class="text-sm leading-none">+</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredCustomQuotes.length === 0 && (
                  <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                    Nenhuma cotacao personalizada guardada.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {admin.showOwnerForm.value && supportsOwnerForm && (
          <div class="fixed inset-0 z-[9996] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <section class="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
                    Formulario administrativo
                  </p>
                  <h3 class="mt-1 text-lg font-black text-white">
                    {admin.ownerTab.value === "services" &&
                      (admin.editingServiceId.value
                        ? "Editar servico"
                        : "Novo servico")}
                    {admin.ownerTab.value === "structures" &&
                      (admin.editingStructureOptionId.value
                        ? "Editar estrutura"
                        : "Nova estrutura")}
                    {admin.ownerTab.value === "products" &&
                      (admin.editingProductId.value
                        ? "Editar artigo"
                        : "Novo artigo")}
                    {admin.ownerTab.value === "templates" &&
                      (admin.editingTemplateId.value
                        ? "Editar cotacao padrao"
                        : "Nova cotacao padrao")}
                    {admin.ownerTab.value === "promotions" &&
                      (admin.editingPromotionId.value
                        ? "Editar promocao"
                        : "Nova promocao")}
                  </h3>
                </div>

                <button
                  type="button"
                  aria-label="Fechar formulario"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-200 transition hover:border-cyan-400/50"
                  onClick$={() => {
                    admin.showOwnerForm.value = false;
                  }}
                >
                  x
                </button>
              </div>

              <div class="max-h-[calc(92vh-84px)] overflow-y-auto p-5">
                {admin.ownerTab.value === "services" && (
                  <ServiceForm admin={admin} />
                )}
                {admin.ownerTab.value === "structures" && (
                  <StructureOptionForm admin={admin} />
                )}
                {admin.ownerTab.value === "products" && (
                  <ProductForm admin={admin} />
                )}
                {admin.ownerTab.value === "templates" && (
                  <TemplateForm admin={admin} />
                )}
                {admin.ownerTab.value === "promotions" && (
                  <PromotionForm admin={admin} />
                )}
              </div>
            </section>
          </div>
        )}

        {admin.customQuoteFormOpen.value && (
          <div class="fixed inset-0 z-[9997] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <section class="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
                    {admin.editingCustomQuoteId.value
                      ? "Editar cotacao personalizada"
                      : "Nova cotacao personalizada"}
                  </p>
                  <h3 class="mt-1 text-lg font-black text-white">
                    Cliente, artigos e servicos
                  </h3>
                </div>

                <button
                  type="button"
                  aria-label="Fechar"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-200 transition hover:border-cyan-400/50"
                  onClick$={() => {
                    admin.customQuoteFormOpen.value = false;
                  }}
                >
                  x
                </button>
              </div>

              <div class="max-h-[calc(92vh-84px)] overflow-y-auto p-5">
                <div class="mb-5 flex w-fit rounded-xl border border-slate-800 bg-slate-900 p-1">
                  {(["registered", "temporary"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      class={[
                        "rounded-lg px-3 py-2 text-xs font-black transition",
                        admin.customQuoteDraft.customerMode === mode
                          ? "bg-cyan-400 text-slate-950"
                          : "text-slate-300 hover:bg-slate-800",
                      ]}
                      onClick$={() => {
                        admin.customQuoteDraft.customerMode = mode;
                        admin.customQuoteDraft.profileId = "";
                        if (mode === "temporary") {
                          admin.customQuoteDraft.customerName = "";
                          admin.customQuoteDraft.contacto = "";
                          admin.customQuoteDraft.morada = "";
                        }
                      }}
                    >
                      {mode === "registered" ? "Cadastrado" : "Temporario"}
                    </button>
                  ))}
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  {admin.customQuoteDraft.customerMode === "registered" && (
                    <label class="md:col-span-2">
                      <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        Cliente cadastrado
                      </span>
                      <select
                        value={admin.customQuoteDraft.profileId}
                        class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                        onChange$={(event) =>
                          admin.selectCustomQuoteCustomer$(
                            (event.target as HTMLSelectElement).value,
                          )
                        }
                      >
                        <option value="">Selecionar cliente</option>
                        {admin.ownerCustomers.value.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.full_name ||
                              customer.email ||
                              customer.phone ||
                              "Cliente sem nome"}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label>
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Nome do cliente
                    </span>
                    <input
                      value={admin.customQuoteDraft.customerName}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onInput$={(event) => {
                        admin.customQuoteDraft.customerName = (
                          event.target as HTMLInputElement
                        ).value;
                      }}
                    />
                  </label>

                  <label>
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Contacto
                    </span>
                    <input
                      value={admin.customQuoteDraft.contacto}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onInput$={(event) => {
                        admin.customQuoteDraft.contacto = (
                          event.target as HTMLInputElement
                        ).value;
                      }}
                    />
                    {admin.customQuoteDraft.contacto && (
                      <span
                        class={[
                          "mt-2 block text-xs font-bold",
                          customQuoteContactLooksLikeWhatsApp
                            ? "text-emerald-300"
                            : "text-amber-300",
                        ]}
                      >
                        {customQuoteContactLooksLikeWhatsApp
                          ? `Numero pronto para WhatsApp: +${customQuoteContactPhone}.`
                          : "Este contacto nao parece um telefone valido para WhatsApp."}
                      </span>
                    )}
                  </label>

                  <label>
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Morada
                    </span>
                    <input
                      value={admin.customQuoteDraft.morada}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onInput$={(event) => {
                        admin.customQuoteDraft.morada = (
                          event.target as HTMLInputElement
                        ).value;
                      }}
                    />
                  </label>

                  <label>
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      NUIT
                    </span>
                    <input
                      value={admin.customQuoteDraft.nuit}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onInput$={(event) => {
                        admin.customQuoteDraft.nuit = (
                          event.target as HTMLInputElement
                        ).value;
                      }}
                    />
                  </label>

                  <label>
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Servico
                    </span>
                    <select
                      value={admin.customQuoteDraft.serviceSlug}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onChange$={(event) => {
                        admin.customQuoteDraft.serviceSlug = (
                          event.target as HTMLSelectElement
                        ).value;
                        admin.customQuoteDraft.sourceTemplateId = "";
                        admin.customQuoteDraft.structure = "";
                      }}
                    >
                      <option value="">Todos os servicos</option>
                      {admin.ownerServices.value.map((service) => (
                        <option key={service.id} value={service.slug}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Estrutura
                    </span>
                    <select
                      value={admin.customQuoteDraft.structure}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onChange$={(event) => {
                        admin.customQuoteDraft.structure = (
                          event.target as HTMLSelectElement
                        ).value;
                        admin.customQuoteDraft.sourceTemplateId = "";
                      }}
                    >
                      <option value="">Sem estrutura definida</option>
                      {customQuoteStructureOptions.map((option) => (
                        <option key={option.id} value={option.structure}>
                          {option.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Cotacao base
                    </span>
                    <select
                      value={admin.customQuoteDraft.sourceTemplateId}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onChange$={(event) =>
                        admin.applyCustomQuoteTemplate$(
                          (event.target as HTMLSelectElement).value,
                        )
                      }
                    >
                      <option value="">Criar sem base</option>
                      {customQuoteBaseTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div class="mt-6">
                  <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h4 class="text-sm font-black uppercase tracking-[0.12em] text-slate-300">
                      Artigos da cotacao
                    </h4>
                    <button
                      type="button"
                      class="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-400/50"
                      onClick$={() => {
                        admin.customQuoteProductPickerOpen.value = true;
                      }}
                    >
                      Adicionar artigos
                    </button>
                  </div>

                  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {admin.customQuoteDraft.items.map((item) => (
                      <article
                        key={item.id}
                        class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70"
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            width={360}
                            height={150}
                            class="h-28 w-full object-cover"
                          />
                        ) : (
                          <div class="h-28 w-full bg-slate-800" />
                        )}

                        <div class="p-4">
                          <h5 class="font-black text-white">{item.name}</h5>
                          <p class="mt-1 text-xs text-slate-500">
                            {item.category || "Produto"} / {item.structure}
                          </p>

                          <div class="mt-4 grid grid-cols-[1fr_auto] items-end gap-3">
                            <label>
                              <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                Quantidade
                              </span>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                class="mt-2 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                                onInput$={(event) =>
                                  admin.updateCustomQuoteItemQuantity$(
                                    item.id,
                                    Number(
                                      (event.target as HTMLInputElement).value,
                                    ),
                                  )
                                }
                              />
                            </label>

                            <button
                              type="button"
                              class="h-10 rounded-xl border border-red-400/30 px-3 text-xs font-bold text-red-200 transition hover:bg-red-400/10"
                              onClick$={() =>
                                admin.removeCustomQuoteItem$(item.id)
                              }
                            >
                              Remover
                            </button>
                          </div>

                          <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-sm">
                            <span class="text-slate-400">
                              {formatMoney(asNumber(item.unitPrice))} /{" "}
                              {item.unit}
                            </span>
                            <strong class="text-white">
                              {formatMoney(
                                asNumber(item.unitPrice) *
                                  asNumber(item.quantity),
                              )}
                            </strong>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {admin.customQuoteDraft.items.length === 0 && (
                    <div class="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
                      Nenhum artigo selecionado para esta cotacao.
                    </div>
                  )}
                </div>

                {admin.customQuoteDraft.items.length > 0 && (
                  <div class="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                    <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                      Instalacao, configuracao e testes
                    </p>

                    <div class="mt-4 grid gap-4 md:grid-cols-3">
                      <label>
                        <span class="text-xs font-bold uppercase tracking-[0.12em] text-cyan-100/70">
                          Base de calculo
                        </span>
                        <select
                          value={admin.customQuoteDraft.executionBaseItemId}
                          class="mt-2 h-11 w-full rounded-xl border border-cyan-400/20 bg-slate-950 px-3 text-sm text-white outline-none"
                          onChange$={(event) => {
                            admin.customQuoteDraft.executionBaseItemId = (
                              event.target as HTMLSelectElement
                            ).value;
                          }}
                        >
                          <option value="">Nao incluir</option>
                          {admin.customQuoteDraft.items.map((item) => (
                            <option key={item.id} value={item.id}>
                              {`${item.name} / qtd ${String(item.quantity)}`}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span class="text-xs font-bold uppercase tracking-[0.12em] text-cyan-100/70">
                          Preco por unidade
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={String(admin.customQuoteDraft.executionUnitPrice)}
                          class="mt-2 h-11 w-full rounded-xl border border-cyan-400/20 bg-slate-950 px-3 text-sm text-white outline-none"
                          onInput$={(event) => {
                            admin.customQuoteDraft.executionUnitPrice = Math.max(
                              0,
                              Number(
                                (event.target as HTMLInputElement).value || 0,
                              ),
                            );
                          }}
                        />
                      </label>

                      <div class="rounded-xl border border-cyan-400/20 bg-slate-950 px-4 py-3">
                        <span class="text-xs font-bold uppercase tracking-[0.12em] text-cyan-100/70">
                          Total
                        </span>
                        <strong class="mt-2 block text-lg text-white">
                          {formatMoney(customQuoteExecutionTotal)}
                        </strong>
                        <span class="mt-1 block text-xs text-slate-500">
                          {customQuoteExecutionQuantity} unidade(s)
                        </span>
                      </div>
                    </div>

                    <label class="mt-4 block">
                      <span class="text-xs font-bold uppercase tracking-[0.12em] text-cyan-100/70">
                        Descricao
                      </span>
                      <input
                        value={admin.customQuoteDraft.executionDescription}
                        class="mt-2 h-11 w-full rounded-xl border border-cyan-400/20 bg-slate-950 px-3 text-sm text-white outline-none"
                        onInput$={(event) => {
                          admin.customQuoteDraft.executionDescription = (
                            event.target as HTMLInputElement
                          ).value;
                        }}
                      />
                    </label>
                  </div>
                )}

                <div class="mt-6 grid gap-4 md:grid-cols-2">
                  <label>
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Notas
                    </span>
                    <textarea
                      value={admin.customQuoteDraft.notes}
                      rows={4}
                      class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onInput$={(event) => {
                        admin.customQuoteDraft.notes = (
                          event.target as HTMLTextAreaElement
                        ).value;
                      }}
                    />
                  </label>

                  <label>
                    <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Termos de compromisso
                    </span>
                    <textarea
                      value={admin.customQuoteDraft.commitmentTerms}
                      rows={4}
                      placeholder="Ex: prazo de validade, forma de pagamento, responsabilidades do cliente e da Bitoll"
                      class="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      onInput$={(event) => {
                        admin.customQuoteDraft.commitmentTerms = (
                          event.target as HTMLTextAreaElement
                        ).value;
                      }}
                    />
                  </label>
                </div>

                <div class="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                  <div class="text-sm text-slate-300">
                    <span class="font-bold text-white">
                      {admin.customQuoteDraft.items.length}
                    </span>{" "}
                    artigo(s) / subtotal{" "}
                    <span class="font-bold text-white">
                      {formatMoney(customQuoteSubtotal)}
                    </span>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    {admin.editingCustomQuoteId.value && (
                      <button
                        type="button"
                        class="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-400/50"
                        onClick$={() => admin.resetCustomQuoteDraft$()}
                      >
                        Cancelar edicao
                      </button>
                    )}

                    <button
                      type="button"
                      class="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                      onClick$={() => admin.saveCustomQuote$()}
                    >
                      {admin.editingCustomQuoteId.value
                        ? "Atualizar cotacao"
                        : "Guardar cotacao"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {admin.customQuoteProductPickerOpen.value && (
          <div class="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <div class="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
                <div>
                  <h3 class="text-lg font-black text-white">
                    Selecionar artigos
                  </h3>
                  <p class="mt-1 text-sm text-slate-400">
                    Escolha artigos cadastrados e ajuste a quantidade.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Fechar"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-200 transition hover:border-cyan-400/50"
                  onClick$={() => {
                    admin.customQuoteProductPickerOpen.value = false;
                  }}
                >
                  x
                </button>
              </div>

              <div class="border-b border-slate-800 p-5">
                <input
                  value={admin.customQuoteProductSearch.value}
                  placeholder="Pesquisar artigo"
                  class="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                  onInput$={(event) => {
                    admin.customQuoteProductSearch.value = (
                      event.target as HTMLInputElement
                    ).value;
                  }}
                />
              </div>

              <div class="max-h-[58vh] overflow-y-auto p-5">
                <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {customQuoteProducts.map((product) => {
                    const selectedItem = admin.customQuoteDraft.items.find(
                      (item) => item.id === product.id,
                    );

                    return (
                      <article
                        key={product.id}
                        class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70"
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            width={360}
                            height={170}
                            class="h-32 w-full object-cover"
                          />
                        ) : (
                          <div class="h-32 w-full bg-slate-800" />
                        )}

                        <div class="p-4">
                          <h4 class="font-black text-white">{product.name}</h4>
                          <p class="mt-1 text-xs text-slate-500">
                            {product.category || "Produto"} /{" "}
                            {product.service_slug}
                          </p>

                          <div class="mt-3 flex items-center justify-between gap-3 text-sm">
                            <span class="text-slate-400">
                              {formatMoney(asNumber(product.unit_price))} /{" "}
                              {product.unit || "Un"}
                            </span>
                            {!selectedItem && (
                              <button
                                type="button"
                                class="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-300"
                                onClick$={() =>
                                  admin.addCustomQuoteProduct$(product.id)
                                }
                              >
                                Adicionar
                              </button>
                            )}
                          </div>

                          {selectedItem && (
                            <div class="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
                              <label>
                                <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                  Qtd
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  value={selectedItem.quantity}
                                  class="mt-2 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
                                  onInput$={(event) =>
                                    admin.updateCustomQuoteItemQuantity$(
                                      product.id,
                                      Number(
                                        (event.target as HTMLInputElement).value,
                                      ),
                                    )
                                  }
                                />
                              </label>

                              <button
                                type="button"
                                class="h-10 rounded-xl border border-red-400/30 px-3 text-xs font-bold text-red-200 transition hover:bg-red-400/10"
                                onClick$={() =>
                                  admin.removeCustomQuoteItem$(product.id)
                                }
                              >
                                Tirar
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {customQuoteProducts.length === 0 && (
                  <div class="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
                    Nenhum artigo cadastrado encontrado para este filtro.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {admin.ownerTab.value === "quotes" && (
          <div class="mt-5 md:overflow-x-auto">
            <table
              class={[
                tableClass,
                modeTableClass,
                widthClass("md:min-w-[560px]"),
              ]}
            >
              <thead class={tableHeadClass}>
                <tr>
                  <th class="pb-3">Item</th>
                  <th class="pb-3">Resumo</th>
                  <th class="pb-3">Estado</th>
                  <th class="pb-3 text-right">Acoes</th>
                </tr>
              </thead>

              <tbody class={tableBodyClass}>
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} class={tableRowClass}>
                    <td data-label="Item" class={tableCellClass}>
                      <div class="font-semibold text-white">
                        {quote.quote_number}
                      </div>

                      <div class="mt-1 text-xs text-slate-500">
                        {new Date(quote.created_at).toLocaleDateString("pt-MZ")}
                      </div>
                      {quote.request_payload?.source === "custom_quote" && (
                        <div class="mt-1 text-xs font-bold text-cyan-200">
                          Cotacao personalizada
                        </div>
                      )}
                    </td>

                    <td data-label="Resumo" class={tableCellClass}>
                      <div class="font-semibold text-white">
                        {quote.profiles?.full_name ?? "Cliente"}
                      </div>

                      <div class="mt-1 text-xs text-slate-500">
                        {quote.profiles?.phone ??
                          quote.profiles?.email ??
                          "Sem contacto"}
                      </div>
                      <div class="mt-1 text-xs text-slate-500">
                        {quote.profiles?.city ?? "Sem morada"}
                      </div>
                      <div class="mt-1 text-xs text-slate-500">
                        {quote.service_slug ?? "Nao definido"} /{" "}
                        {formatMoney(asNumber(quote.total), quote.currency)}
                      </div>
                    </td>

                    <td data-label="Estado" class={[tableCellClass, "text-slate-300"]}>
                      {quote.status === "em_atividade" ||
                      quote.status === "aprovado"
                        ? "Em actividade"
                        : admin.drafts[quote.id]?.status ?? quote.status}
                    </td>

                    <td data-label="Acoes" class={tableActionCellClass}>
                      <div class="flex justify-end">
                        <button
                          type="button"
                          class="inline-flex h-9 items-center gap-2 rounded-full border border-slate-700 px-3 text-xs font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                          aria-haspopup="dialog"
                          onClick$={() => {
                            quoteActionsId.value = quote.id;
                          }}
                        >
                          <span>Acoes</span>
                          <span class="text-sm leading-none">+</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredQuotes.length === 0 && (
              <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                Nenhuma solicitacao encontrada.
              </div>
            )}
          </div>
        )}
      </section>

      {selectedActionQuote && (
        <div
          role="dialog"
          aria-modal="true"
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
        >
          <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950">
            <div class="flex items-start justify-between gap-4 border-b border-slate-800 p-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                  Solicitacao
                </p>
                <h3 class="mt-1 text-lg font-black text-white">
                  {selectedActionQuote.quote_number}
                </h3>
                <p class="mt-1 text-xs text-slate-500">
                  {selectedActionQuote.profiles?.full_name ?? "Cliente"} /{" "}
                  {selectedActionQuote.status}
                </p>
              </div>

              <button
                type="button"
                class="h-9 w-9 shrink-0 rounded-full border border-slate-700 text-sm font-black text-slate-200 transition hover:border-cyan-400/50 hover:bg-slate-900"
                aria-label="Fechar acoes"
                onClick$={() => {
                  quoteActionsId.value = "";
                }}
              >
                x
              </button>
            </div>

            <div class="grid gap-2 p-4">
              <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                <p>
                  Contacto:{" "}
                  {selectedActionQuote.profiles?.phone ??
                    selectedActionQuote.profiles?.email ??
                    "Sem contacto"}
                </p>
                <p class="mt-1">
                  Total:{" "}
                  {formatMoney(
                    asNumber(selectedActionQuote.total),
                    selectedActionQuote.currency,
                  )}
                </p>
                <p class="mt-1">
                  Tecnico:{" "}
                  {selectedActionQuote.technician || "Ainda nao atribuido"}
                </p>
              </div>

              {selectedActionQuoteIsUnprocessed && (
                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/10"
                  onClick$={() => {
                    admin.openQuoteProcedure$(selectedActionQuote.id);
                    quoteActionsId.value = "";
                  }}
                >
                  Proceder solicitacao
                </button>
              )}

              {selectedActionQuoteIsUnprocessed && (
                <button
                  type="button"
                  class="rounded-xl px-3 py-3 text-left text-sm font-bold text-amber-100 transition hover:bg-amber-400/10"
                  onClick$={() => {
                    admin.rollbackQuoteRequest$(selectedActionQuote.id);
                  }}
                >
                  Recuar
                </button>
              )}

              <button
                type="button"
                class="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-slate-900"
                onClick$={() => {
                  admin.showDetails$(
                    "Detalhes da solicitacao",
                    [
                      `Cotacao: ${selectedActionQuote.quote_number}`,
                      `Cliente: ${
                        selectedActionQuote.profiles?.full_name ?? "Cliente"
                      }`,
                      `Email: ${
                        selectedActionQuote.profiles?.email ?? "Sem email"
                      }`,
                      `Contacto: ${
                        selectedActionQuote.profiles?.phone ??
                        selectedActionQuote.profiles?.email ??
                        "Sem contacto"
                      }`,
                      `Morada: ${
                        selectedActionQuote.profiles?.city ?? "Sem morada"
                      }`,
                      `NUIT: ${
                        typeof selectedActionQuote.request_payload
                          ?.customerNuit === "string"
                          ? selectedActionQuote.request_payload.customerNuit ||
                            "Sem NUIT"
                          : "Sem NUIT"
                      }`,
                      `Origem: ${
                        selectedActionQuote.request_payload?.source ===
                        "custom_quote"
                          ? "Cotacao personalizada"
                          : "Solicitacao do cliente"
                      }`,
                      `Servico: ${
                        selectedActionQuote.service_slug ?? "Nao definido"
                      }`,
                      `Estado: ${
                        admin.drafts[selectedActionQuote.id]?.status ??
                        selectedActionQuote.status
                      }`,
                      `Total: ${formatMoney(
                        asNumber(selectedActionQuote.total),
                        selectedActionQuote.currency,
                      )}`,
                      `Tecnico: ${
                        selectedActionQuote.technician ||
                        "Ainda nao atribuido"
                      }`,
                      `Proximo passo: ${
                        selectedActionQuote.next_step || "Sem proximo passo"
                      }`,
                      `Previsao: ${
                        selectedActionQuote.estimated_completion ??
                        "Sem previsao definida"
                      }`,
                    ].join("\n"),
                  );
                }}
              >
                Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {admin.quoteProcedureOpen.value && (
        <div class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Fechar"
            class="absolute inset-0"
            onClick$={admin.closeQuoteProcedure$}
          />

          <section class="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
                  {procedureQuote?.status === "em_atividade" ||
                  procedureQuote?.status === "aprovado"
                    ? "Editar procedimento"
                    : "Proceder solicitacao"}
                </p>
                <h3 class="mt-2 text-xl font-black text-white">
                  {procedureQuote?.quote_number ?? "Cotacao"}
                </h3>
                <p class="mt-1 text-sm text-slate-400">
                  {procedureQuote?.profiles?.full_name ?? "Cliente"} /{" "}
                  {procedureQuote?.service_slug ?? "Servico"}
                </p>
              </div>

              <button
                type="button"
                class="rounded-full border border-slate-700 px-3 py-2 text-sm font-bold text-slate-300"
                onClick$={admin.closeQuoteProcedure$}
              >
                X
              </button>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <div class="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 md:col-span-2">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
                  Comprovativo de pagamento
                </p>
                <p class="mt-1 text-xs leading-5 text-emerald-100/70">
                  Confirme o que o cliente pagou antes de proceder a
                  solicitacao.
                </p>

                <div class="mt-4 grid gap-2 md:grid-cols-2">
                  {[
                    {
                      label: "Pagou a fatura proforma",
                      value: "proforma" as const,
                    },
                    {
                      label: "Pagou mao de obra da fatura proforma",
                      value: "labor" as const,
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      class={[
                        "rounded-xl border px-3 py-3 text-left text-sm font-black transition",
                        admin.quoteProcedurePaymentType.value === option.value
                          ? "border-emerald-300 bg-emerald-300 text-slate-950"
                          : "border-slate-700 text-slate-200 hover:border-emerald-300/50",
                      ]}
                      onClick$={() => {
                        admin.quoteProcedurePaymentType.value = option.value;
                        admin.quoteProcedurePaymentAmount.value =
                          option.value === "labor"
                            ? asNumber(procedureQuote?.labor_total ?? 0)
                            : asNumber(procedureQuote?.total ?? 0);
                        if (!admin.quoteProcedureReceiptNumber.value) {
                          admin.quoteProcedureReceiptNumber.value =
                            procedureReceiptNumber;
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div class="mt-4">
                  <label>
                    <span class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
                      Numero do recibo
                    </span>
                    <input
                      value={procedureReceiptNumber}
                      readOnly
                      class="mt-2 h-11 w-full rounded-xl border border-emerald-400/20 bg-slate-900 px-3 text-sm text-slate-300 outline-none"
                    />
                  </label>
                </div>

                <div class="mt-4 grid gap-3 md:grid-cols-2">
                  <label>
                    <span class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
                      Valor pago
                    </span>
                    <input
                      value={formatMoney(
                        procedureAccountingAmount,
                        procedureQuote?.currency ?? "MZN",
                      )}
                      readOnly
                      class="mt-2 h-11 w-full rounded-xl border border-emerald-400/20 bg-slate-900 px-3 text-sm text-slate-300 outline-none"
                    />
                  </label>

                  <label>
                    <span class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
                      Pagou por
                    </span>
                    <select
                      value={admin.quoteProcedurePaymentMethod.value}
                      class="mt-2 h-11 w-full rounded-xl border border-emerald-400/20 bg-slate-950 px-3 text-sm text-white outline-none"
                      onChange$={(event) => {
                        admin.quoteProcedurePaymentMethod.value = (
                          event.target as HTMLSelectElement
                        ).value as "cash" | "account" | "";
                        if (admin.quoteProcedurePaymentMethod.value === "cash") {
                          admin.quoteProcedurePaymentOriginType.value = "";
                          admin.quoteProcedurePaymentOriginNumber.value = "";
                          admin.quoteProcedurePaymentDestinationType.value = "";
                          admin.quoteProcedurePaymentDestinationNumber.value = "";
                        }
                      }}
                    >
                      <option value="">Escolha</option>
                      <option value="cash">Dinheiro vivo</option>
                      <option value="account">Na conta</option>
                    </select>
                  </label>
                </div>

                {admin.quoteProcedurePaymentMethod.value === "account" && (
                  <div class="mt-4 grid gap-3 md:grid-cols-2">
                    <label>
                      <span class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
                        Origem: tipo
                      </span>
                      <select
                        value={admin.quoteProcedurePaymentOriginType.value}
                        class="mt-2 h-11 w-full rounded-xl border border-emerald-400/20 bg-slate-950 px-3 text-sm text-white outline-none"
                        onChange$={(event) => {
                          admin.quoteProcedurePaymentOriginType.value = (
                            event.target as HTMLSelectElement
                          ).value as "BIM" | "BCI" | "E-Mola" | "M-Pesa" | "";
                        }}
                      >
                        <option value="">Tipo</option>
                        <option value="BIM">BIM</option>
                        <option value="BCI">BCI</option>
                        <option value="E-Mola">E-Mola</option>
                        <option value="M-Pesa">M-Pesa</option>
                      </select>
                    </label>

                    <label>
                      <span class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
                        Origem: numero
                      </span>
                      <input
                        value={admin.quoteProcedurePaymentOriginNumber.value}
                        class="mt-2 h-11 w-full rounded-xl border border-emerald-400/20 bg-slate-950 px-3 text-sm text-white outline-none"
                        onInput$={(event) => {
                          admin.quoteProcedurePaymentOriginNumber.value = (
                            event.target as HTMLInputElement
                          ).value;
                        }}
                      />
                    </label>

                    <label>
                      <span class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
                        Destino: tipo
                      </span>
                      <select
                        value={admin.quoteProcedurePaymentDestinationType.value}
                        class="mt-2 h-11 w-full rounded-xl border border-emerald-400/20 bg-slate-950 px-3 text-sm text-white outline-none"
                        onChange$={(event) => {
                          admin.quoteProcedurePaymentDestinationType.value = (
                            event.target as HTMLSelectElement
                          ).value as "BIM" | "BCI" | "E-Mola" | "M-Pesa" | "";
                        }}
                      >
                        <option value="">Tipo</option>
                        <option value="BIM">BIM</option>
                        <option value="BCI">BCI</option>
                        <option value="E-Mola">E-Mola</option>
                        <option value="M-Pesa">M-Pesa</option>
                      </select>
                    </label>

                    <label>
                      <span class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
                        Destino: numero
                      </span>
                      <input
                        value={admin.quoteProcedurePaymentDestinationNumber.value}
                        class="mt-2 h-11 w-full rounded-xl border border-emerald-400/20 bg-slate-950 px-3 text-sm text-white outline-none"
                        onInput$={(event) => {
                          admin.quoteProcedurePaymentDestinationNumber.value = (
                            event.target as HTMLInputElement
                          ).value;
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <label class="block">
                <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Tecnico operador
                </span>
                <select
                  value={admin.quoteProcedureOperatorId.value}
                  class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
                  onChange$={(event) => {
                    admin.quoteProcedureOperatorId.value = (
                      event.target as HTMLSelectElement
                    ).value;
                  }}
                >
                  <option value="">Escolha o operador</option>
                  {admin.ownerOperators.value.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.full_name ||
                        operator.email ||
                        operator.phone ||
                        "Operador Bitoll"}
                    </option>
                  ))}
                </select>
              </label>

              <label class="block">
                <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Data de inicio
                </span>
                <input
                  type="date"
                  value={admin.quoteProcedureStartDate.value}
                  class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
                  onInput$={(event) => {
                    admin.quoteProcedureStartDate.value = (
                      event.target as HTMLInputElement
                    ).value;
                  }}
                />
              </label>

              <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Dias de trabalho
                </p>
                <p class="mt-2 text-2xl font-black text-cyan-100">
                  {procedureEstimatedDays} dia
                  {procedureEstimatedDays === 1 ? "" : "s"}
                </p>
                <p class="mt-1 text-xs font-bold text-slate-500">
                  Fim previsto: {procedureServiceEndDate || "Por definir"}
                </p>
              </div>
            </div>

            <div class="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Passos deste servico
                  </p>
                  <p class="mt-1 text-xs leading-5 text-slate-500">
                    Marque os passos ja feitos e acrescente passos se necessario.
                  </p>
                </div>

                <button
                  type="button"
                  class="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950"
                  onClick$={() => {
                    admin.quoteProcedureSteps.items = [
                      ...admin.quoteProcedureSteps.items,
                      { checked: false, day: procedureEstimatedDays || 1, label: "" },
                    ];
                  }}
                >
                  Acrescentar passo
                </button>
              </div>

              <div class="mt-4 space-y-3">
                {procedureSteps.map((step, index) => (
                  <div
                    key={`procedure-step-${index}`}
                    class="rounded-xl border border-slate-800 bg-slate-950 p-3"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <label class="flex items-center gap-3 text-sm font-bold text-slate-200">
                        <input
                          type="checkbox"
                          checked={step.checked}
                          class="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400"
                          onChange$={(event) => {
                            admin.quoteProcedureSteps.items[index].checked = (
                              event.target as HTMLInputElement
                            ).checked;
                          }}
                        />
                        Passo {index + 1}
                      </label>

                      <button
                        type="button"
                        class="rounded-lg border border-red-400/30 px-2 py-1 text-xs font-bold text-red-200"
                        onClick$={() => {
                          admin.quoteProcedureSteps.items =
                            admin.quoteProcedureSteps.items.filter(
                              (_item, itemIndex) => itemIndex !== index,
                            );
                        }}
                      >
                        Remover
                      </button>
                    </div>

                    <div class="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_9rem]">
                      <label class="block">
                        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Descricao do passo
                        </span>
                        <input
                          type="text"
                          value={step.label}
                          class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
                          onInput$={(event) => {
                            admin.quoteProcedureSteps.items[index].label = (
                              event.target as HTMLInputElement
                            ).value;
                          }}
                        />
                      </label>

                      <label class="block">
                        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Dia previsto
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={step.day}
                          class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none"
                          onInput$={(event) => {
                            admin.quoteProcedureSteps.items[index].day = Math.max(
                              1,
                              Number((event.target as HTMLInputElement).value || 1),
                            );
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}

                {procedureSteps.length === 0 && (
                  <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                    Este servico nao tem passos predefinidos. Acrescente os
                    passos necessarios para este procedimento.
                  </div>
                )}
              </div>
            </div>

            <div class="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                class="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
                onClick$={admin.closeQuoteProcedure$}
              >
                Cancelar
              </button>

              {!procedureReady && (
                <div class="w-full rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  Para concluir, comprove o pagamento com valor e origem,
                  escolha o operador, informe a data de inicio e defina pelo
                  menos um passo do servico.
                </div>
              )}

              {procedureReady && (
                <button
                  type="button"
                  class="rounded-xl border border-emerald-300/40 px-4 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-400/10"
                  onClick$={async () => {
                  if (!procedureQuote) {
                    return;
                  }

                  if (!admin.quoteProcedurePaymentType.value) {
                    admin.showToast$(
                      "Pagamento incompleto",
                      "Escolha primeiro o tipo de pagamento.",
                    );
                    return;
                  }

                  if (!procedureWhatsappHref) {
                    admin.showToast$(
                      "WhatsApp indisponivel",
                      "O contacto do cliente nao parece estar pronto para WhatsApp.",
                    );
                    return;
                  }

                  const receiptNumber = procedureReceiptNumber;
                  admin.quoteProcedureReceiptNumber.value = receiptNumber;
                  const customerName =
                    procedureQuote.profiles?.full_name ?? "Cliente";
                  const customerPhone =
                    procedureQuote.profiles?.phone ??
                    (typeof procedureQuote.request_payload?.contacto === "string"
                      ? procedureQuote.request_payload.contacto
                      : "");
                  const customerEmail =
                    procedureQuote.profiles?.email ??
                    (typeof procedureQuote.request_payload?.email === "string"
                      ? procedureQuote.request_payload.email
                      : "");
                  const customerCity =
                    procedureQuote.profiles?.city ??
                    (typeof procedureQuote.request_payload?.city === "string"
                      ? procedureQuote.request_payload.city
                      : "");
                  const terms = [
                    "A Bitoll confirma a recepcao do pagamento indicado neste documento.",
                    "A execucao do servico segue os passos e prazos definidos pela equipa tecnica.",
                    "Qualquer alteracao de escopo, local, materiais ou prazo pode exigir nova validacao.",
                    "O cliente deve garantir acesso ao local e disponibilidade para testes finais.",
                  ];
                  const supabase = getSupabaseBrowserClient();

                  if (!supabase) {
                    admin.showToast$(
                      "Sistema indisponivel",
                      "Nao foi possivel ligar ao armazenamento de documentos.",
                    );
                    return;
                  }

                  const { data: sessionData } = await supabase.auth.getSession();
                  const accessToken = sessionData.session?.access_token;

                  if (!accessToken) {
                    admin.showToast$(
                      "Sessao expirada",
                      "Entre novamente como administrador para criar o acesso do cliente.",
                    );
                    return;
                  }

                  const accessResponse = await fetch(
                    "/api/admin/customer-access",
                    {
                      body: JSON.stringify({
                        city: customerCity,
                        email: customerEmail,
                        name: customerName,
                        phone: customerPhone,
                        quoteId: procedureQuote.id,
                      }),
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                      },
                      method: "POST",
                    },
                  );
                  const customerAccess =
                    (await accessResponse.json().catch(() => null)) as
                      | CustomerAccessResponse
                      | null;

                  if (!accessResponse.ok || !customerAccess?.ok) {
                    admin.showToast$(
                      "Acesso nao criado",
                      customerAccess?.message ||
                        "Nao foi possivel preparar as credenciais do cliente.",
                    );
                    return;
                  }

                  procedureQuote.profile_id =
                    customerAccess.customerId ?? procedureQuote.profile_id;
                  procedureQuote.request_payload = {
                    ...(procedureQuote.request_payload ?? {}),
                    client_access: {
                      must_change_password: true,
                      tracking_url: customerAccess.trackingUrl,
                      username:
                        customerAccess.username ?? procedureWhatsappPhone,
                    },
                  };

                  const documentLines = [
                    "BITOLL - SEGURANCA E TECNOLOGIA",
                    "",
                    "FATURA-RECIBO E TERMO DE COMPROMISSO",
                    `Documento: ${receiptNumber}`,
                    `Emitido em: ${new Date().toLocaleString("pt-MZ")}`,
                    "",
                    `Cliente: ${customerName}`,
                    `Contacto: ${customerPhone || customerEmail || "Sem contacto"}`,
                    `Solicitacao: ${procedureQuote.quote_number}`,
                    `Servico: ${procedureQuote.service_slug ?? "Servico Bitoll"}`,
                    `Inicio do servico: ${admin.quoteProcedureStartDate.value}`,
                    `Fim previsto: ${procedureServiceEndDate || "Por definir"}`,
                    `Pagamento: ${procedurePaymentLabel}`,
                    `Valor pago: ${formatMoney(procedureAccountingAmount, procedureQuote.currency)}`,
                    `Origem: ${
                      admin.quoteProcedurePaymentMethod.value === "cash"
                        ? "Dinheiro vivo"
                        : `${admin.quoteProcedurePaymentOriginType.value} - ${admin.quoteProcedurePaymentOriginNumber.value}`
                    }`,
                    `Destino: ${
                      admin.quoteProcedurePaymentMethod.value === "cash"
                        ? "Caixa"
                        : `${admin.quoteProcedurePaymentDestinationType.value} - ${admin.quoteProcedurePaymentDestinationNumber.value}`
                    }`,
                    `Total da solicitacao: ${formatMoney(asNumber(procedureQuote.total), procedureQuote.currency)}`,
                    "",
                    "TERMO DE COMPROMISSO",
                    ...terms.map((term, index) => `${index + 1}. ${term}`),
                    "",
                    "PASSOS DO SERVICO",
                    ...(procedureSteps.length > 0
                      ? procedureSteps.map(
                          (step, index) =>
                            `${index + 1}. ${step.label || "Por definir"} - dia ${step.day}`,
                        )
                      : ["Passos por definir pela equipa tecnica."]),
                    "",
                    "ACESSO AO ACOMPANHAMENTO",
                    `Link: ${customerAccess.trackingUrl ?? ""}`,
                    `Usuario: ${customerAccess.username ?? procedureWhatsappPhone}`,
                    `Senha temporaria: ${customerAccess.temporaryPassword ?? "123456"}`,
                    "Por seguranca, altere a senha apos o primeiro acesso.",
                  ];
                  const pdfBlob = createSimplePdfBlob(documentLines);
                  const path = `receipts/${procedureQuote.quote_number}/${receiptNumber}.pdf`;
                  const upload = await supabase.storage
                    .from("bitoll-documents")
                    .upload(path, pdfBlob, {
                      contentType: "application/pdf",
                      upsert: true,
                    });

                  if (upload.error) {
                    admin.showToast$(
                      "PDF nao guardado",
                      upload.error.message ||
                        "Nao foi possivel guardar o PDF no sistema.",
                    );
                    return;
                  }

                  const publicUrl = supabase.storage
                    .from("bitoll-documents")
                    .getPublicUrl(path).data.publicUrl;
                  admin.quoteProcedureReceiptUrl.value = publicUrl;
                  const whatsappMessage = [
                    `Boa noite, ${customerName}.`,
                    `Segue a fatura-recibo e termo de compromisso ${receiptNumber}.`,
                    `Solicitacao: ${procedureQuote.quote_number}.`,
                    `Pagamento: ${procedurePaymentLabel}.`,
                    `Valor pago: ${formatMoney(procedureAccountingAmount, procedureQuote.currency)}.`,
                    `Documento: ${publicUrl}`,
                    "",
                    "Para acompanhar os passos da sua obra:",
                    `Link: ${customerAccess.trackingUrl ?? ""}`,
                    `Usuario: ${customerAccess.username ?? procedureWhatsappPhone}`,
                    `Senha temporaria: ${customerAccess.temporaryPassword ?? "123456"}`,
                    "Depois de entrar, altere a senha temporaria.",
                    "",
                    "Bitoll - Seguranca e Tecnologia",
                  ].join("\n");
                  window.open(
                    `https://wa.me/${procedureWhatsappPhone}?text=${encodeURIComponent(
                      whatsappMessage,
                    )}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                  await admin.saveQuoteProcedure$();
                  }}
                >
                  Enviar
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
});
