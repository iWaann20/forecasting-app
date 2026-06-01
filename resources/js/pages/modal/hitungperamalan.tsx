import { useForm } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HitungPeramalanModal({ isOpen, onClose }: Props) {
  const { data, setData, post, processing, errors, reset, clearErrors } =
    useForm({
      periode_awal: '',
      periode_akhir: '',
    });
  const [formAlert, setFormAlert] = useState<string | null>(null);
  const periodeAwalRef = useRef<HTMLInputElement>(null);
  const periodeAkhirRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    reset();
    clearErrors();
    setFormAlert(null);
    onClose();
  }, [reset, clearErrors, onClose]);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormAlert(null);

    const start = new Date(data.periode_awal);
    const end = new Date(data.periode_akhir);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setFormAlert('Periode awal dan akhir wajib diisi.');
      return;
    }

    const monthDiff =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      (end.getDate() >= start.getDate() ? 0 : -1);

    if (monthDiff < 2) {
      setFormAlert(
        'Rentang periode awal dengan periode akhir kurang dari 2 bulan.',
      );
      return;
    }

    try {
      const params = new URLSearchParams({
        periode_awal: data.periode_awal,
        periode_akhir: data.periode_akhir,
      });
      const response = await fetch(`/datapenjualan/check?${params.toString()}`);
      if (!response.ok) {
        throw new Error('failed');
      }

      const payload: { has_data?: boolean } = await response.json();
      if (!payload.has_data) {
        setFormAlert('Tidak ada data penjualan dalam rentang periode ini.');
        return;
      }
    } catch {
      setFormAlert('Gagal memeriksa data penjualan. Coba lagi.');
      return;
    }

    post('/dataperamalan/hitung', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setFormAlert(null);
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="border border-neutral-200/80 bg-amber-50/70 p-6 shadow-lg sm:max-w-sm dark:border-neutral-800/80 dark:bg-[#0a1220]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Hitung Peramalan
          </DialogTitle>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Tentukan periode awal dan akhir data penjualan.
          </p>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label
              htmlFor="periode_awal"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Masukkan Periode Awal Data Penjualan
            </Label>
            <div className="relative">
              <Input
                id="periode_awal"
                type="date"
                className="bg-white/70 pr-10 shadow-xs dark:bg-neutral-950/40 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                ref={periodeAwalRef}
                value={data.periode_awal}
                onClick={() => periodeAwalRef.current?.showPicker?.()}
                onChange={(event) =>
                  setData('periode_awal', event.target.value)
                }
                placeholder="periode awal data"
                required
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            </div>
            <InputError message={errors.periode_awal} />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="periode_akhir"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Masukkan Periode Akhir Data Penjualan
            </Label>
            <div className="relative">
              <Input
                id="periode_akhir"
                type="date"
                className="bg-white/70 pr-10 shadow-xs dark:bg-neutral-950/40 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                ref={periodeAkhirRef}
                value={data.periode_akhir}
                onClick={() => periodeAkhirRef.current?.showPicker?.()}
                onChange={(event) =>
                  setData('periode_akhir', event.target.value)
                }
                placeholder="periode akhir data"
                required
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            </div>
            <InputError message={errors.periode_akhir} />
          </div>

          {formAlert && (
            <Alert variant="destructive">
              <AlertTitle>Perhatian</AlertTitle>
              <AlertDescription>{formAlert}</AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Periode yang diramal adalah periode setelah periode akhir yang Anda
            input.
          </p>

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={processing}
              className="bg-sky-600 text-white shadow-sm hover:bg-sky-500 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300"
            >
              Hitung
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
