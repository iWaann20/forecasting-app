import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

export default function PreviewPeramalanModal({
  isOpen,
  preview,
  onClose,
  onSave,
}: Props) {
  const periodeLabel = preview ? formatPeriode(preview.periode_awal) : '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Hasil Peramalan Periode {periodeLabel}</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div className="text-sm text-neutral-500">Tidak ada data.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-neutral-100 p-3 text-sm text-neutral-700">
              <div className="font-medium text-neutral-900">
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

            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-100 text-xs text-neutral-600 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Produk</th>
                    <th className="px-3 py-2 text-center">Alpha</th>
                    <th className="px-3 py-2 text-center">MSE</th>
                    <th className="px-3 py-2 text-center">MAD</th>
                    <th className="px-3 py-2 text-right">Nilai Peramalan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {preview.items.map((item) => (
                    <tr key={item.peramalan_id}>
                      <td className="px-3 py-2 text-neutral-700">
                        {formatProduk(item.nama_produk)}
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
                        {formatNumber(item.nilai_peramalan)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button onClick={onSave}>Simpan</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
