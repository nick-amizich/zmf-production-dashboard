import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'
import puppeteer from 'puppeteer'

export class ReportGenerator {
  constructor(private supabase: SupabaseClient<Database>) {}

  // Production Summary Report
  async generateProductionSummary(startDate: Date, endDate: Date) {
    const { data: orders } = await this.supabase
      .from('orders')
      .select(`
        *,
        batch:batches(*)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const { data: stageAssignments } = await this.supabase
      .from('stage_assignments')
      .select(`
        *,
        worker:workers(name),
        order:orders(order_number, customer_name)
      `)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())

    // Calculate metrics
    const totalOrders = orders?.length || 0
    const completedOrders = orders?.filter(o => o.status === 'shipped').length || 0
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
    
    const ordersByStatus = orders?.reduce((acc, order) => {
      if (order.status) {
        acc[order.status] = (acc[order.status] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    const avgProductionTime = stageAssignments
      ?.filter(sa => sa.completed_at && sa.started_at)
      .reduce((acc, sa) => {
        const duration = new Date(sa.completed_at!).getTime() - new Date(sa.started_at!).getTime()
        return acc + duration
      }, 0) || 0

    const stageEfficiency = stageAssignments?.reduce((acc, sa) => {
      if (!acc[sa.stage]) {
        acc[sa.stage] = { count: 0, totalTime: 0, avgTime: 0 }
      }
      acc[sa.stage].count++
      if (sa.completed_at && sa.started_at) {
        const duration = new Date(sa.completed_at).getTime() - new Date(sa.started_at).getTime()
        acc[sa.stage].totalTime += duration
      }
      return acc
    }, {} as Record<string, any>) || {}

    Object.keys(stageEfficiency).forEach(stage => {
      stageEfficiency[stage].avgTime = stageEfficiency[stage].totalTime / stageEfficiency[stage].count / 1000 / 60 // minutes
    })

    return {
      metadata: {
        reportType: 'Production Summary',
        generatedAt: new Date(),
        period: { startDate, endDate }
      },
      summary: {
        totalOrders,
        completedOrders,
        completionRate,
        avgProductionTime: avgProductionTime / (stageAssignments?.length || 1) / 1000 / 60 / 60 // hours
      },
      ordersByStatus,
      stageEfficiency,
      details: orders
    }
  }

  // Quality Analysis Report
  async generateQualityAnalysis(startDate: Date, endDate: Date) {
    const { data: qualityChecks } = await this.supabase
      .from('quality_checks')
      .select(`
        *,
        worker:workers(name),
        order:orders(order_number)
      `)
      .gte('checked_at', startDate.toISOString())
      .lte('checked_at', endDate.toISOString())

    const { data: issues } = await this.supabase
      .from('issues')
      .select(`
        *,
        reported_by:workers!issues_reported_by_fkey(name),
        assigned_to:workers!issues_assigned_to_fkey(name),
        order:orders(order_number)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Calculate metrics
    const totalChecks = qualityChecks?.length || 0
    const passedChecks = qualityChecks?.filter(qc => qc.overall_status === 'good').length || 0
    const passRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0

    const issuesByCategory = issues?.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const issuesBySeverity = issues?.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const passRateByStage = qualityChecks?.reduce((acc, check) => {
      if (!acc[check.stage]) {
        acc[check.stage] = { total: 0, passed: 0, rate: 0 }
      }
      acc[check.stage].total++
      if (check.overall_status === 'good') acc[check.stage].passed++
      return acc
    }, {} as Record<string, any>) || {}

    Object.keys(passRateByStage).forEach(stage => {
      passRateByStage[stage].rate = (passRateByStage[stage].passed / passRateByStage[stage].total) * 100
    })

    return {
      metadata: {
        reportType: 'Quality Analysis',
        generatedAt: new Date(),
        period: { startDate, endDate }
      },
      summary: {
        totalChecks,
        passedChecks,
        failedChecks: totalChecks - passedChecks,
        passRate,
        totalIssues: issues?.length || 0,
        resolvedIssues: issues?.filter(i => i.resolved_at).length || 0
      },
      passRateByStage,
      issuesByCategory,
      issuesBySeverity,
      details: {
        qualityChecks,
        issues
      }
    }
  }

  // Worker Performance Report
  async generateWorkerPerformance(startDate: Date, endDate: Date) {
    const { data: workers } = await this.supabase
      .from('workers')
      .select(`
        *,
        stage_assignments:stage_assignments(
          *,
          order:orders(order_number)
        ),
        quality_checks:quality_checks(*),
        production_metrics(*)
      `)
      .eq('stage_assignments.completed_at', 'not.null')
      .gte('stage_assignments.started_at', startDate.toISOString())
      .lte('stage_assignments.started_at', endDate.toISOString())

    // Calculate performance metrics for each worker
    const workerMetrics = workers?.map(worker => {
      const assignments = worker.stage_assignments || []
      const qualityChecks = worker.quality_checks || []
      const metrics = worker.production_metrics || []

      const totalAssignments = assignments.length
      const completedAssignments = assignments.filter((a: any) => a.completed_at).length
      const avgCompletionTime = assignments
        .filter((a: any) => a.completed_at)
        .reduce((acc: number, a: any) => {
          const duration = new Date(a.completed_at).getTime() - new Date(a.started_at).getTime()
          return acc + duration
        }, 0) / (completedAssignments || 1) / 1000 / 60 // minutes

      const totalQualityChecks = qualityChecks.length
      const passedChecks = qualityChecks.filter((qc: any) => qc.overall_status === 'good').length
      const qualityScore = totalQualityChecks > 0 ? (passedChecks / totalQualityChecks) * 100 : 100

      const latestMetrics = metrics.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0] || {}

      return {
        worker: {
          id: worker.id,
          name: worker.name,
          role: worker.role,
          specializations: worker.specializations
        },
        performance: {
          totalAssignments,
          completedAssignments,
          completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0,
          avgCompletionTime,
          qualityScore,
          efficiency: latestMetrics.quality_pass_rate || 0,
          units: latestMetrics.units_completed || 0
        }
      }
    }) || []

    // Sort by overall performance
    workerMetrics.sort((a, b) => {
      const scoreA = (a.performance.completionRate + a.performance.qualityScore) / 2
      const scoreB = (b.performance.completionRate + b.performance.qualityScore) / 2
      return scoreB - scoreA
    })

    return {
      metadata: {
        reportType: 'Worker Performance',
        generatedAt: new Date(),
        period: { startDate, endDate }
      },
      summary: {
        totalWorkers: workers?.length || 0,
        avgCompletionRate: workerMetrics.reduce((acc, w) => acc + w.performance.completionRate, 0) / (workerMetrics.length || 1),
        avgQualityScore: workerMetrics.reduce((acc, w) => acc + w.performance.qualityScore, 0) / (workerMetrics.length || 1)
      },
      topPerformers: workerMetrics.slice(0, 10),
      details: workerMetrics
    }
  }

  // Financial Summary Report
  async generateFinancialSummary(startDate: Date, endDate: Date) {
    const { data: orders } = await this.supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Calculate revenue metrics (placeholder - no price data in orders)
    const totalRevenue = 0
    const completedRevenue = 0
    
    const revenueByModel = {} as Record<string, number>

    const revenueByMonth = orders?.reduce((acc, order) => {
      if (order.created_at) {
        const month = format(new Date(order.created_at), 'yyyy-MM')
        if (!acc[month]) {
          acc[month] = { revenue: 0, orders: 0 }
        }
        acc[month].revenue += 0 // Placeholder - no price data
        acc[month].orders++
      }
      return acc
    }, {} as Record<string, any>) || {}

    const avgOrderValue = totalRevenue / (orders?.length || 1)

    const customerMetrics = orders?.reduce((acc, order) => {
      if (order.customer_id) {
        if (!acc[order.customer_id]) {
          acc[order.customer_id] = {
            customerId: order.customer_id,
            orders: 0,
            revenue: 0
          }
        }
        acc[order.customer_id].orders++
        acc[order.customer_id].revenue += 0 // Placeholder - no price data
      }
      return acc
    }, {} as Record<string, any>) || {}

    const topCustomers = Object.values(customerMetrics)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10)

    return {
      metadata: {
        reportType: 'Financial Summary',
        generatedAt: new Date(),
        period: { startDate, endDate }
      },
      summary: {
        totalRevenue,
        completedRevenue,
        pendingRevenue: totalRevenue - completedRevenue,
        avgOrderValue,
        totalOrders: orders?.length || 0
      },
      revenueByModel,
      revenueByMonth,
      topCustomers,
      details: orders
    }
  }

  // Inventory Status Report
  async generateInventoryStatus(startDate: Date, endDate: Date) {
    // Note: This assumes you have an inventory table. If not, we'll use order data
    const { data: orders } = await this.supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Calculate inventory metrics based on orders
    const modelUsage = orders?.reduce((acc, order) => {
      if (order.model_id) {
        if (!acc[order.model_id]) {
          acc[order.model_id] = {
            modelId: order.model_id,
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0
          }
        }
        acc[order.model_id].totalOrders++
        if (order.status === 'shipped') {
          acc[order.model_id].completedOrders++
        } else {
          acc[order.model_id].pendingOrders++
        }
      }
      return acc
    }, {} as Record<string, any>) || {}

    return {
      metadata: {
        reportType: 'Inventory Status',
        generatedAt: new Date(),
        period: { startDate, endDate }
      },
      summary: {
        totalModels: Object.keys(modelUsage).length,
        totalOrders: orders?.length || 0,
        pendingProduction: orders?.filter(o => o.status !== 'shipped').length || 0
      },
      modelUsage: Object.values(modelUsage),
      details: orders
    }
  }

  // Customer Orders Report
  async generateCustomerOrders(startDate: Date, endDate: Date) {
    const { data: orders } = await this.supabase
      .from('orders')
      .select(`
        *,
        batch:batches(*),
        stage_assignments:stage_assignments(
          *,
          worker:workers(name)
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    // Group by customer
    const customerOrders = orders?.reduce((acc, order) => {
      if (order.customer_id) {
        if (!acc[order.customer_id]) {
          acc[order.customer_id] = {
            customerId: order.customer_id,
            orders: [],
            summary: {
              totalOrders: 0,
              totalRevenue: 0,
              avgOrderValue: 0,
              models: new Set()
            }
          }
        }
        
        acc[order.customer_id].orders.push(order)
        acc[order.customer_id].summary.totalOrders++
        acc[order.customer_id].summary.totalRevenue += 0 // No price data
        if (order.model_id) {
          acc[order.customer_id].summary.models.add(order.model_id)
        }
      }
      return acc
    }, {} as Record<string, any>) || {}

    // Calculate averages and convert sets to arrays
    Object.values(customerOrders).forEach((customer: any) => {
      customer.summary.avgOrderValue = customer.summary.totalRevenue / customer.summary.totalOrders
      customer.summary.models = Array.from(customer.summary.models)
    })

    return {
      metadata: {
        reportType: 'Customer Orders',
        generatedAt: new Date(),
        period: { startDate, endDate }
      },
      summary: {
        totalCustomers: Object.keys(customerOrders).length,
        totalOrders: orders?.length || 0,
        totalRevenue: 0 // No price data
      },
      customerOrders: Object.values(customerOrders),
      details: orders
    }
  }

  // Stage Efficiency Report
  async generateStageEfficiency(startDate: Date, endDate: Date) {
    const { data: stageAssignments } = await this.supabase
      .from('stage_assignments')
      .select(`
        *,
        worker:workers(name),
        order:orders(order_number, model)
      `)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())

    // Calculate efficiency metrics by stage
    const stageMetrics = stageAssignments?.reduce((acc, assignment) => {
      const stage = assignment.stage
      if (!acc[stage]) {
        acc[stage] = {
          stage,
          totalAssignments: 0,
          completedAssignments: 0,
          totalTime: 0,
          avgTime: 0,
          minTime: Infinity,
          maxTime: 0,
          workerPerformance: {}
        }
      }

      acc[stage].totalAssignments++
      
      if (assignment.completed_at && assignment.started_at) {
        acc[stage].completedAssignments++
        const duration = new Date(assignment.completed_at).getTime() - new Date(assignment.started_at).getTime()
        acc[stage].totalTime += duration
        acc[stage].minTime = Math.min(acc[stage].minTime, duration)
        acc[stage].maxTime = Math.max(acc[stage].maxTime, duration)

        // Track worker performance
        const workerName = assignment.worker?.name || 'Unknown'
        if (!acc[stage].workerPerformance[workerName]) {
          acc[stage].workerPerformance[workerName] = {
            assignments: 0,
            totalTime: 0,
            avgTime: 0
          }
        }
        acc[stage].workerPerformance[workerName].assignments++
        acc[stage].workerPerformance[workerName].totalTime += duration
      }

      return acc
    }, {} as Record<string, any>) || {}

    // Calculate averages
    Object.values(stageMetrics).forEach((stage: any) => {
      stage.avgTime = stage.completedAssignments > 0 
        ? stage.totalTime / stage.completedAssignments / 1000 / 60 // minutes
        : 0
      stage.minTime = stage.minTime === Infinity ? 0 : stage.minTime / 1000 / 60
      stage.maxTime = stage.maxTime / 1000 / 60
      stage.completionRate = stage.totalAssignments > 0
        ? (stage.completedAssignments / stage.totalAssignments) * 100
        : 0

      // Calculate worker averages
      Object.values(stage.workerPerformance).forEach((worker: any) => {
        worker.avgTime = worker.totalTime / worker.assignments / 1000 / 60
      })
    })

    return {
      metadata: {
        reportType: 'Stage Efficiency',
        generatedAt: new Date(),
        period: { startDate, endDate }
      },
      summary: {
        totalStages: Object.keys(stageMetrics).length,
        totalAssignments: stageAssignments?.length || 0,
        avgCompletionRate: Object.values(stageMetrics).reduce((acc: number, s: any) => 
          acc + s.completionRate, 0) / Object.keys(stageMetrics).length
      },
      stageMetrics: Object.values(stageMetrics),
      details: stageAssignments
    }
  }

  // Quality Trends Report
  async generateQualityTrends(startDate: Date, endDate: Date) {
    const { data: qualityChecks } = await this.supabase
      .from('quality_checks')
      .select(`
        *,
        worker:workers(name),
        order:orders(order_number, model)
      `)
      .gte('checked_at', startDate.toISOString())
      .lte('checked_at', endDate.toISOString())
      .order('checked_at', { ascending: true })

    const { data: issues } = await this.supabase
      .from('issues')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Calculate daily trends
    const dailyTrends = qualityChecks?.reduce((acc, check) => {
      const date = check.created_at ? format(new Date(check.created_at), 'yyyy-MM-dd') : 'unknown'
      if (!acc[date]) {
        acc[date] = {
          date,
          totalChecks: 0,
          passedChecks: 0,
          passRate: 0,
          issues: 0
        }
      }
      acc[date].totalChecks++
      if (check.overall_status === 'good') acc[date].passedChecks++
      return acc
    }, {} as Record<string, any>) || {}

    // Add issue counts
    issues?.forEach(issue => {
      if (issue.created_at) {
        const date = format(new Date(issue.created_at), 'yyyy-MM-dd')
        if (dailyTrends[date]) {
          dailyTrends[date].issues++
        }
      }
    })

    // Calculate pass rates
    Object.values(dailyTrends).forEach((day: any) => {
      day.passRate = day.totalChecks > 0 ? (day.passedChecks / day.totalChecks) * 100 : 0
    })

    // Calculate trends by stage
    const stageTrends = qualityChecks?.reduce((acc, check) => {
      if (!acc[check.stage]) {
        acc[check.stage] = {
          stage: check.stage,
          totalChecks: 0,
          passedChecks: 0,
          trend: []
        }
      }
      acc[check.stage].totalChecks++
      if (check.overall_status === 'good') acc[check.stage].passedChecks++
      
      // Add to trend
      const week = check.created_at ? format(new Date(check.created_at), 'yyyy-ww') : 'unknown'
      let weekData = acc[check.stage].trend.find((t: any) => t.week === week)
      if (!weekData) {
        weekData = { week, total: 0, passed: 0, passRate: 0 }
        acc[check.stage].trend.push(weekData)
      }
      weekData.total++
      if (check.overall_status === 'good') weekData.passed++
      
      return acc
    }, {} as Record<string, any>) || {}

    // Calculate weekly pass rates
    Object.values(stageTrends).forEach((stage: any) => {
      stage.trend.forEach((week: any) => {
        week.passRate = week.total > 0 ? (week.passed / week.total) * 100 : 0
      })
      stage.overallPassRate = stage.totalChecks > 0 
        ? (stage.passedChecks / stage.totalChecks) * 100 
        : 0
    })

    return {
      metadata: {
        reportType: 'Quality Trends',
        generatedAt: new Date(),
        period: { startDate, endDate }
      },
      summary: {
        totalChecks: qualityChecks?.length || 0,
        overallPassRate: qualityChecks 
          ? (qualityChecks.filter(qc => qc.overall_status === 'good').length / qualityChecks.length) * 100 
          : 0,
        totalIssues: issues?.length || 0
      },
      dailyTrends: Object.values(dailyTrends),
      stageTrends: Object.values(stageTrends),
      details: {
        qualityChecks,
        issues
      }
    }
  }

  // Format as PDF
  async formatAsPDF(data: any, reportType: string): Promise<Buffer> {
    const html = this.generateHTMLReport(data, reportType)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setContent(html)
    const pdf = await page.pdf({ 
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
    })
    await browser.close()
    
    return Buffer.from(pdf)
  }

  // Format as CSV
  async formatAsCSV(data: any, reportType: string): Promise<Buffer> {
    let csv = ''
    
    // Add metadata
    csv += `Report Type:,${data.metadata.reportType}\n`
    csv += `Generated At:,${data.metadata.generatedAt}\n`
    csv += `Period:,${format(data.metadata.period.startDate, 'yyyy-MM-dd')} to ${format(data.metadata.period.endDate, 'yyyy-MM-dd')}\n\n`
    
    // Add summary section
    csv += 'Summary\n'
    Object.entries(data.summary).forEach(([key, value]) => {
      csv += `${this.formatKey(key)},${value}\n`
    })
    csv += '\n'
    
    // Add details based on report type
    if (data.details && Array.isArray(data.details)) {
      csv += this.arrayToCSV(data.details)
    }
    
    return Buffer.from(csv, 'utf-8')
  }

  // Format as Excel
  async formatAsExcel(data: any, reportType: string): Promise<Buffer> {
    const workbook = XLSX.utils.book_new()
    
    // Summary sheet
    const summaryData = [
      ['Report Type', data.metadata.reportType],
      ['Generated At', data.metadata.generatedAt],
      ['Start Date', format(data.metadata.period.startDate, 'yyyy-MM-dd')],
      ['End Date', format(data.metadata.period.endDate, 'yyyy-MM-dd')],
      [],
      ['Summary'],
      ...Object.entries(data.summary).map(([key, value]) => [this.formatKey(key), value])
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    
    // Details sheet
    if (data.details && Array.isArray(data.details)) {
      const detailsSheet = XLSX.utils.json_to_sheet(data.details)
      XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Details')
    }
    
    // Additional sheets based on report type
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'metadata' && key !== 'summary' && key !== 'details' && Array.isArray(value)) {
        const sheet = XLSX.utils.json_to_sheet(value)
        XLSX.utils.book_append_sheet(workbook, sheet, this.formatKey(key))
      }
    })
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    return buffer
  }

  // Helper methods
  private generateHTMLReport(data: any, reportType: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${data.metadata.reportType}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 30px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-label { font-weight: bold; }
            .metric-value { font-size: 1.2em; color: #333; }
          </style>
        </head>
        <body>
          <h1>${data.metadata.reportType}</h1>
          <p>Generated: ${format(data.metadata.generatedAt, 'PPP')}</p>
          <p>Period: ${format(data.metadata.period.startDate, 'PP')} to ${format(data.metadata.period.endDate, 'PP')}</p>
          
          <div class="summary">
            <h2>Summary</h2>
            ${Object.entries(data.summary).map(([key, value]) => `
              <div class="metric">
                <span class="metric-label">${this.formatKey(key)}:</span>
                <span class="metric-value">${this.formatValue(value)}</span>
              </div>
            `).join('')}
          </div>
          
          ${this.generateDetailTables(data)}
        </body>
      </html>
    `
  }

  private generateDetailTables(data: any): string {
    let html = ''
    
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'metadata' && key !== 'summary' && Array.isArray(value) && value.length > 0) {
        html += `<h2>${this.formatKey(key)}</h2>`
        html += '<table>'
        
        // Headers
        html += '<tr>'
        Object.keys(value[0]).forEach(col => {
          html += `<th>${this.formatKey(col)}</th>`
        })
        html += '</tr>'
        
        // Rows
        value.forEach(row => {
          html += '<tr>'
          Object.values(row).forEach(val => {
            html += `<td>${this.formatValue(val)}</td>`
          })
          html += '</tr>'
        })
        
        html += '</table>'
      }
    })
    
    return html
  }

  private arrayToCSV(data: any[]): string {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    let csv = headers.join(',') + '\n'
    
    data.forEach(row => {
      csv += headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      }).join(',') + '\n'
    })
    
    return csv
  }

  private formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  private formatValue(value: any): string {
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    if (value instanceof Date) {
      return format(value, 'PPP')
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return String(value)
  }
}