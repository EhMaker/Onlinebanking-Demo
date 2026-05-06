import { useSnackbar } from "notistack";

/**
 * Typed wrapper around notistack's useSnackbar.
 * Provides convenient success / error / info / warning helpers.
 */
export function useToast() {
  const { enqueueSnackbar } = useSnackbar();

  return {
    success: (message: string) =>
      enqueueSnackbar(message, { variant: "success" }),
    error: (message: string) => enqueueSnackbar(message, { variant: "error" }),
    info: (message: string) => enqueueSnackbar(message, { variant: "info" }),
    warning: (message: string) =>
      enqueueSnackbar(message, { variant: "warning" }),
  };
}
