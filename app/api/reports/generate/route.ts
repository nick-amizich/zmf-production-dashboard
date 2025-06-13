import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ReportGenerator } from '@/lib/services/report-generator'

import { logger } from '@/lib/logger'
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get worker profile and check permissions
    const { data: worker } = await supabase
      .from('workers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
      
    if (!worker || (worker.role !== 'manager' && worker.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { reportType, startDate, endDate, format } = body

    // Validate inputs
    if (!reportType || !startDate || !endDate || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Initialize report generator
    const generator = new ReportGenerator(supabase)

    // Generate the report based on type
    let reportData: any
    
    switch (reportType) {
      case 'production-summary':
        reportData = await generator.generateProductionSummary(
          new Date(startDate),
          new Date(endDate)
        )
        break
        
      case 'quality-analysis':
        reportData = await generator.generateQualityAnalysis(
          new Date(startDate),
          new Date(endDate)
        )
        break
        
      case 'worker-performance':
        reportData = await generator.generateWorkerPerformance(
          new Date(startDate),
          new Date(endDate)
        )
        break
        
      case 'financial-summary':
        reportData = await generator.generateFinancialSummary(
          new Date(startDate),
          new Date(endDate)
        )
        break
        
      case 'inventory-status':
        reportData = await generator.generateInventoryStatus(
          new Date(startDate),
          new Date(endDate)
        )
        break
        
      case 'customer-orders':
        reportData = await generator.generateCustomerOrders(
          new Date(startDate),
          new Date(endDate)
        )
        break
        
      case 'stage-efficiency':
        reportData = await generator.generateStageEfficiency(
          new Date(startDate),
          new Date(endDate)
        )
        break
        
      case 'quality-trends':
        reportData = await generator.generateQualityTrends(
          new Date(startDate),
          new Date(endDate)
        )
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    // Format the report based on requested format
    let fileBuffer: Buffer
    let contentType: string
    let fileExtension: string

    switch (format) {
      case 'pdf':
        fileBuffer = await generator.formatAsPDF(reportData, reportType)
        contentType = 'application/pdf'
        fileExtension = 'pdf'
        break
        
      case 'csv':
        fileBuffer = await generator.formatAsCSV(reportData, reportType)
        contentType = 'text/csv'
        fileExtension = 'csv'
        break
        
      case 'excel':
        fileBuffer = await generator.formatAsExcel(reportData, reportType)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileExtension = 'xlsx'
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid format' },
          { status: 400 }
        )
    }

    // Create response with appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set(
      'Content-Disposition',
      `attachment; filename="${reportType}-${new Date().toISOString().split('T')[0]}.${fileExtension}"`
    )

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    })

  } catch (error) {
    logger.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}