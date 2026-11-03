create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists transaction_pin_hash text;

alter table public.profiles
  add column if not exists transaction_pin_set boolean
  generated always as (transaction_pin_hash is not null) stored;

create or replace function public.set_transaction_pin(p_pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_pin !~ '^[0-9]{4,6}$' then
    raise exception 'Transaction PIN must contain 4 to 6 digits';
  end if;

  update public.profiles
  set transaction_pin_hash = crypt(p_pin, gen_salt('bf')),
      updated_at = now()
  where id = auth.uid();

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

create or replace function public.verify_transaction_pin(p_pin text)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and transaction_pin_hash is not null
      and transaction_pin_hash = crypt(p_pin, transaction_pin_hash)
  );
$$;

revoke all on function public.set_transaction_pin(text) from public;
grant execute on function public.set_transaction_pin(text) to authenticated;
revoke all on function public.verify_transaction_pin(text) from public;
grant execute on function public.verify_transaction_pin(text) to authenticated;

create or replace function public.transfer_funds_with_pin(
  p_from_account_id uuid,
  p_to_account_number text,
  p_amount numeric,
  p_description text,
  p_pin text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.verify_transaction_pin(p_pin) then
    raise exception 'Invalid transaction PIN';
  end if;

  perform public.transfer_funds(
    p_from_account_id,
    p_to_account_number,
    p_amount,
    p_description
  );
end;
$$;

revoke all on function public.transfer_funds_with_pin(uuid, text, numeric, text, text) from public;
grant execute on function public.transfer_funds_with_pin(uuid, text, numeric, text, text) to authenticated;
