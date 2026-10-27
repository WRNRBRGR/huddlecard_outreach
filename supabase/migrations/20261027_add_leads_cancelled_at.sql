-- Pending emails can be cancelled (skipped, or the whole lead removed) without deleting the row,
-- so the contact stays blocked from re-import and the cancel can be undone.
alter table leads add column if not exists cancelled_at timestamptz;
