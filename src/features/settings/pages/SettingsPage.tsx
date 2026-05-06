import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Switch,
  Divider,
  Button,
  TextField,
  Stack,
  Alert,
} from "@mui/material";
import {
  PersonRounded,
  PaletteRounded,
  NotificationsRounded,
  LockRounded,
  DarkModeRounded,
  LightModeRounded,
  SaveRounded,
  KeyRounded,
} from "@mui/icons-material";
import { PageTransition } from "@/components/motion/PageTransition";
import { FadeIn } from "@/components/motion/AnimatedList";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6">{title}</Typography>
    </Box>
  );
}

export function SettingsPage() {
  const { user, profile } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const toast = useToast();

  const displayName =
    profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? "";
  const email = user?.email ?? "";
  const role = profile?.role ?? "user";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [nameValue, setNameValue] = useState(displayName);
  const [savingName, setSavingName] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    transfers: true,
    security: true,
  });

  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSaveName() {
    if (!nameValue.trim() || nameValue.trim() === displayName) return;
    setSavingName(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: nameValue.trim() })
        .eq("id", user?.id ?? "");
      if (error) throw error;
      toast.success("Display name updated");
    } catch {
      toast.error("Failed to update display name");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword() {
    if (!email) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setResetSent(true);
      toast.success("Password reset email sent");
    } catch {
      toast.error("Failed to send reset email");
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <PageTransition>
      <Box sx={{ maxWidth: 720 }}>
        {/* Header */}
        <FadeIn>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage your profile, appearance and preferences.
            </Typography>
          </Box>
        </FadeIn>

        <Stack spacing={3}>
          {/* Profile */}
          <FadeIn delay={0.05}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <SectionHeader icon={<PersonRounded />} title="Profile" />

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "primary.main",
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {email}
                    </Typography>
                    <Chip
                      label={role.charAt(0).toUpperCase() + role.slice(1)}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                  <TextField
                    label="Display name"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<SaveRounded />}
                    onClick={handleSaveName}
                    disabled={
                      savingName ||
                      !nameValue.trim() ||
                      nameValue.trim() === displayName
                    }
                    sx={{ whiteSpace: "nowrap", py: "9px" }}
                  >
                    {savingName ? "Saving…" : "Save"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Appearance */}
          <FadeIn delay={0.1}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <SectionHeader icon={<PaletteRounded />} title="Appearance" />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "action.hover",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: mode === "dark" ? "#1C2030" : "#F3F6FB",
                        border: "1.5px solid",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "text.secondary",
                      }}
                    >
                      {mode === "dark" ? (
                        <DarkModeRounded fontSize="small" />
                      ) : (
                        <LightModeRounded fontSize="small" />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {mode === "dark" ? "Dark mode" : "Light mode"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {mode === "dark"
                          ? "Easy on the eyes at night"
                          : "Bright and clear interface"}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={mode === "dark"}
                    onChange={toggleMode}
                    color="primary"
                    slotProps={{ input: { "aria-label": "toggle dark mode" } }}
                  />
                </Box>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Notifications */}
          <FadeIn delay={0.15}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <SectionHeader
                  icon={<NotificationsRounded />}
                  title="Notifications"
                />

                <Stack spacing={0}>
                  {(
                    [
                      {
                        key: "email",
                        label: "Email notifications",
                        desc: "Receive account updates via email",
                      },
                      {
                        key: "push",
                        label: "Push alerts",
                        desc: "In-app real-time alerts",
                      },
                      {
                        key: "transfers",
                        label: "Transfer alerts",
                        desc: "Notify on every transfer",
                      },
                      {
                        key: "security",
                        label: "Security alerts",
                        desc: "Login and suspicious activity alerts",
                      },
                    ] as const
                  ).map((item, idx, arr) => (
                    <Box key={item.key}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          py: 1.5,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.desc}
                          </Typography>
                        </Box>
                        <Switch
                          checked={notifications[item.key]}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                          color="primary"
                          size="small"
                        />
                      </Box>
                      {idx < arr.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Security */}
          <FadeIn delay={0.2}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <SectionHeader icon={<LockRounded />} title="Security" />

                {resetSent && (
                  <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                    A password reset link has been sent to{" "}
                    <strong>{email}</strong>.
                  </Alert>
                )}

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="outlined"
                    startIcon={<KeyRounded />}
                    onClick={handleChangePassword}
                    disabled={sendingReset || resetSent}
                  >
                    {sendingReset ? "Sending…" : "Change password"}
                  </Button>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button variant="outlined" disabled>
                      Enable 2FA
                    </Button>
                    <Chip
                      label="Coming soon"
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </FadeIn>
        </Stack>
      </Box>
    </PageTransition>
  );
}
