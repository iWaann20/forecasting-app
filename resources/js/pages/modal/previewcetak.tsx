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

type CetakItem = {
  id: string;
  periode: string | null;
  produk: string;
  alpha: number | null;
  mse: number | null;
  mad: number | null;
  nilai: number;
};

type CetakFilters = {
  produk?: string | null;
  bulan?: string | null;
  tahun?: string | null;
};

type CetakPreview = {
  filters: CetakFilters;
  items: CetakItem[];
};

type Props = {
  isOpen: boolean;
  preview: CetakPreview | null;
  onClose: () => void;
  onPrint: () => void;
};

const formatProduk = (value: string) => {
  const normalized = value.replaceAll('_', ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatPeriode = (value: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(`${value}-01T00:00:00`);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  }

  return value;
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
  'ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600';

export default function PreviewCetakModal({
  isOpen,
  preview,
  onClose,
  onPrint,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Preview Cetak Laporan Peramalan</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div className="text-sm text-neutral-500">Tidak ada data.</div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-100 text-xs text-neutral-600 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">No</th>
                    <th className="px-3 py-2 text-left">Periode</th>
                    <th className="px-3 py-2 text-left">Produk</th>
                    <th className="px-3 py-2 text-center">
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
                          Parameter penghalus dalam peramalan. Nilai lebih besar
                          membuat hasil lebih cepat mengikuti perubahan data.
                        </TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="px-3 py-2 text-center">
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
                          Mean Squared Error, rata-rata kuadrat kesalahan perkiraan. Semakin kecil, semakin akurat.
                        </TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="px-3 py-2 text-center">
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
                          Mean Absolute Deviation, rata-rata meleset berapa unit dari data asli. Semakin kecil, semakin baik.
                        </TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="px-3 py-2 text-right">
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
                <tbody className="divide-y divide-neutral-200">
                  {preview.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-neutral-700">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 text-neutral-700">
                        {formatPeriode(item.periode)}
                      </td>
                      <td className="px-3 py-2 text-neutral-700">
                        {formatProduk(item.produk)}
                      </td>
                      <td className="px-3 py-2 text-center text-neutral-700">
                        {formatMetric(item.alpha)}
                      </td>
                      <td className="px-3 py-2 text-center text-neutral-700">
                        {formatMetric(item.mse)}
                      </td>
                      <td className="px-3 py-2 text-center text-neutral-700">
                        {formatMetric(item.mad)}
                      </td>
                      <td className="px-3 py-2 text-right text-neutral-700">
                        {formatNumber(item.nilai)}
                      </td>
                    </tr>
                  ))}
                  {preview.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-6 text-center text-neutral-500"
                      >
                        Tidak ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button onClick={onPrint}>Cetak</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
