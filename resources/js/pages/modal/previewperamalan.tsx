import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type PreviewItem = {
  peramalan_id: string;
  periode_awal: string;
  periode_akhir: string;
  nama_produk: string;
  nilai_peramalan: number;
  alpha: number;
  mad: number | null;
  mse: number | null;
};

type PreviewData = {
  periode_awal: string;
  periode_akhir: string;
  items: PreviewItem[];
};

type Props = {
  isOpen: boolean;
  preview: PreviewData | null;
  onClose: () => void;
  onSave: () => void;
};

const formatProduk = (value: string) => {
  const normalized = value.replaceAll('_', ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatPeriode = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);

const formatMetric = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return '-';
  }

  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(
    value,
  );
};

const tooltipButtonClass =
  'ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300';

export default function PreviewPeramalanModal({
  isOpen,
  preview,
  onClose,
  onSave,
}: Props) {
  const periodeLabel = preview ? formatPeriode(preview.periode_awal) : '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border border-neutral-200/80 bg-white p-6 shadow-lg sm:max-w-3xl dark:border-neutral-800/80 dark:bg-[#0a1220]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Hasil Peramalan Periode {periodeLabel}
          </DialogTitle>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Ringkasan hasil peramalan yang siap disimpan.
          </p>
        </DialogHeader>

        {!preview ? (
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Tidak ada data.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200/80 bg-white/70 p-3 text-sm text-neutral-700 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-950/40 dark:text-neutral-200">
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                Stok Rekomendasi:
              </div>
              <div className="mt-2 space-y-1">
                {preview.items.map((item) => (
                  <div key={item.peramalan_id}>
                    {formatProduk(item.nama_produk)} -&gt;{' '}
                    {formatNumber(item.nilai_peramalan)} Unit
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-200/80 bg-white/70 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-950/40">
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-sm">
                  <thead className="sticky top-0 bg-slate-100/90 text-xs font-semibold text-neutral-600 uppercase backdrop-blur dark:bg-neutral-900/90 dark:text-neutral-300">
                    <tr>
                      <th className="px-3 py-2.5 text-left">Produk</th>
                      <th className="px-3 py-2.5 text-center">
                        Alpha
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={tooltipButtonClass}
                              tabIndex={-1}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Parameter penghalus dalam peramalan. Nilai lebih
                            besar membuat hasil lebih cepat mengikuti perubahan
                            data.
                          </TooltipContent>
                        </Tooltip>
                      </th>
                      <th className="px-3 py-2.5 text-center">
                        MSE
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={tooltipButtonClass}
                              tabIndex={-1}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Mean Squared Error, rata-rata kuadrat kesalahan
                            perkiraan. Semakin kecil, semakin akurat.
                          </TooltipContent>
                        </Tooltip>
                      </th>
                      <th className="px-3 py-2.5 text-center">
                        MAD
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={tooltipButtonClass}
                              tabIndex={-1}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Mean Absolute Deviation, rata-rata meleset berapa
                            unit dari data asli. Semakin kecil, semakin baik.
                          </TooltipContent>
                        </Tooltip>
                      </th>
                      <th className="px-3 py-2.5 text-right">
                        Nilai Peramalan
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={tooltipButtonClass}
                              tabIndex={-1}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Rekomendasi jumlah stok yang perlu disiapkan.
                          </TooltipContent>
                        </Tooltip>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {preview.items.map((item) => (
                      <tr
                        key={item.peramalan_id}
                        className="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-sky-50/60 dark:odd:bg-neutral-900 dark:even:bg-neutral-900/60 dark:hover:bg-sky-900/20"
                      >
                        <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
                          {formatProduk(item.nama_produk)}
                        </td>
                        <td className="px-3 py-2.5 text-center text-neutral-700 dark:text-neutral-200">
                          {formatMetric(item.alpha)}
                        </td>
                        <td className="px-3 py-2.5 text-center text-neutral-700 dark:text-neutral-200">
                          {formatMetric(item.mse)}
                        </td>
                        <td className="px-3 py-2.5 text-center text-neutral-700 dark:text-neutral-200">
                          {formatMetric(item.mad)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-neutral-700 dark:text-neutral-200">
                          {formatNumber(item.nilai_peramalan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button
                onClick={onSave}
                className="bg-sky-600 text-white shadow-sm hover:bg-sky-500 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300"
              >
                Simpan
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
