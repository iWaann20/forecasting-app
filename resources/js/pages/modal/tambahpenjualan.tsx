import { useForm } from '@inertiajs/react';
import { AlertTriangle, Calendar } from 'lucide-react';
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
  stok: number;
  stok_minimum: number;
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

export default function TambahPenjualanModal({
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

  // Stok validation: compute available stock
  const selectedProduk = produkOptions.find((p) => p.id === data.produk_id) ?? null;
  const jumlahInput = parseInt(data.jumlah, 10);

  let stokTersedia = selectedProduk?.stok ?? 0;
  // When editing the same product, add back the old sales quantity
  if (isEdit && editData && selectedProduk && editData.produk_id === data.produk_id) {
    stokTersedia = selectedProduk.stok + editData.jumlah;
  }

  const isStokKurang =
    selectedProduk !== null &&
    !Number.isNaN(jumlahInput) &&
    jumlahInput > 0 &&
    jumlahInput > stokTersedia;

  const isStokRendah =
    selectedProduk !== null &&
    !Number.isNaN(jumlahInput) &&
    jumlahInput > 0 &&
    !isStokKurang &&
    stokTersedia - jumlahInput <= selectedProduk.stok_minimum;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isStokKurang) return; // Guard: prevent submit if stok insufficient

    if (isEdit) {
      patch(`/datapenjualan/${editData.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          handleClose();
          void Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data penjualan berhasil diperbarui.',
            timer: 1500,
            showConfirmButton: false,
          });
        },
      });
    } else {
      post('/datapenjualan', {
        preserveScroll: true,
        onSuccess: () => {
          handleClose();
          void Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data penjualan berhasil ditambahkan.',
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
            {isEdit ? 'Edit Data Penjualan' : 'Tambah Data Penjualan'}
          </DialogTitle>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isEdit ? 'Ubah detail penjualan yang sudah ada.' : 'Masukkan detail penjualan terbaru dengan lengkap.'}
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
                      <span>{produk.nama}</span>
                      <span className="ml-2 text-xs text-neutral-400">
                        (Stok: {produk.stok})
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedProduk && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Stok tersedia:{' '}
                <span className={`font-semibold ${stokTersedia <= selectedProduk.stok_minimum ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {stokTersedia} unit
                </span>
                {isEdit && editData?.produk_id === data.produk_id && (
                  <span className="ml-1 text-neutral-400">(termasuk {editData.jumlah} unit penjualan lama)</span>
                )}
              </p>
            )}
            <InputError message={errors.produk_id} />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="jumlah"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Jumlah
            </Label>
            <Input
              id="jumlah"
              type="number"
              min={1}
              max={stokTersedia > 0 ? stokTersedia : undefined}
              className={`bg-white/70 shadow-xs dark:bg-neutral-950/40 ${isStokKurang ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
              value={data.jumlah}
              onChange={(event) => setData('jumlah', event.target.value)}
              placeholder="Masukkan jumlah"
              required
            />
            <InputError message={errors.jumlah} />
          </div>

          {/* Inline stok warning */}
          {isStokKurang && selectedProduk && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 dark:border-rose-800/60 dark:bg-rose-950/40">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  Stok tidak mencukupi
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  Jumlah yang dimasukkan ({jumlahInput}) melebihi stok tersedia ({stokTersedia} unit). Pengiriman tidak dapat dilakukan.
                </p>
              </div>
            </div>
          )}

          {/* Stok rendah warning */}
          {isStokRendah && selectedProduk && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/60 dark:bg-amber-950/40">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Peringatan stok rendah
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Setelah penjualan ini, stok {selectedProduk.nama} akan menyentuh atau di bawah batas minimum ({selectedProduk.stok_minimum} unit).
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={processing || isStokKurang}
              className="bg-sky-600 text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300"
            >
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

