import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dataproduk } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import ProdukFormModal from '@/pages/modal/produk-form';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Data Produk',
    href: dataproduk().url,
  },
];

export type ProdukItem = {
  id: string;
  nama: string;
  stok: number;
  stok_minimum: number;
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type ProdukPage = {
  data: ProdukItem[];
  links: PaginationLink[];
  current_page: number;
  last_page: number;
};

type DataProdukProps = {
  produk: ProdukPage;
  filters: {
    search?: string | null;
  };
  canManage: boolean;
};

export default function DataProduk() {
  const { produk, filters, canManage } = usePage<DataProdukProps>().props;
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<ProdukItem | null>(null);
  const [search, setSearch] = useState(filters.search ?? '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(dataproduk().url, { search: search || null }, { preserveState: true, replace: true });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus data?',
      text: 'Data produk yang dihapus tidak bisa dikembalikan. Data terkait penjualan, peramalan, dan stok juga mungkin akan terdampak.',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) {
      return;
    }

    router.delete(`/dataproduk/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        void Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          text: 'Data produk berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false,
        });
      },
    });
  };

  const handleEdit = (row: ProdukItem) => {
    setEditData(row);
    setShowModal(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data Produk" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Data Produk
        </h1>

        <div className="rounded-xl border border-sidebar-border/80 bg-gradient-to-br from-white via-slate-50/70 to-amber-50/40 p-4 shadow-md ring-1 ring-black/10 dark:border-sidebar-border dark:bg-gradient-to-br dark:from-neutral-950 dark:via-slate-900/70 dark:to-slate-900/80 dark:ring-white/15">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={handleSearch} className="flex flex-nowrap items-center gap-2">
              <Input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-[200px] text-xs bg-white/70 shadow-xs dark:bg-neutral-950/40"
              />
              <Button type="submit" variant="secondary" className="h-9">
                Cari
              </Button>
            </form>
            
            {canManage && (
              <Button
                className="h-9 cursor-pointer bg-sky-600 text-white shadow-sm hover:bg-sky-500 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300"
                onClick={() => {
                  setEditData(null);
                  setShowModal(true);
                }}
              >
                Tambah
              </Button>
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200/80 bg-white/70 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-950/40">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="sticky top-0 bg-slate-100/90 text-xs font-semibold text-neutral-600 uppercase backdrop-blur dark:bg-neutral-900/90 dark:text-neutral-300">
                  <tr>
                    <th className="px-3 py-2.5 text-left">No</th>
                    <th className="px-3 py-2.5 text-left">Nama Produk</th>
                    <th className="px-3 py-2.5 text-right">Stok</th>
                    <th className="px-3 py-2.5 text-right">Stok Minimum</th>
                    {canManage && <th className="px-3 py-2.5 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {produk.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={canManage ? 5 : 4}
                        className="px-3 py-10 text-center text-sm text-neutral-400"
                      >
                        Belum ada data produk.
                      </td>
                    </tr>
                  ) : (
                    produk.data.map((row, index) => (
                      <tr
                        key={row.id}
                        className="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-sky-50/60 dark:odd:bg-neutral-900 dark:even:bg-neutral-900/60 dark:hover:bg-sky-900/20"
                      >
                        <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
                          {(produk.current_page - 1) * 10 + index + 1}
                        </td>
                        <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
                          {row.nama}
                        </td>
                        <td className="px-3 py-2.5 text-right text-neutral-700 dark:text-neutral-200">
                          <span className={row.stok <= row.stok_minimum ? "text-rose-500 font-semibold" : ""}>
                            {row.stok}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-neutral-700 dark:text-neutral-200">
                          {row.stok_minimum}
                        </td>
                        {canManage && (
                          <td className="px-3 py-2.5 text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-sky-200 text-sky-600 hover:border-sky-300 hover:text-sky-700 dark:border-sky-900/50 dark:text-sky-300"
                                onClick={() => handleEdit(row)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-rose-200 text-rose-600 hover:border-rose-300 hover:text-rose-700 dark:border-rose-900/50 dark:text-rose-300"
                                onClick={() => handleDelete(row.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {produk.links.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {produk.links.map((link) => {
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
      
      {canManage && (
        <ProdukFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }}
          editData={editData}
        />
      )}
    </AppLayout>
  );
}
