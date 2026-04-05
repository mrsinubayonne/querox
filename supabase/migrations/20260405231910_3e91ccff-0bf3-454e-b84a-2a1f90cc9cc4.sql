
-- Delete duplicate transactions, keeping only the most recent one per title+amount+date+user
DELETE FROM transactions
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, title, amount, date) id
  FROM transactions
  ORDER BY user_id, title, amount, date, created_at DESC
);
