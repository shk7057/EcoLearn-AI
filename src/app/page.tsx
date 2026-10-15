
"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { detectLocationAndAQI } from "@/lib/location"
import { AQITrendModel, HistoricalReading } from "@/lib/aqi-model"
import { getAqiStatus } from "@/lib/constants"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertCircle, MapPin, Wind, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)
  const [tips, setTips] = useState<any[]>([])

  const [history] = useState<HistoricalReading[]>([
    { date: "Mar 10", aqi: 145 },
    { date: "Mar 11", aqi: 155 },
    { date: "Mar 12", aqi: 168 },
    { date: "Mar 13", aqi: 160 },
    { date: "Mar 14", aqi: 175 },
    { date: "Mar 15", aqi: 185 },
    { date: "Mar 16", aqi: 179 },
  ])

  useEffect(() => {
    async function init() {
      try {
        const res = await detectLocationAndAQI()
        setData(res)

        const model = new AQITrendModel()
        model.train(history)
        const ana = model.analyze(res.aqi.aqi)
        setAnalysis(ana)
        setTips(model.generateTips(res.aqi.aqi, ana))
      } catch (err) {
        // Silent fail or handled error emitter
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [history])

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  const status = getAqiStatus(data?.aqi.aqi || 0)
  const chartData = [...history, { date: "Today", aqi: data?.aqi.aqi }]
  
  // Round temperature to 2 decimal places safely
  const rawTemp = data?.aqi.iaqi.t?.v;
  const temp = typeof rawTemp === 'number' ? rawTemp.toFixed(2) : Number(rawTemp || 0).toFixed(2);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Environmental Dashboard</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="size-4 mr-1 text-secondary" />
            <span className="font-medium">
              {data?.area}, {data?.city} — AQI: {data?.aqi.aqi} {status.status}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 px-3 py-1 rounded-full">
          <span className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-secondary animate-pulse" />
            Live Updates
          </span>
        </Badge>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="aqi-card overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground pb-8">
            <CardTitle className="text-lg font-medium opacity-90 flex items-center gap-2">
              <Wind className="size-5" /> Current Air Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 text-center">
              <div className="text-6xl font-bold mb-2" style={{ color: status.color }}>
                {data?.aqi.aqi}
              </div>
              <div className="text-xl font-semibold mb-1">{status.label}</div>
              <div className="text-sm text-muted-foreground">Main Pollutant: PM2.5</div>
            </div>
          </CardContent>
        </Card>

        <Card className="aqi-card md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly AQI Analysis</CardTitle>
                <CardDescription>Based on your exact location trends</CardDescription>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trend</span>
                <span className="flex items-center gap-1 font-bold">
                  {analysis?.trend === 'WORSENING' ? <TrendingUp className="text-destructive size-5" /> : 
                   analysis?.trend === 'IMPROVING' ? <TrendingDown className="text-secondary size-5" /> : 
                   <Minus className="text-muted-foreground size-5" />}
                  {analysis?.trend}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Weekly Avg</p>
                <p className="text-xl font-bold">{analysis?.weeklyAvg}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Variance</p>
                <p className="text-xl font-bold text-destructive">
                  {analysis?.diffFromAvg > 0 ? "+" : ""}{analysis?.diffFromAvg}%
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Volatility</p>
                <p className="text-xl font-bold">±{analysis?.volatility}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Best Day</p>
                <p className="text-xl font-bold text-secondary">{analysis?.bestDay.aqi}</p>
              </div>
            </div>

            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="aqi" 
                    stroke="#2d6a4f" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2d6a4f' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="aqi-card md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-primary" /> Smart Health Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/20">
                <span className="text-xl leading-none">{tip.icon}</span>
                <p className="text-sm font-medium">{tip.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="aqi-card md:col-span-2">
          <CardHeader>
            <CardTitle>Local Pollution Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">{data?.aqi.iaqi.pm25?.v || 'N/A'}</div>
                <div className="text-xs text-muted-foreground font-bold uppercase">PM 2.5</div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div className="bg-destructive h-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">{data?.aqi.iaqi.pm10?.v || '45'}</div>
                <div className="text-xs text-muted-foreground font-bold uppercase">PM 10</div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full" style={{ width: '40%' }} />
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">{temp}°C</div>
                <div className="text-xs text-muted-foreground font-bold uppercase">Temp</div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
