import { Head, Link, router, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import TambahPenjualanModal from '@/pages/modal/tambahpenjualan';
import { datapenjualan } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Data Penjualan',
    href: datapenjualan().url,
  },
];

type PenjualanItem = {
  id: string;
  tanggal: string | null;
  produk: string;
  jumlah: number;
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PenjualanPage = {
  data: PenjualanItem[];
  links: PaginationLink[];
  current_page: number;
  last_page: number;
};

type DataPenjualanProps = {
  penjualan: PenjualanPage;
  produkOptions: string[];
  bulanOptions: string[];
  tahunOptions: string[];
  filters: {
    produk?: string | null;
    bulan?: string | null;
    tahun?: string | null;
  };
};

export default function DataPenjualan() {
  const { penjualan, produkOptions, bulanOptions, tahunOptions, filters } =
    usePage<DataPenjualanProps>().props;
  const [showTambahModal, setShowTambahModal] = useState(false);

  const formatProduk = (value: string) => {
    const normalized = value.replaceAll('_', ' ').toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const formatTanggal = (value: string | null) => {
    if (!value) {
      return '-';
    }

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatBulan = (value: string) => {
    const monthNumber = Number(value);
    if (!Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return value;
    }

    const date = new Date(2000, monthNumber - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long' });
  };

  const updateFilters = (next: {
    produk?: string | null;
    bulan?: string | null;
    tahun?: string | null;
  }) => {
    const hasProduk = Object.prototype.hasOwnProperty.call(next, 'produk');
    const hasBulan = Object.prototype.hasOwnProperty.call(next, 'bulan');
    const hasTahun = Object.prototype.hasOwnProperty.call(next, 'tahun');
    const produk = hasProduk ? (next.produk ?? null) : (filters.produk ?? null);
    const bulan = hasBulan ? (next.bulan ?? null) : (filters.bulan ?? null);
    const tahun = hasTahun ? (next.tahun ?? null) : (filters.tahun ?? null);
    const query: Record<string, string> = {};

    if (produk) {
      query.produk = produk;
    }

    if (bulan) {
      query.bulan = bulan;
    }

    if (tahun) {
      query.tahun = tahun;
    }

    router.get(datapenjualan().url, query, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus data?',
      text: 'Data penjualan yang dihapus tidak bisa dikembalikan.',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) {
      return;
    }

    router.delete(`/datapenjualan/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        void Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          text: 'Data penjualan berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false,
        });
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data Penjualan" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Data Penjualan
        </h1>

        <div className="rounded-xl border border-sidebar-border/80 bg-gradient-to-br from-white via-slate-50/70 to-amber-50/40 p-4 shadow-md ring-1 ring-black/10 dark:border-sidebar-border dark:bg-gradient-to-br dark:from-neutral-950 dark:via-slate-900/70 dark:to-slate-900/80 dark:ring-white/15">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-nowrap items-center gap-2">
              <Select
                value={filters.produk ?? 'all'}
                onValueChange={(value) =>
                  updateFilters({
                    produk: value === 'all' ? null : value,
                  })
                }
              >
                <SelectTrigger className="h-9 min-w-[160px] text-xs">
                  <SelectValue placeholder="Produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Produk</SelectItem>
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
              <Select
                value={filters.bulan ?? 'all'}
                onValueChange={(value) =>
                  updateFilters({
                    bulan: value === 'all' ? null : value,
                  })
                }
              >
                <SelectTrigger className="h-9 min-w-[140px] text-xs">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {bulanOptions.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Belum ada bulan
                    </SelectItem>
                  ) : (
                    bulanOptions.map((bulan) => (
                      <SelectItem key={bulan} value={bulan}>
                        {formatBulan(bulan)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Select
                value={filters.tahun ?? 'all'}
                onValueChange={(value) =>
                  updateFilters({
                    tahun: value === 'all' ? null : value,
                  })
                }
              >
                <SelectTrigger className="h-9 min-w-[140px] text-xs">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {tahunOptions.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Belum ada tahun
                    </SelectItem>
                  ) : (
                    tahunOptions.map((tahun) => (
                      <SelectItem key={tahun} value={tahun}>
                        {tahun}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="h-9 cursor-pointer bg-sky-600 text-white shadow-sm hover:bg-sky-500 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300"
              onClick={() => setShowTambahModal(true)}
            >
              Tambah
            </Button>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200/80 bg-white/70 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-950/40">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="sticky top-0 bg-slate-100/90 text-xs font-semibold text-neutral-600 uppercase backdrop-blur dark:bg-neutral-900/90 dark:text-neutral-300">
                  <tr>
                    <th className="px-3 py-2.5 text-left">No</th>
                    <th className="px-3 py-2.5 text-left">Tanggal</th>
                    <th className="px-3 py-2.5 text-left">Produk</th>
                    <th className="px-3 py-2.5 text-right">Jumlah</th>
                    <th className="px-3 py-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {penjualan.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-10 text-center text-sm text-neutral-400"
                      >
                        Belum ada data penjualan.
                      </td>
                    </tr>
                  ) : (
                    penjualan.data.map((row, index) => (
                      <tr
                        key={row.id}
                        className="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-sky-50/60 dark:odd:bg-neutral-900 dark:even:bg-neutral-900/60 dark:hover:bg-sky-900/20"
                      >
                        <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
                          {(penjualan.current_page - 1) * 10 + index + 1}
                        </td>
                        <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
                          {formatTanggal(row.tanggal)}
                        </td>
                        <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
                          {formatProduk(row.produk)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-neutral-700 dark:text-neutral-200">
                          {row.jumlah}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-rose-200 text-rose-600 hover:border-rose-300 hover:text-rose-700 dark:border-rose-900/50 dark:text-rose-300"
                            onClick={() => handleDelete(row.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {penjualan.links.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {penjualan.links.map((link) => {
                if (!link.url) {
                  return (
                    <span
                      key={link.label}
                      className="rounded-md border border-neutral-200 px-3 py-1 text-neutral-400 dark:border-neutral-800"
                    >
                      {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                    </span>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    href={link.url}
                    className={`rounded-md border px-3 py-1 ${
                      link.active
                        ? 'border-sky-600 bg-sky-600 text-white shadow-sm dark:border-amber-400 dark:bg-amber-400 dark:text-neutral-950'
                        : 'border-neutral-200 text-neutral-600 hover:border-sky-300 hover:text-sky-700 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-amber-400/60 dark:hover:text-amber-200'
                    }`}
                    preserveState
                  >
                    {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <TambahPenjualanModal
        isOpen={showTambahModal}
        onClose={() => setShowTambahModal(false)}
        produkOptions={produkOptions}
      />
    </AppLayout>
  );
}
