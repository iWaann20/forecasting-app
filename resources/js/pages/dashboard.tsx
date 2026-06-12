import { Head, router, usePage } from '@inertiajs/react';
import { BarChart3, DollarSign } from 'lucide-react';
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

type PeramalanPerPeriodeItem = {
  periode: string;
  total: number;
};

type ProdukOption = {
  id: string;
  nama: string;
  stok: number;
  stok_minimum: number;
};

type DashboardProps = {
  totalPenjualan: number;
  totalPeramalan: number | null;
  canSeePeramalan: boolean;
  penjualanPerProduk: PenjualanPerProdukItem[];
  penjualanPerPeriode: PenjualanPerPeriodeItem[];
  penjualanPerProdukPerPeriode: PenjualanPerProdukPerPeriodeItem[];
  peramalanPerPeriode: PeramalanPerPeriodeItem[];
  peramalanPerProdukPerPeriode: PenjualanPerProdukPerPeriodeItem[];
  produkOptions: ProdukOption[];
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
    penjualanPerPeriode,
    penjualanPerProdukPerPeriode,
    peramalanPerPeriode,
    peramalanPerProdukPerPeriode,
    produkOptions,
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
      month: 'short',
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

  const peramalanChartData = (peramalanPerPeriode ?? []).map((item) => ({
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

  const peramalanProdukPerPeriodeMap = (peramalanPerProdukPerPeriode ?? []).reduce(
    (acc, item) => {
      acc[item.periode] = acc[item.periode] ?? [];
      acc[item.periode].push({ produk: item.produk, total: item.total });
      return acc;
    },
    {} as Record<string, { produk: string; total: number }[]>,
  );

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
          <div className="rounded-xl border border-neutral-300/80 bg-gradient-to-br from-white via-sky-100/70 to-amber-100/70 p-4 text-neutral-900 shadow-md ring-1 ring-black/10 dark:border-neutral-700/80 dark:bg-gradient-to-br dark:from-neutral-950 dark:via-slate-900/70 dark:to-neutral-900 dark:text-neutral-100 dark:ring-white/20">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-300">
                Total Data Penjualan
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-200/80 text-sky-800 shadow-sm dark:bg-sky-500/30 dark:text-sky-100">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-4xl leading-none font-semibold text-neutral-900 dark:text-white">
              {formatNumber(totalPenjualan)}
            </p>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Data total penjualan yang tercatat
            </p>
          </div>
          {canSeePeramalan && (
            <div className="rounded-xl border border-neutral-300/80 bg-gradient-to-br from-white via-amber-100/70 to-sky-100/70 p-4 text-neutral-900 shadow-md ring-1 ring-black/10 dark:border-neutral-700/80 dark:bg-gradient-to-br dark:from-neutral-950 dark:via-amber-900/20 dark:to-slate-900 dark:text-neutral-100 dark:ring-white/20">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-300">
                  Total Hasil Peramalan
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-200/80 text-amber-800 shadow-sm dark:bg-amber-500/30 dark:text-amber-100">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-4xl leading-none font-semibold text-neutral-900 dark:text-white">
                {formatNumber(totalPeramalan ?? 0)}
              </p>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Jumlah data peramalan yang tersimpan
              </p>
            </div>
          )}
        </div>

        <div className={`grid gap-4 ${canSeePeramalan ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="rounded-xl border border-sidebar-border/80 bg-gradient-to-br from-white via-slate-100/70 to-amber-100/50 p-4 shadow-md ring-1 ring-black/10 dark:border-sidebar-border dark:bg-gradient-to-br dark:from-neutral-950 dark:via-slate-900/70 dark:to-slate-900/80 dark:ring-white/20">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Grafik Penjualan
                </h2>
                <p className="text-xs text-neutral-400">
                  Filter:{' '}
                  {filters.produk ? produkOptions.find(p => p.id === filters.produk)?.nama ?? 'Semua Produk' : 'Semua Produk'}{' '}
                  • {filters.tahun ?? 'Semua Tahun'}
                </p>
              </div>
              <div className="flex flex-nowrap items-center gap-2">
                <Select
                  value={filters.produk ?? 'all'}
                  onValueChange={(value) =>
                    updateFilters({
                      produk: value === 'all' ? null : value,
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs">
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
                        <SelectItem key={produk.id} value={produk.id}>
                          {produk.nama}
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
                  <SelectTrigger className="h-8 w-[120px] text-xs">
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
                <div className="h-80 rounded-lg border border-neutral-300/70 bg-gradient-to-br from-white via-sky-100/50 to-amber-100/40 p-2 shadow-sm [--chart-axis:#475569] [--chart-bar-soft:#7dd3fc] [--chart-bar:#1d4ed8] [--chart-cursor:rgba(29,78,216,0.16)] [--chart-grid:#cbd5f5] dark:border-neutral-700/70 dark:bg-gradient-to-br dark:from-neutral-950 dark:via-slate-900/70 dark:to-slate-900/80 dark:[--chart-axis:#cbd5f5] dark:[--chart-bar-soft:#38bdf8] dark:[--chart-bar:#60a5fa] dark:[--chart-cursor:rgba(96,165,250,0.24)] dark:[--chart-grid:#1f2937]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 12,
                        right: 16,
                        left: 4,
                        bottom: 6,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="penjualanGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="var(--chart-bar)" />
                          <stop offset="100%" stopColor="var(--chart-bar-soft)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="var(--chart-grid)"
                        strokeDasharray="4 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                        interval="preserveStartEnd"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                        tickFormatter={formatNumber}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                      />
                      <Tooltip
                        cursor={{ fill: 'var(--chart-cursor)' }}
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
                            <div className="rounded-lg border border-neutral-200 bg-white/95 p-3 text-xs shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
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
                      <Bar
                        dataKey="total"
                        fill="url(#penjualanGradient)"
                        radius={[10, 10, 6, 6]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {canSeePeramalan && (
            <div className="rounded-xl border border-sidebar-border/80 bg-gradient-to-br from-white via-slate-100/70 to-amber-100/50 p-4 shadow-md ring-1 ring-black/10 dark:border-sidebar-border dark:bg-gradient-to-br dark:from-neutral-950 dark:via-slate-900/70 dark:to-slate-900/80 dark:ring-white/20">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Grafik Peramalan
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Menampilkan hasil peramalan
                  </p>
                </div>
              </div>

              <div className="mt-4">
                {peramalanChartData.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-400 dark:border-neutral-800">
                    Belum ada data peramalan untuk ditampilkan.
                  </div>
                ) : (
                  <div className="h-80 rounded-lg border border-neutral-300/70 bg-gradient-to-br from-white via-amber-100/50 to-sky-100/40 p-2 shadow-sm [--chart-axis:#475569] [--chart-bar-soft:#fde047] [--chart-bar:#ca8a04] [--chart-cursor:rgba(202,138,4,0.16)] [--chart-grid:#cbd5f5] dark:border-neutral-700/70 dark:bg-gradient-to-br dark:from-neutral-950 dark:via-slate-900/70 dark:to-slate-900/80 dark:[--chart-axis:#cbd5f5] dark:[--chart-bar-soft:#fde047] dark:[--chart-bar:#ca8a04] dark:[--chart-cursor:rgba(253,224,71,0.24)] dark:[--chart-grid:#1f2937]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={peramalanChartData}
                        margin={{
                          top: 12,
                          right: 16,
                          left: 4,
                          bottom: 6,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="peramalanGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="var(--chart-bar)" />
                            <stop offset="100%" stopColor="var(--chart-bar-soft)" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          stroke="var(--chart-grid)"
                          strokeDasharray="4 4"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                          interval="preserveStartEnd"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                          tickFormatter={formatNumber}
                          axisLine={false}
                          tickLine={false}
                          width={30}
                        />
                        <Tooltip
                          cursor={{ fill: 'var(--chart-cursor)' }}
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) {
                              return null;
                            }

                            const periode = payload[0]?.payload?.periode as
                              | string
                              | undefined;
                            const produkTotals = periode
                              ? (peramalanProdukPerPeriodeMap[periode] ?? [])
                              : [];
                            const total = payload[0]?.value as number | undefined;

                            return (
                              <div className="rounded-lg border border-neutral-200 bg-white/95 p-3 text-xs shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
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
                        <Bar
                          dataKey="total"
                          fill="url(#peramalanGradient)"
                          radius={[10, 10, 6, 6]}
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
