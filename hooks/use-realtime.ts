'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

interface UseRealtimeOptions {
  table: string
  event?: RealtimeEvent | '*'
  filter?: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  onChange?: (payload: RealtimePostgresChangesPayload<any>) => void
}

export function useRealtime({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = createClient()
    
    // Create a unique channel name
    const channelName = `realtime:${table}:${event}:${filter || 'all'}`
    
    // Set up the subscription
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          logger.debug(`Realtime event on ${table}`, { event: payload.eventType, payload })
          
          // Call the general onChange handler if provided
          if (onChange) {
            onChange(payload)
          }
          
          // Call specific event handlers
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(payload.new)
              break
            case 'UPDATE':
              if (onUpdate) onUpdate(payload.new)
              break
            case 'DELETE':
              if (onDelete) onDelete(payload.old)
              break
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.debug(`Subscribed to realtime changes on ${table}`)
        } else if (status === 'CHANNEL_ERROR') {
          logger.error(`Failed to subscribe to ${table}`)
        }
      })
    
    channelRef.current = channel
    
    // Cleanup function
    return () => {
      if (channelRef.current) {
        logger.debug(`Unsubscribing from realtime changes on ${table}`)
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, event, filter, onChange, onInsert, onUpdate, onDelete])
  
  return channelRef.current
}

// Hook for multiple table subscriptions
interface UseMultiRealtimeOptions {
  subscriptions: Array<{
    table: string
    event?: RealtimeEvent | '*'
    filter?: string
  }>
  onChange: (table: string, payload: RealtimePostgresChangesPayload<any>) => void
}

export function useMultiRealtime({ subscriptions, onChange }: UseMultiRealtimeOptions) {
  const channelsRef = useRef<RealtimeChannel[]>([])

  useEffect(() => {
    const supabase = createClient()
    const channels: RealtimeChannel[] = []
    
    // Create subscriptions for each table
    subscriptions.forEach(({ table, event = '*', filter }, index) => {
      const channelName = `multi-realtime:${table}:${event}:${filter || 'all'}:${index}`
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table,
            filter
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            logger.debug(`Multi-realtime event on ${table}`, { event: payload.eventType, payload })
            onChange(table, payload)
          }
        )
        .subscribe()
      
      channels.push(channel)
    })
    
    channelsRef.current = channels
    
    // Cleanup function
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
      channelsRef.current = []
    }
  }, [subscriptions, onChange])
  
  return channelsRef.current
}