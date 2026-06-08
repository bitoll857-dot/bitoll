import { component$, type QRL } from "@builder.io/qwik";

type Props = {
  imageUrl?: string;
  title: string;
  message: string;
  onClose$: QRL<() => void>;
};

export const DetailsModal = component$<Props>(
  ({ imageUrl = "", title, message, onClose$ }) => {
    const detailRows = message
      .split("\n")
      .reduce<{ label: string; value: string }[]>((rows, line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex === -1) {
          const lastRow = rows[rows.length - 1];

          if (lastRow) {
            lastRow.value = `${lastRow.value}\n${line.trim()}`.trim();
          } else {
            rows.push({
              label: "",
              value: line.trim(),
            });
          }

          return rows;
        }

        rows.push({
          label: line.slice(0, separatorIndex).trim(),
          value: line.slice(separatorIndex + 1).trim(),
        });

        return rows;
      }, [])
      .filter((row) => row.value);
    const textRows = detailRows.filter(
      (row) =>
        row.value.length > 90 ||
        [
          "Descricao",
          "Notas",
          "Artigos",
          "Artigos da cotacao",
          "Campos",
          "Proximo passo",
        ].includes(
          row.label,
        ),
    );
    const summaryRows = detailRows.filter((row) => !textRows.includes(row));

    return (
      <div class="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/85 px-4 py-6 backdrop-blur-xl">
        <div
          class={[
            "max-h-[92dvh] w-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-[0_24px_90px_rgba(0,0,0,0.55)]",
            imageUrl ? "max-w-4xl md:grid md:grid-cols-[280px_minmax(0,1fr)]" : "max-w-3xl",
          ]}
        >
          {imageUrl && (
            <div class="border-b border-slate-800 bg-slate-900 md:border-b-0 md:border-r">
              <img
                src={imageUrl}
                alt={title}
                width={420}
                height={560}
                class="h-52 w-full object-contain md:h-[92dvh] md:max-h-[720px]"
              />
            </div>
          )}

          <div class="relative min-w-0">
            {imageUrl ? (
              <div class="border-b border-slate-800 p-6 pr-16">
                <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
                  Detalhes
                </p>

                <h2 class="mt-2 text-2xl font-black text-white">{title}</h2>
              </div>
            ) : (
              <div class="border-b border-slate-800 bg-slate-900 p-6 pr-16">
                <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
                  Detalhes
                </p>

                <h2 class="mt-2 text-2xl font-black text-white">{title}</h2>
              </div>
            )}

            <button
              type="button"
              aria-label="Fechar detalhes"
              autoFocus
              class="absolute right-5 top-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-950/90 text-sm text-slate-300 shadow-xl"
              onClick$={onClose$}
            >
              x
            </button>

            <div class="max-h-[calc(92dvh-7rem)] overflow-y-auto p-6">
              {summaryRows.length > 0 && (
                <div class="grid gap-3 sm:grid-cols-2">
                  {summaryRows.map((row) => (
                    <div
                      key={`${row.label}-${row.value}`}
                      class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                    >
                      {row.label && (
                        <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          {row.label}
                        </span>
                      )}
                      <span class="mt-1 block break-words text-sm font-semibold text-slate-100">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {textRows.length > 0 && (
                <div class="mt-4 space-y-3">
                  {textRows.map((row) => (
                    <div
                      key={`${row.label}-${row.value}`}
                      class="rounded-2xl border border-slate-800 bg-slate-900/45 p-4"
                    >
                      {row.label && (
                        <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          {row.label}
                        </span>
                      )}
                      <p class="mt-2 whitespace-pre-line break-words text-sm leading-7 text-slate-300">
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
