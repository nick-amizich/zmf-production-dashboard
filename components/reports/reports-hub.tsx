'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Package,
  CheckCircle,
  Users,
  DollarSign,
  BarChart3,
  Send
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

import { logger } from '@/lib/logger'
interface ReportType {
  id: string
  name: string
  description: string
  icon: React.ElementType
  category: 'production' | 'quality' | 'worker' | 'financial'
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'production-summary',
    name: 'Production Summary',
    description: 'Overview of production metrics, order status, and completion rates',
    icon: Package,
    category: 'production'
  },
  {
    id: 'quality-analysis',
    name: 'Quality Analysis',
    description: 'Quality metrics, pass rates, and issue tracking report',
    icon: CheckCircle,
    category: 'quality'
  },
  {
    id: 'worker-performance',
    name: 'Worker Performance',
    description: 'Individual and team performance metrics',
    icon: Users,
    category: 'worker'
  },
  {
    id: 'financial-summary',
    name: 'Financial Summary',
    description: 'Revenue, costs, and profitability analysis',
    icon: DollarSign,
    category: 'financial'
  },
  {
    id: 'inventory-status',
    name: 'Inventory Status',
    description: 'Current inventory levels and usage trends',
    icon: Package,
    category: 'production'
  },
  {
    id: 'customer-orders',
    name: 'Customer Orders',
    description: 'Detailed customer order history and trends',
    icon: FileText,
    category: 'financial'
  },
  {
    id: 'stage-efficiency',
    name: 'Stage Efficiency',
    description: 'Production stage timing and bottleneck analysis',
    icon: BarChart3,
    category: 'production'
  },
  {
    id: 'quality-trends',
    name: 'Quality Trends',
    description: 'Long-term quality metrics and improvement tracking',
    icon: BarChart3,
    category: 'quality'
  }
]

export function ReportsHub() {
  const [selectedReport, setSelectedReport] = useState<string>('')
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf')
  const [isGenerating, setIsGenerating] = useState(false)
  const [category, setCategory] = useState<string>('all')

  const filteredReports = category === 'all' 
    ? REPORT_TYPES 
    : REPORT_TYPES.filter(r => r.category === category)

  const handleGenerateReport = async () => {
    if (!selectedReport || !dateRange.from || !dateRange.to) {
      toast({
        title: 'Missing Information',
        description: 'Please select a report type and date range',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: selectedReport,
          startDate: format(dateRange.from, 'yyyy-MM-dd'),
          endDate: format(dateRange.to, 'yyyy-MM-dd'),
          format: exportFormat,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedReport}-${format(new Date(), 'yyyy-MM-dd')}.${format}`
        a.click()
        
        toast({
          title: 'Report Generated',
          description: 'Your report has been downloaded successfully',
        })
      }
    } catch (error) {
      logger.error('Error generating report:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScheduleReport = () => {
    toast({
      title: 'Coming Soon',
      description: 'Report scheduling will be available in a future update',
    })
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-primary">Reports Hub</h1>
            <p className="text-zinc-400 mt-1">
              Generate and export detailed reports
            </p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Report Type</CardTitle>
                <CardDescription>
                  Choose from our available report templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredReports.map((report) => {
                    const Icon = report.icon
                    return (
                      <div
                        key={report.id}
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-colors",
                          selectedReport === report.id
                            ? "border-primary bg-primary/10"
                            : "border-zinc-800 hover:border-zinc-700"
                        )}
                        onClick={() => setSelectedReport(report.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <h3 className="font-medium">{report.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {report.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium">Date Range</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => {
                          if (range) {
                            setDateRange({
                              from: range.from,
                              to: range.to
                            })
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Quick Date Options */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({
                      from: subDays(new Date(), 7),
                      to: new Date()
                    })}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({
                      from: subDays(new Date(), 30),
                      to: new Date()
                    })}
                  >
                    Last 30 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({
                      from: startOfMonth(new Date()),
                      to: endOfMonth(new Date())
                    })}
                  >
                    This month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const lastMonth = subDays(startOfMonth(new Date()), 1)
                      setDateRange({
                        from: startOfMonth(lastMonth),
                        to: endOfMonth(lastMonth)
                      })
                    }}
                  >
                    Last month
                  </Button>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="text-sm font-medium">Export Format</label>
                  <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                      <SelectItem value="excel">Excel Workbook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4">
                  <Button 
                    className="w-full"
                    onClick={handleGenerateReport}
                    disabled={!selectedReport || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleScheduleReport}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Schedule Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your recently generated reports will appear here
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}