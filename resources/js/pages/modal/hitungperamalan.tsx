import { Calendar } from 'lucide-react';
import { type FormEvent, useCallback, useRef, useState } from 'react';
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
  onSubmit?: (data: { periodeAwal: string; periodeAkhir: string }) => void;
};

export default function HitungPeramalanModal({
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [periodeAwal, setPeriodeAwal] = useState('');
  const [periodeAkhir, setPeriodeAkhir] = useState('');
  const periodeAwalRef = useRef<HTMLInputElement>(null);
  const periodeAkhirRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setPeriodeAwal('');
    setPeriodeAkhir('');
    onClose();
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.({ periodeAwal, periodeAkhir });
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
                value={periodeAwal}
                onClick={() => periodeAwalRef.current?.showPicker?.()}
                onChange={(event) => setPeriodeAwal(event.target.value)}
                placeholder="periode awal data"
                required
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
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
                value={periodeAkhir}
                onClick={() => periodeAkhirRef.current?.showPicker?.()}
                onChange={(event) => setPeriodeAkhir(event.target.value)}
                placeholder="periode akhir data"
                required
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit">Hitung</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
