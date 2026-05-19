import { useForm } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { type FormEvent, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import InputError from '@/components/input-error';
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
  const periodeAwalRef = useRef<HTMLInputElement>(null);
  const periodeAkhirRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    reset();
    clearErrors();
    onClose();
  }, [reset, clearErrors, onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    post('/dataperamalan/hitung', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onClose();
        void Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Peramalan berhasil dihitung.',
          timer: 1500,
          showConfirmButton: false,
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Hitung Peramalan</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="periode_awal">
              Masukkan Periode Awal Data Penjualan
            </Label>
            <div className="relative">
              <Input
                id="periode_awal"
                type="date"
                className="pr-10 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                ref={periodeAwalRef}
                value={data.periode_awal}
                onClick={() => periodeAwalRef.current?.showPicker?.()}
                onChange={(event) =>
                  setData('periode_awal', event.target.value)
                }
                placeholder="periode awal data"
                required
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
            <InputError message={errors.periode_awal} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="periode_akhir">
              Masukkan Periode Akhir Data Penjualan
            </Label>
            <div className="relative">
              <Input
                id="periode_akhir"
                type="date"
                className="pr-10 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                ref={periodeAkhirRef}
                value={data.periode_akhir}
                onClick={() => periodeAkhirRef.current?.showPicker?.()}
                onChange={(event) =>
                  setData('periode_akhir', event.target.value)
                }
                placeholder="periode akhir data"
                required
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
            <InputError message={errors.periode_akhir} />
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit" disabled={processing}>
              Hitung
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
