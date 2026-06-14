export type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  foto_profil_url?: string;
  email_verified_at: string | null;
  role?: 'Admin' | 'Pemilik Usaha' | 'Staff';
  two_factor_enabled?: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

export type Auth = {
  user: User;
};

export type TwoFactorSetupData = {
  svg: string;
  url: string;
};

export type TwoFactorSecretKey = {
  secretKey: string;
};
