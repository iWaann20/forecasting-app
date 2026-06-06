import { useForm } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { type FormEvent, useCallback, useRef, useEffect } from 'react';
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

type ProdukOption = {
  id: string;
  nama: string;
};

type EditData = {
  id: string;
  tanggal: string | null;
  produk_id: string;
  jumlah: number;
} | null;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  produkOptions: ProdukOption[];
  editData?: EditData;
};

export default function StokFormModal({
  isOpen,
  onClose,
  produkOptions,
  editData,
}: Props) {
  const { data, setData, post, patch, processing, errors, reset, clearErrors } =
    useForm({
      tanggal: '',
      produk_id: '',
      jumlah: '',
    });

  const isEdit = !!editData;

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setData({
          tanggal: editData.tanggal ?? '',
          produk_id: editData.produk_id,
          jumlah: editData.jumlah.toString(),
        });
      } else {
        reset();
      }
    }
  }, [isOpen, editData, reset, setData]);

  const handleClose = useCallback(() => {
    reset();
    clearErrors();
    onClose();
  }, [reset, clearErrors, onClose]);

  const tanggalInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isEdit) {
      patch(`/datastok/${editData.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          handleClose();
          void Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data restok berhasil diperbarui.',
            timer: 1500,
            showConfirmButton: false,
          });
        },
      });
    } else {
      post('/datastok', {
        preserveScroll: true,
        onSuccess: () => {
          handleClose();
          void Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data restok berhasil ditambahkan.',
            timer: 1500,
            showConfirmButton: false,
          });
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="border border-neutral-200/80 bg-amber-50/70 p-6 shadow-lg sm:max-w-md dark:border-neutral-800/80 dark:bg-[#0a1220]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {isEdit ? 'Edit Data Restok' : 'Tambah Data Restok'}
          </DialogTitle>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isEdit ? 'Ubah detail restok yang sudah ada.' : 'Masukkan detail restok terbaru.'}
          </p>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label
              htmlFor="tanggal"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Tanggal
            </Label>
            <div className="relative">
              <Input
                id="tanggal"
                type="date"
                className="bg-white/70 pr-10 shadow-xs dark:bg-neutral-950/40 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                ref={tanggalInputRef}
                value={data.tanggal}
                onClick={() => tanggalInputRef.current?.showPicker?.()}
                onChange={(event) => setData('tanggal', event.target.value)}
                required
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            </div>
            <InputError message={errors.tanggal} />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="produk"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Produk
            </Label>
            <Select
              value={data.produk_id}
              onValueChange={(value) => setData('produk_id', value)}
            >
              <SelectTrigger
                id="produk"
                className="bg-white/70 shadow-xs dark:bg-neutral-950/40"
              >
                <SelectValue placeholder="Pilih produk" />
              </SelectTrigger>
              <SelectContent>
                {produkOptions.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Belum ada produk
                  </SelectItem>
                ) : (
                  produkOptions.map((produk) => (
                    <SelectItem key={produk.id} value={produk.id}>
                      {produk.nama}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <InputError message={errors.produk_id} />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="jumlah"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Jumlah Restok
            </Label>
            <Input
              id="jumlah"
              type="number"
              min={1}
              className="bg-white/70 shadow-xs dark:bg-neutral-950/40"
              value={data.jumlah}
              onChange={(event) => setData('jumlah', event.target.value)}
              placeholder="Masukkan jumlah"
              required
            />
            <InputError message={errors.jumlah} />
          </div>

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={processing}
              className="bg-sky-600 text-white shadow-sm hover:bg-sky-500 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300"
            >
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
