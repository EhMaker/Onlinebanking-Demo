import { Box, Typography, Button, Paper } from "@mui/material";
import { ErrorOutlineRounded, RefreshRounded } from "@mui/icons-material";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** When true, renders without the Paper wrapper (e.g. inside another card) */
  inline?: boolean;
}

/**
 * Reusable "something went wrong" UI.
 * Used both by ErrorBoundary and by individual data-fetching components.
 */
export function ErrorState({
  title = "Failed to load",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  inline = false,
}: ErrorStateProps) {
  const inner = (
    <Box
      sx={{
        py: inline ? 4 : 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        textAlign: "center",
        px: 3,
      }}
    >
      <ErrorOutlineRounded
        sx={{ fontSize: 48, color: "error.main", opacity: 0.7 }}
      />
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshRounded />}
          onClick={onRetry}
          sx={{ mt: 1 }}
        >
          Try again
        </Button>
      )}
    </Box>
  );

  if (inline) return inner;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {inner}
    </Paper>
  );
}
