import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/authStore";
import { fetchUserAccount } from "@/features/banking/services/accountService";

export function useAccount() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["account", user?.id],
    queryFn: () => fetchUserAccount(user!.id),
    enabled: !!user,
    staleTime: 1000 * 30, // refresh balance every 30 s
  });
}
