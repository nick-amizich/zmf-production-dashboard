import { createClient } from '@/lib/supabase/client'

import { logger } from '@/lib/logger'
export async function uploadQualityPhoto(
  file: File,
  checkId: string
): Promise<string | null> {
  const supabase = createClient()
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${checkId}/${Date.now()}.${fileExt}`
  const filePath = `quality-photos/${fileName}`
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('production-files')
    .upload(filePath, file)
  
  if (error) {
    logger.error('Error uploading file:', error)
    return null
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('production-files')
    .getPublicUrl(filePath)
  
  return publicUrl
}

export async function deleteQualityPhoto(url: string): Promise<boolean> {
  const supabase = createClient()
  
  // Extract file path from URL
  const urlParts = url.split('production-files/')
  if (urlParts.length < 2) return false
  
  const filePath = urlParts[1]
  
  const { error } = await supabase.storage
    .from('production-files')
    .remove([filePath])
  
  return !error
}