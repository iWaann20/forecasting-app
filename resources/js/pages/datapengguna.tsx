import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import PenggunaFormModal, { type PenggunaItem } from '@/pages/modal/pengguna-form';
import { datapengguna } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Data Pengguna',
    href: datapengguna().url,
  },
];

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PenggunaPage = {
  data: PenggunaItem[];
  links: PaginationLink[];
  current_page: number;
  last_page: number;
};

type DataPenggunaProps = {
  pengguna: PenggunaPage;
  filters: {
    role?: string | null;
  };
  errors?: Record<string, string>;
};

export default function DataPengguna() {
  const { pengguna, filters } = usePage<DataPenggunaProps>().props;
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<PenggunaItem | null>(null);
  const getInitials = useInitials();

  const handleFilterRole = (role: string) => {
    router.get(
      datapengguna().url,
      { role: role === 'Semua' ? null : role },
      { preserveState: true, replace: true }
    );
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus akun?',
      text: 'Akun yang dihapus tidak bisa dikembalikan.',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) {
      return;
    }

    router.delete(`/datapengguna/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        void Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          text: 'Akun berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      onError: (errors) => {
        if (errors.message) {
          void Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: errors.message,
          });
        }
      }
    });
  };

  const handleEdit = (row: PenggunaItem) => {
    setEditData(row);
    setShowModal(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data Pengguna" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Data Pengguna
        </h1>

        <div className="rounded-xl border border-sidebar-border/80 bg-gradient-to-br from-white via-slate-50/70 to-amber-50/40 p-4 shadow-md ring-1 ring-black/10 dark:border-sidebar-border dark:bg-gradient-to-br dark:from-neutral-950 dark:via-slate-900/70 dark:to-slate-900/80 dark:ring-white/15">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-nowrap items-center gap-2">
              <Select value={filters.role ?? 'Semua'} onValueChange={handleFilterRole}>
                <SelectTrigger className="w-[180px] bg-white/70 shadow-xs dark:bg-neutral-950/40 h-9">
                  <SelectValue placeholder="Filter Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Role</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Pemilik Usaha">Pemilik Usaha</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              className="h-9 cursor-pointer bg-sky-600 text-white shadow-sm hover:bg-sky-500 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300"
              onClick={() => {
                setEditData(null);
                setShowModal(true);
              }}
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
                    <th className="px-3 py-2.5 text-left">Pengguna</th>
                    <th className="px-3 py-2.5 text-left">Role</th>
                    <th className="px-3 py-2.5 text-left">Terdaftar Pada</th>
                    <th className="px-3 py-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {pengguna.data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-10 text-center text-sm text-neutral-400">
                        Belum ada data pengguna.
                      </td>
                    </tr>
                  ) : (
                    pengguna.data.map((row, index) => (
                      <tr
                        key={row.id}
                        className="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-sky-50/60 dark:odd:bg-neutral-900 dark:even:bg-neutral-900/60 dark:hover:bg-sky-900/20"
                      >
                        <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
                          {(pengguna.current_page - 1) * 10 + index + 1}
                        </td>
                        <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-800">
                              <AvatarImage src={row.foto_profil_url} alt={row.username} className="object-cover" />
                              <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(row.username)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {row.username}
                              {row.is_current_user && (
                                <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                  Anda
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            row.role === 'Admin' ? 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-400 dark:ring-purple-900/50' :
                            row.role === 'Pemilik Usaha' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-900/50' :
                            'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-900/50'
                          }`}>
                            {row.role}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
                          {row.created_at}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-sky-200 text-sky-600 hover:border-sky-300 hover:text-sky-700 disabled:opacity-50 dark:border-sky-900/50 dark:text-sky-300"
                              onClick={() => handleEdit(row)}
                              disabled={row.is_current_user}
                              title={row.is_current_user ? "Tidak bisa mengubah role sendiri" : "Edit Role"}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-rose-200 text-rose-600 hover:border-rose-300 hover:text-rose-700 disabled:opacity-50 dark:border-rose-900/50 dark:text-rose-300"
                              onClick={() => handleDelete(row.id)}
                              disabled={row.is_current_user}
                              title={row.is_current_user ? "Tidak bisa menghapus akun sendiri" : "Hapus Akun"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pengguna.links.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {pengguna.links.map((link) => {
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
      
      <PenggunaFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditData(null);
        }}
        editData={editData}
      />
    </AppLayout>
  );
}
