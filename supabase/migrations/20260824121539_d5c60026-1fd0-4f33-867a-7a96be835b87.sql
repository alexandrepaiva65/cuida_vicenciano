REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.notificar_status() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, public;
REVOKE ALL ON FUNCTION public.is_gestor(UUID) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_gestor(UUID) TO authenticated;

CREATE POLICY "problemas_imgs_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'problemas');
CREATE POLICY "problemas_imgs_auth_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'problemas' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "problemas_imgs_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'problemas' AND (storage.foldername(name))[1] = auth.uid()::text);