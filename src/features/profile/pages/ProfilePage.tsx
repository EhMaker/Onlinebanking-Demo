import { useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  BadgeRounded,
  CakeRounded,
  EmailRounded,
  HomeRounded,
  EditRounded,
  AddRounded,
  LockRounded,
  LocalPhoneRounded,
  PublicRounded,
  SaveRounded,
  WcRounded,
} from "@mui/icons-material";
import { PageTransition } from "@/components/motion/PageTransition";
import { FadeIn } from "@/components/motion/AnimatedList";
import { useAuthStore } from "@/features/auth/store/authStore";
import { supabase } from "@/lib/supabase";
import { TransactionPinDialog } from "@/features/auth/components/TransactionPinDialog";

function metadataValue(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : "Not provided";
}

function formatDate(value: string) {
  if (value === "Not provided") return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      <Box sx={{ color: "primary.main", display: "flex", mt: 0.25 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 500, overflowWrap: "anywhere" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export function ProfilePage() {
  const {
    user,
    profile,
    avatarPreviewUrl,
    _setAuthState,
    _setProfile,
    _setAvatarPreview,
  } = useAuthStore();
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const displayName =
    profile?.full_name ??
    (typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name
      : null) ??
    user?.email ??
    "Account holder";
  const role = profile?.role ?? "user";
  const memberSince = user?.created_at
    ? formatDate(user.created_at)
    : "Not available";
  const address = [
    metadataValue(metadata, "address"),
    metadataValue(metadata, "city"),
    metadataValue(metadata, "state"),
    metadataValue(metadata, "postal_code"),
  ]
    .filter((value) => value !== "Not provided")
    .join(", ");
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const avatarUrl =
    profile?.avatar_url ??
    (typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [message, setMessage] = useState<{
    severity: "success" | "error";
    text: string;
  } | null>(null);
  const [form, setForm] = useState({
    fullName: metadataValue(metadata, "full_name") === "Not provided"
      ? displayName
      : metadataValue(metadata, "full_name"),
    phoneNumber: metadataValue(metadata, "phone_number") === "Not provided"
      ? ""
      : metadataValue(metadata, "phone_number"),
    dateOfBirth: metadataValue(metadata, "date_of_birth") === "Not provided"
      ? ""
      : metadataValue(metadata, "date_of_birth"),
    address: metadataValue(metadata, "address") === "Not provided"
      ? ""
      : metadataValue(metadata, "address"),
    city: metadataValue(metadata, "city") === "Not provided"
      ? ""
      : metadataValue(metadata, "city"),
    state: metadataValue(metadata, "state") === "Not provided"
      ? ""
      : metadataValue(metadata, "state"),
    postalCode: metadataValue(metadata, "postal_code") === "Not provided"
      ? ""
      : metadataValue(metadata, "postal_code"),
    nationality: metadataValue(metadata, "nationality") === "Not provided"
      ? ""
      : metadataValue(metadata, "nationality"),
    gender: metadataValue(metadata, "gender") === "Not provided"
      ? ""
      : metadataValue(metadata, "gender"),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayedAvatarUrl = avatarPreviewUrl ?? avatarUrl;

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    if (!user || !form.fullName.trim()) {
      setMessage({ severity: "error", text: "Full name is required." });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...metadata,
          full_name: form.fullName.trim(),
          phone_number: form.phoneNumber.trim(),
          date_of_birth: form.dateOfBirth,
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postal_code: form.postalCode.trim(),
          nationality: form.nationality.trim(),
          gender: form.gender,
        },
      });
      if (error) throw error;

      const updatedProfile = profile
        ? { ...profile, full_name: form.fullName.trim() }
        : profile;
      if (updatedProfile) _setProfile(updatedProfile);
      _setAuthState({ user: data.user, session: useAuthStore.getState().session });
      setIsEditing(false);
      setMessage({ severity: "success", text: "Personal information updated." });
    } catch (error) {
      setMessage({
        severity: "error",
        text: error instanceof Error ? error.message : "Unable to update your information.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ severity: "error", text: "Please choose an image file." });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setMessage({ severity: "error", text: "Profile pictures must be 3 MB or smaller." });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setIsUploading(true);
    setMessage(null);
    let uploadStage = "upload";
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/profile-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      uploadStage = "profile";
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const { data: authData, error: metadataError } =
        await supabase.auth.updateUser({
          data: { ...metadata, avatar_url: avatarUrl },
        });
      if (metadataError) throw metadataError;

      if (profile) {
        // Keep the immediate preview in the shared store. The persisted URL
        // remains in Supabase and is used again after the next session load.
        _setAvatarPreview(previewUrl);
        _setProfile({ ...profile, avatar_url: previewUrl });
      }
      _setAuthState({
        user: {
          ...authData.user,
          user_metadata: {
            ...authData.user.user_metadata,
            avatar_url: previewUrl,
          },
        },
        session: useAuthStore.getState().session,
      });
      setMessage({ severity: "success", text: "Profile picture updated." });
    } catch (error) {
      URL.revokeObjectURL(previewUrl);
      const errorMessage =
        error instanceof Error ? error.message : "Unable to upload your profile picture.";
      setMessage({
        severity: "error",
        text: errorMessage.toLowerCase().includes("bucket not found")
          ? 'Profile storage is not configured. Create a public Supabase Storage bucket named "avatars", then try again.'
          : errorMessage.toLowerCase().includes("row-level security")
            ? uploadStage === "upload"
              ? "Supabase blocked the image upload. Check the storage.objects INSERT policy for the avatars bucket and the user folder path."
              : "Supabase blocked the profile record update. Check the profiles UPDATE policy for the authenticated user."
            : errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <PageTransition>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <FadeIn>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              My Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Your personal and account information.
            </Typography>
          </Box>
        </FadeIn>

        <Stack spacing={3}>
          <FadeIn delay={0.05}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ position: "relative", flexShrink: 0 }}>
                    <Avatar
                      src={displayedAvatarUrl}
                      sx={{
                        width: { xs: 64, sm: 76 },
                        height: { xs: 64, sm: 76 },
                        bgcolor: "primary.main",
                        fontSize: { xs: 22, sm: 26 },
                        fontWeight: 700,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) => void handleUpload(event)}
                    />
                    <IconButton
                      aria-label="Upload picture"
                      title="Upload picture"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        position: "absolute",
                        right: -5,
                        bottom: -5,
                        width: 30,
                        height: 30,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        border: "2px solid",
                        borderColor: "background.paper",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      {isUploading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <AddRounded fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {user?.email ?? "Email not provided"}
                    </Typography>
                    <Chip
                      label={`${role.charAt(0).toUpperCase()}${role.slice(1)} account`}
                      color="primary"
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
                {message && (
                  <Alert
                    severity={message.severity}
                    onClose={() => setMessage(null)}
                    sx={{ mb: 3 }}
                  >
                    {message.text}
                  </Alert>
                )}
                {isEditing ? (
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <TextField
                      label="Full name"
                      value={form.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
                      fullWidth
                    />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Phone number"
                          value={form.phoneNumber}
                          onChange={(event) => updateField("phoneNumber", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Date of birth"
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(event) => updateField("dateOfBirth", event.target.value)}
                          slotProps={{ inputLabel: { shrink: true } }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Nationality"
                          value={form.nationality}
                          onChange={(event) => updateField("nationality", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Gender"
                          value={form.gender}
                          onChange={(event) => updateField("gender", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Address"
                          value={form.address}
                          onChange={(event) => updateField("address", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="City"
                          value={form.city}
                          onChange={(event) => updateField("city", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="State"
                          value={form.state}
                          onChange={(event) => updateField("state", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Postal code"
                          value={form.postalCode}
                          onChange={(event) => updateField("postalCode", event.target.value)}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Button onClick={() => setIsEditing(false)} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveRounded />}
                        onClick={() => void handleSave()}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving…" : "Save changes"}
                      </Button>
                    </Box>
                  </Stack>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<EditRounded />}
                    onClick={() => setIsEditing(true)}
                    sx={{ mb: 3 }}
                  >
                    Update personal information
                  </Button>
                )}
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Detail
                      icon={<EmailRounded fontSize="small" />}
                      label="Email address"
                      value={user?.email ?? "Not provided"}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Detail
                      icon={<BadgeRounded fontSize="small" />}
                      label="Account status"
                      value={user?.email_confirmed_at ? "Verified" : "Pending verification"}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Detail
                      icon={<BadgeRounded fontSize="small" />}
                      label="Member since"
                      value={memberSince}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                  Personal information
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Detail
                      icon={<LocalPhoneRounded fontSize="small" />}
                      label="Phone number"
                      value={metadataValue(metadata, "phone_number")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Detail
                      icon={<CakeRounded fontSize="small" />}
                      label="Date of birth"
                      value={formatDate(metadataValue(metadata, "date_of_birth"))}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Detail
                      icon={<PublicRounded fontSize="small" />}
                      label="Nationality"
                      value={metadataValue(metadata, "nationality")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Detail
                      icon={<WcRounded fontSize="small" />}
                      label="Gender"
                      value={metadataValue(metadata, "gender")
                        .replaceAll("_", " ")
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                  Residential address
                </Typography>
                <Detail
                  icon={<HomeRounded fontSize="small" />}
                  label="Address"
                  value={address || "Not provided"}
                />
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Transaction security
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Use a transaction PIN to protect money transfers. Email
                  verification is required when setting or changing it.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<LockRounded />}
                  onClick={() => setPinDialogOpen(true)}
                >
                  {profile?.transaction_pin_set
                    ? "Change transaction PIN"
                    : "Set transaction PIN"}
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        </Stack>
      </Box>
      {user?.email && (
        <TransactionPinDialog
          open={pinDialogOpen}
          email={user.email}
          isChange={profile?.transaction_pin_set ?? false}
          onClose={() => setPinDialogOpen(false)}
          onComplete={() => {
            setPinDialogOpen(false);
            if (profile) {
              _setProfile({ ...profile, transaction_pin_set: true });
            }
            setMessage({
              severity: "success",
              text: "Transaction PIN saved successfully.",
            });
          }}
        />
      )}
    </PageTransition>
  );
}
