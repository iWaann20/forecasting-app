import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export type PeramalanDetail = {
  id: string;
  periode: string | null;
  periode_awal: string | null;
  periode_akhir: string | null;
  produk: string;
  alpha: number | null;
  mad: number | null;
  mse: number | null;
  nilai: number;
};

type DetailPeramalanModalProps = {
  isOpen: boolean;
  data: PeramalanDetail | null;
  onClose: () => void;
};

export default function DetailPeramalanModal({ isOpen, data, onClose }: DetailPeramalanModalProps) {
  if (!data) return null;

  const formatPeriode = (value: string | null) => {
    if (!value) return '-';
    const date = new Date(`${value}-01T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    }
    return value;
  };

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);
  
  const formatDecimal = (value: number | null) => 
    value !== null ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value) : '-';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Peramalan</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Produk</span>
            <span className="text-base text-neutral-900 dark:text-neutral-100">{data.produk}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Periode Awal</span>
              <span className="text-base text-neutral-900 dark:text-neutral-100">{formatPeriode(data.periode_awal)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Periode Akhir</span>
              <span className="text-base text-neutral-900 dark:text-neutral-100">{formatPeriode(data.periode_akhir)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Alpha</span>
              <span className="text-base text-neutral-900 dark:text-neutral-100">{formatDecimal(data.alpha)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Nilai Peramalan</span>
              <span className="text-base font-bold text-sky-600 dark:text-amber-400">{formatNumber(data.nilai)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">MAD</span>
              <span className="text-base text-neutral-900 dark:text-neutral-100">{formatDecimal(data.mad)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">MSE</span>
              <span className="text-base text-neutral-900 dark:text-neutral-100">{formatDecimal(data.mse)}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
