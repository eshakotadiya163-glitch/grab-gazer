
-- Users may upload into their own folder: payment-proofs/{auth.uid()}/...
CREATE POLICY "Users upload own payment proofs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own payment proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins view all payment proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));
