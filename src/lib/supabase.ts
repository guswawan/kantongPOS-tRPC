import type { Bucket } from "@/server/bucket";
import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const uploadFileToSignedUrl = async (
  bucket: Bucket,
  token: string,
  path: string,
  file: File,
) => {
  try {
    const result = await supabaseClient.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, file);

    if (result.error) throw result.error;

    if (!result.data)
      throw new Error("No data returned from uploadToSignedUrl");

    const fileUrl = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(result.data.path).data.publicUrl;

    return fileUrl;
  } catch (error) {
    throw error;
  }
};
