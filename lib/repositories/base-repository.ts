import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export abstract class BaseRepository<T> {
  constructor(protected supabase: SupabaseClient<Database>) {}

  abstract findById(id: string): Promise<T | null>
  abstract findAll(): Promise<T[]>
  abstract create(data: Partial<T>): Promise<T>
  abstract update(id: string, data: Partial<T>): Promise<T>
  abstract delete(id: string): Promise<void>
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}