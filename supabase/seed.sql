-- Re-generate slots for next 30 days (safe to run multiple times)
SELECT generate_slots(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');
