import { Head, Link, router, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { dataperamalan } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Data Peramalan',
    href: dataperamalan().url,
  },
];

type PeramalanItem = {
  id: string;
  periode: string | null;
  produk: string;
  nilai: number;
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PeramalanPage = {
  data: PeramalanItem[];
  links: PaginationLink[];
  current_page: number;
  last_page: number;
};

type DataPeramalanProps = {
  peramalan: PeramalanPage;
  produkOptions: string[];
  bulanOptions: string[];
  tahunOptions: string[];
  filters: {
    produk?: string | null;
    bulan?: string | null;
    tahun?: string | null;
  };
};

export default function DataPeramalan() {
  const { peramalan, produkOptions, bulanOptions, tahunOptions, filters } =
    usePage<DataPeramalanProps>().props;

  const formatPeriode = (value: string | null) => {
    if (!value) {
      return '-';
    }

    const date = new Date(`${value}-01T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
    }

    const fallbackDate = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(fallbackDate.getTime())) {
      return fallbackDate.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
    }

    return value;
  };

  const formatProduk = (value: string) => {
    const normalized = value.replaceAll('_', ' ').toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const formatBulan = (value: string) => {
    const monthNumber = Number(value);
    if (!Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return value;
    }

    const date = new Date(2000, monthNumber - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long' });
  };

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);

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

    router.get(dataperamalan().url, query, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus data?',
      text: 'Data peramalan yang dihapus tidak bisa dikembalikan.',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) {
      return;
    }

    router.delete(`/dataperamalan/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        void Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          text: 'Data peramalan berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false,
        });
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data Peramalan" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Data Peramalan
        </h1>

        <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
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
            <div className="flex flex-wrap items-center gap-2">
              <Button className="h-9">Hitung Peramalan</Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="h-9">
                    Cetak
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Masukkan hasil peramalan pada tabel, lalu cetak laporan.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-100 text-xs text-neutral-600 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                <tr>
                  <th className="px-3 py-2 text-left">No</th>
                  <th className="px-3 py-2 text-left">Periode</th>
                  <th className="px-3 py-2 text-left">Produk</th>
                  <th className="px-3 py-2 text-right">Nilai Peramalan</th>
                  <th className="px-3 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {peramalan.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-10 text-center text-sm text-neutral-400"
                    >
                      Belum ada data peramalan.
                    </td>
                  </tr>
                ) : (
                  peramalan.data.map((row, index) => (
                    <tr key={row.id} className="bg-white dark:bg-neutral-900">
                      <td className="px-3 py-2 text-neutral-700 dark:text-neutral-200">
                        {(peramalan.current_page - 1) * 10 + index + 1}
                      </td>
                      <td className="px-3 py-2 text-neutral-700 dark:text-neutral-200">
                        {formatPeriode(row.periode)}
                      </td>
                      <td className="px-3 py-2 text-neutral-700 dark:text-neutral-200">
                        {formatProduk(row.produk)}
                      </td>
                      <td className="px-3 py-2 text-right text-neutral-700 dark:text-neutral-200">
                        {formatNumber(row.nilai)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
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

          {peramalan.links.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {peramalan.links.map((link) => {
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
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-300'
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
    </AppLayout>
  );
}
