import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, Save } from 'lucide-react';
import type { FormEvent} from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

export type PenggunaItem = {
  id: string;
  username: string;
  role: 'Admin' | 'Pemilik Usaha' | 'Staff';
  foto_profil_url?: string;
  created_at: string;
  is_current_user: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editData: PenggunaItem | null;
};

export default function PenggunaFormModal({ isOpen, onClose, editData }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const isEdit = !!editData;

  const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
    username: '',
    password: '',
    role: 'Staff' as 'Admin' | 'Pemilik Usaha' | 'Staff',
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setData({
          username: editData.username,
          password: '',
          role: editData.role,
        });
      } else {
        reset();
      }
      clearErrors();
    }
  }, [isOpen, editData, clearErrors, setData, reset]);

  const submit = (e: FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      patch(`/datapengguna/${editData.id}/role`, {
        onSuccess: () => onClose(),
      });
    } else {
      post('/datapengguna', {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Role Pengguna' : 'Tambah Pengguna'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Anda hanya dapat mengubah role pengguna yang sudah ada.'
              : 'Tambahkan akun pengguna baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-left">
              Username
            </Label>
            <Input
              id="username"
              value={data.username}
              onChange={(e) => setData('username', e.target.value)}
              disabled={isEdit}
              className="col-span-3"
            />
            {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
          </div>

          {!isEdit && (
            <div className="grid gap-2 relative">
              <Label htmlFor="password" className="text-left">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="role" className="text-left">
              Role
            </Label>
            <Select value={data.role} onValueChange={(value) => setData('role', value as 'Admin' | 'Pemilik Usaha' | 'Staff')}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Pemilik Usaha">Pemilik Usaha</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={processing}
            >
              Batal
            </Button>
            <Button type="submit" disabled={processing} className="bg-sky-600 hover:bg-sky-700 text-white">
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
