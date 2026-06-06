import { useForm } from '@inertiajs/react';
import { type FormEvent, useCallback, useEffect } from 'react';
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
import { dataproduk } from '@/routes';
import type { ProdukItem } from '@/pages/dataproduk';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editData?: ProdukItem | null;
};

export default function ProdukFormModal({
  isOpen,
  onClose,
  editData,
}: Props) {
  const { data, setData, post, patch, processing, errors, reset, clearErrors } =
    useForm({
      nama_produk: '',
      stok: '',
      stok_minimum: '',
    });

  const isEdit = !!editData;

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setData({
          nama_produk: editData.nama,
          stok: editData.stok.toString(),
          stok_minimum: editData.stok_minimum.toString(),
        });
      } else {
        reset();
      }
    }
  }, [isOpen, editData]);

  const handleClose = useCallback(() => {
    reset();
    clearErrors();
    onClose();
  }, [reset, clearErrors, onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isEdit) {
      patch(`/dataproduk/${editData.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          handleClose();
          void Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data produk berhasil diperbarui.',
            timer: 1500,
            showConfirmButton: false,
          });
        },
      });
    } else {
      post(dataproduk().url, {
        preserveScroll: true,
        onSuccess: () => {
          handleClose();
          void Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data produk berhasil ditambahkan.',
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
            {isEdit ? 'Edit Data Produk' : 'Tambah Data Produk'}
          </DialogTitle>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isEdit ? 'Ubah detail produk yang sudah ada.' : 'Masukkan detail produk terbaru dengan lengkap.'}
          </p>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label
              htmlFor="nama_produk"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Nama Produk
            </Label>
            <Input
              id="nama_produk"
              type="text"
              className="bg-white/70 shadow-xs dark:bg-neutral-950/40"
              value={data.nama_produk}
              onChange={(event) => setData('nama_produk', event.target.value)}
              placeholder="Masukkan nama produk"
              required
            />
            <InputError message={errors.nama_produk} />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="stok"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Stok Saat Ini
            </Label>
            <Input
              id="stok"
              type="number"
              min={0}
              className="bg-white/70 shadow-xs dark:bg-neutral-950/40"
              value={data.stok}
              onChange={(event) => setData('stok', event.target.value)}
              placeholder="Masukkan jumlah stok"
              required
            />
            <InputError message={errors.stok} />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="stok_minimum"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Batas Stok Minimum
            </Label>
            <Input
              id="stok_minimum"
              type="number"
              min={0}
              className="bg-white/70 shadow-xs dark:bg-neutral-950/40"
              value={data.stok_minimum}
              onChange={(event) => setData('stok_minimum', event.target.value)}
              placeholder="Masukkan batas stok minimum"
              required
            />
            <InputError message={errors.stok_minimum} />
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
