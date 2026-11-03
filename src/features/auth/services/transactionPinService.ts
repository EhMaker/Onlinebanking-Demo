import { supabase } from "@/lib/supabase";

export async function sendTransactionPinOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) throw error;
}

export async function verifyOtpAndSetTransactionPin(
  email: string,
  token: string,
  pin: string,
) {
  const { data, error: otpError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (otpError) throw otpError;

  const { error } = await supabase.rpc("set_transaction_pin", {
    p_pin: pin,
  });
  if (error) throw error;

  return data.session;
}

export async function verifyTransactionPin(pin: string) {
  const { data, error } = await supabase.rpc("verify_transaction_pin", {
    p_pin: pin,
  });
  if (error) throw error;
  return data === true;
}
