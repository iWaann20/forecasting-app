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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { datapenjualan } from '@/routes';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  produkOptions: string[];
};

export default function TambahPenjualanModal({
  isOpen,
  onClose,
  produkOptions,
}: Props) {
  const { data, setData, post, processing, errors, reset, clearErrors } =
    useForm({
      tanggal: '',
      produk: '',
      jumlah: '',
    });

  const formatProduk = (value: string) => {
    const normalized = value.replaceAll('_', ' ').toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const handleClose = useCallback(() => {
    reset();
    clearErrors();
    onClose();
  }, [reset, clearErrors, onClose]);

  const tanggalInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    post(datapenjualan().url, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onClose();
        void Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data penjualan berhasil ditambahkan.',
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
          <DialogTitle>Tambah Data Penjualan</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="tanggal">Tanggal</Label>
            <div className="relative">
              <Input
                id="tanggal"
                type="date"
                className="pr-10 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                ref={tanggalInputRef}
                value={data.tanggal}
                onClick={() => tanggalInputRef.current?.showPicker?.()}
                onChange={(event) => setData('tanggal', event.target.value)}
                required
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
            <InputError message={errors.tanggal} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="produk">Produk</Label>
            <Select
              value={data.produk}
              onValueChange={(value) => setData('produk', value)}
            >
              <SelectTrigger id="produk">
                <SelectValue placeholder="produk" />
              </SelectTrigger>
              <SelectContent>
                {produkOptions.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Belum ada produk
                  </SelectItem>
                ) : (
                  produkOptions.map((produk) => (
                    <SelectItem key={produk} value={produk}>
                      {formatProduk(produk)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <InputError message={errors.produk} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jumlah">Jumlah</Label>
            <Input
              id="jumlah"
              type="number"
              min={1}
              value={data.jumlah}
              onChange={(event) => setData('jumlah', event.target.value)}
              placeholder="jumlah"
              required
            />
            <InputError message={errors.jumlah} />
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit" disabled={processing}>
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
