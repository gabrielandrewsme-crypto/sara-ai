import { useAuth } from '@/contexts/AuthContext';

export const useAdmin = () => {
  const { isAdmin, role, isLoading } = useAuth();

  return {
    isAdmin,
    role,
    isLoading,
  };
};
