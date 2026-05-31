import { Head, router, usePage } from '@inertiajs/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type PenjualanPerProdukItem = {
  produk: string;
  total: number;
};

type PenjualanPerPeriodeItem = {
  periode: string;
  total: number;
};

type PenjualanPerProdukPerPeriodeItem = {
  periode: string;
  produk: string;
  total: number;
};

type DashboardProps = {
  totalPenjualan: number;
  totalPeramalan: number | null;
  canSeePeramalan: boolean;
  penjualanPerProduk: PenjualanPerProdukItem[];
  penjualanPerPeriode: PenjualanPerPeriodeItem[];
  penjualanPerProdukPerPeriode: PenjualanPerProdukPerPeriodeItem[];
  tahunOptions: string[];
  filters: {
    produk?: string | null;
    tahun?: string | null;
  };
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },
];

export default function Dashboard() {
  const {
    totalPenjualan,
    totalPeramalan,
    canSeePeramalan,
    penjualanPerProduk,
    penjualanPerPeriode,
    penjualanPerProdukPerPeriode,
    tahunOptions,
    filters,
  } = usePage<DashboardProps>().props;
  const formatNumber = (value: number) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);

  const formatPeriode = (periode: string) => {
    const date = new Date(`${periode}-01T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return periode;
    }

    return date.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatProduk = (value: string) => {
    const normalized = value.replaceAll('_', ' ').toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const chartData = penjualanPerPeriode.map((item) => ({
    periode: item.periode,
    label: formatPeriode(item.periode),
    total: item.total,
  }));

  const produkPerPeriodeMap = penjualanPerProdukPerPeriode.reduce(
    (acc, item) => {
      acc[item.periode] = acc[item.periode] ?? [];
      acc[item.periode].push({ produk: item.produk, total: item.total });
      return acc;
    },
    {} as Record<string, { produk: string; total: number }[]>,
  );

  const produkOptions = penjualanPerProduk.map((item) => item.produk);
  const updateFilters = (next: {
    produk?: string | null;
    tahun?: string | null;
  }) => {
    const hasProduk = Object.prototype.hasOwnProperty.call(next, 'produk');
    const hasTahun = Object.prototype.hasOwnProperty.call(next, 'tahun');
    const produk = hasProduk ? (next.produk ?? null) : (filters.produk ?? null);
    const tahun = hasTahun ? (next.tahun ?? null) : (filters.tahun ?? null);
    const query: Record<string, string> = {};

    if (produk) {
      query.produk = produk;
    }

    if (tahun) {
      query.tahun = tahun;
    }

    router.get(dashboard().url, query, {
      preserveState: true,
      replace: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h1>
        <div
          className={`grid auto-rows-min gap-4 ${canSeePeramalan ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}
        >
          <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
            <p className="text-sm text-neutral-500">Total Data Penjualan</p>
            <p className="mt-2 text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
              {formatNumber(totalPenjualan)}
            </p>
            <p className="mt-2 text-xs text-neutral-400">
              Data total penjualan yang tercatat
            </p>
          </div>
          {canSeePeramalan && (
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
              <p className="text-sm text-neutral-500">Total Hasil Peramalan</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
                {formatNumber(totalPeramalan ?? 0)}
              </p>
              <p className="mt-2 text-xs text-neutral-400">
                Jumlah data peramalan yang tersimpan
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Grafik Penjualan
              </h2>
              <p className="text-xs text-neutral-400">
                Filter:{' '}
                {filters.produk ? formatProduk(filters.produk) : 'Semua Produk'}{' '}
                • {filters.tahun ?? 'Semua Tahun'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filters.produk ?? 'all'}
                onValueChange={(value) =>
                  updateFilters({
                    produk: value === 'all' ? null : value,
                  })
                }
              >
                <SelectTrigger className="h-8 min-w-[160px] text-xs">
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
                value={filters.tahun ?? 'all'}
                onValueChange={(value) =>
                  updateFilters({
                    tahun: value === 'all' ? null : value,
                  })
                }
              >
                <SelectTrigger className="h-8 min-w-[160px] text-xs">
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
          </div>

          <div className="mt-4">
            {penjualanPerPeriode.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-400 dark:border-neutral-800">
                Belum ada data penjualan untuk ditampilkan.
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatNumber}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || payload.length === 0) {
                          return null;
                        }

                        const periode = payload[0]?.payload?.periode as
                          | string
                          | undefined;
                        const produkTotals = periode
                          ? (produkPerPeriodeMap[periode] ?? [])
                          : [];
                        const total = payload[0]?.value as number | undefined;

                        return (
                          <div className="rounded-lg border border-neutral-200 bg-white p-3 text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                              Periode: {label}
                            </p>
                            <p className="mt-2 text-[11px] text-neutral-500">
                              Total semua
                            </p>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {formatNumber(total ?? 0)}
                            </p>
                            <div className="mt-2 space-y-1">
                              {produkTotals.length === 0 ? (
                                <p className="text-[11px] text-neutral-400">
                                  Belum ada data produk
                                </p>
                              ) : (
                                produkTotals.map((item) => (
                                  <div
                                    key={`${periode}-${item.produk}`}
                                    className="flex items-center justify-between gap-3"
                                  >
                                    <span className="text-[11px] text-neutral-500">
                                      {formatProduk(item.produk)}
                                    </span>
                                    <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-100">
                                      {formatNumber(item.total)}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="total" fill="#0f172a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
