import { Transition } from '@headlessui/react';
import { router, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import Swal from 'sweetalert2';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import photo from '@/routes/profile/photo';
import { update as updateUsername } from '@/routes/profile/username';
import { update as updatePassword } from '@/routes/user-password';
import type { User } from '@/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
};

export function UserProfileModal({ isOpen, onClose, user }: Props) {
  const initials = useInitials();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const currentPasswordInput = useRef<HTMLInputElement>(null);
  const usernameInput = useRef<HTMLInputElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user.avatar ?? user.foto_profil_url ?? null,
  );
  const [photoRemoved, setPhotoRemoved] = useState<boolean>(false);
  const [photoProcessing, setPhotoProcessing] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(
    (user.username as string | undefined) ?? (user.name as string),
  );
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const displayName =
    (user.username as string | undefined) ?? (user.name as string);
  const canRemovePhoto = !photoRemoved && Boolean(photoPreview ?? avatarUrl);
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    setAvatarUrl(user.avatar ?? user.foto_profil_url ?? null);
  }, [user.avatar, user.foto_profil_url]);

  const getCsrfToken = () => {
    const metaToken = document.querySelector<HTMLMetaElement>(
      'meta[name="csrf-token"]',
    )?.content;
    if (metaToken) {
      return metaToken;
    }

    const xsrfCookie = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='));
    if (!xsrfCookie) {
      return '';
    }

    const [, value] = xsrfCookie.split('=');
    return decodeURIComponent(value ?? '');
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setPhotoPreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return nextPreview;
    });
    setPhotoRemoved(false);

    void uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    setPhotoProcessing(true);
    setPhotoError(null);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch(photo.update().url, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': getCsrfToken(),
          Accept: 'application/json',
        },
        body: formData,
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const payload = (await response.json()) as {
          message?: string;
          errors?: Record<string, string[]>;
        };
        setPhotoError(
          payload.errors?.photo?.[0] ??
            payload.message ??
            'Gagal mengunggah foto.',
        );
        return;
      }

      const payload = (await response.json()) as {
        foto_profil_url?: string;
      };

      if (payload.foto_profil_url) {
        setPhotoPreview(payload.foto_profil_url);
        setAvatarUrl(payload.foto_profil_url);
        setPhotoRemoved(false);
      }

      router.reload({ only: ['auth'] });
      void Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Foto profil berhasil diperbarui.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      setPhotoError('Gagal mengunggah foto.');
    } finally {
      setPhotoProcessing(false);
    }
  };

  const handleRemovePhoto = () => {
    void deletePhoto();
  };

  const deletePhoto = async () => {
    setPhotoProcessing(true);
    setPhotoError(null);

    try {
      const response = await fetch(photo.delete().url, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': getCsrfToken(),
          Accept: 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const payload = (await response.json()) as {
          message?: string;
        };
        setPhotoError(payload.message ?? 'Gagal menghapus foto.');
        return;
      }

      setPhotoPreview((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
      setAvatarUrl(null);
      setPhotoRemoved(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      router.reload({ only: ['auth'] });
      void Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Foto profil berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      setPhotoError('Gagal menghapus foto.');
    } finally {
      setPhotoProcessing(false);
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUsernameError(null);
    setSaveSuccess(false);

    const trimmedUsername = username.trim();
    const usernameChanged = trimmedUsername !== displayName;
    const hasPasswordChange =
      Boolean(passwordForm.data.current_password) ||
      Boolean(passwordForm.data.password) ||
      Boolean(passwordForm.data.password_confirmation);

    if (usernameChanged) {
      try {
        const response = await fetch(updateUsername().url, {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ username: trimmedUsername }),
          credentials: 'same-origin',
        });

        if (!response.ok) {
          const payload = (await response.json()) as {
            errors?: Record<string, string[]>;
            message?: string;
          };
          setUsernameError(
            payload.errors?.username?.[0] ??
              payload.message ??
              'Gagal memperbarui username.',
          );
          usernameInput.current?.focus();
          return;
        }

        router.reload({ only: ['auth'] });
      } catch {
        setUsernameError('Gagal memperbarui username.');
        usernameInput.current?.focus();
        return;
      }
    }

    if (hasPasswordChange) {
      passwordForm.put(updatePassword().url, {
        preserveScroll: true,
        onSuccess: () => {
          passwordForm.reset();
          setSaveSuccess(true);
          window.setTimeout(() => setSaveSuccess(false), 1500);
          router.reload({ only: ['auth'] });
          void Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Perubahan berhasil disimpan.',
            timer: 1500,
            showConfirmButton: false,
          });
          onClose();
        },
        onError: (errors) => {
          if (errors.password) {
            passwordInput.current?.focus();
          }

          if (errors.current_password) {
            currentPasswordInput.current?.focus();
          }
        },
      });
      return;
    }

    if (usernameChanged) {
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 1500);
      void Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Username berhasil diperbarui.',
        timer: 1500,
        showConfirmButton: false,
      });
      onClose();
      return;
    }

    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setPhotoPreview((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
      setPhotoRemoved(false);
      setPhotoError(null);
      setAvatarUrl(user.avatar ?? user.foto_profil_url ?? null);
      setUsername(displayName);
      setUsernameError(null);
      passwordForm.reset();
      return;
    }

    setPhotoPreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden bg-neutral-300/80 p-0 sm:max-w-sm dark:bg-neutral-800">
        <div className="px-5 py-4">
          <DialogHeader className="text-left">
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription className="sr-only">
              Update your profile photo, username, and password.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 rounded-full">
                <AvatarImage
                  src={
                    photoPreview ??
                    (photoRemoved ? undefined : (avatarUrl ?? undefined))
                  }
                  alt={displayName}
                />
                <AvatarFallback className="rounded-full bg-neutral-400 text-xl text-neutral-900 dark:bg-neutral-700 dark:text-white">
                  {initials(displayName)}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoProcessing}
                >
                  Upload Foto
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemovePhoto}
                  disabled={!canRemovePhoto || photoProcessing}
                >
                  Hapus Foto
                </Button>
              </div>
              {photoError && (
                <InputError className="mt-2" message={photoError} />
              )}
            </div>

            <form
              className="rounded-lg bg-white/70 p-4 shadow-sm dark:bg-neutral-900/50"
              onSubmit={handleSave}
            >
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  ref={usernameInput}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                />
                <InputError message={usernameError ?? undefined} />
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="current_password">Password saat ini</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      ref={currentPasswordInput}
                      name="current_password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Password saat ini"
                      className="pr-10"
                      value={passwordForm.data.current_password}
                      onChange={(event) =>
                        passwordForm.setData(
                          'current_password',
                          event.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-700"
                      onClick={() =>
                        setShowCurrentPassword((current) => !current)
                      }
                      aria-label={
                        showCurrentPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <InputError message={passwordForm.errors.current_password} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password baru</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      ref={passwordInput}
                      name="password"
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Password baru"
                      className="pr-10"
                      value={passwordForm.data.password}
                      onChange={(event) =>
                        passwordForm.setData('password', event.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-700"
                      onClick={() => setShowNewPassword((current) => !current)}
                      aria-label={
                        showNewPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <InputError message={passwordForm.errors.password} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password_confirmation">
                    Konfirmasi password baru
                  </Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Konfirmasi password baru"
                      className="pr-10"
                      value={passwordForm.data.password_confirmation}
                      onChange={(event) =>
                        passwordForm.setData(
                          'password_confirmation',
                          event.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-700"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <InputError
                    message={passwordForm.errors.password_confirmation}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3">
                <Transition
                  show={saveSuccess || passwordForm.recentlySuccessful}
                  enter="transition ease-in-out"
                  enterFrom="opacity-0"
                  leave="transition ease-in-out"
                  leaveTo="opacity-0"
                >
                  <p className="text-sm text-neutral-600">Saved</p>
                </Transition>
                <Button
                  type="submit"
                  disabled={passwordForm.processing || photoProcessing}
                >
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
