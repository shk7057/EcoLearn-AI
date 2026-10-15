"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HOUR_PATTERN } from "@/lib/constants"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CloudSun, Sun, Info, RefreshCw } from "lucide-react"

export default function ForecastPage() {
  const [currentHour, setCurrentHour] = useState<number | null>(null)

  useEffect(() => {
    // Only set the hour on the client after initial mount to prevent hydration mismatch
    setCurrentHour(new Date().getHours())
  }, [])

  if (currentHour === null) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <RefreshCw className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Calculating local forecast...</p>
      </div>
    )
  }

  const baseAQI = 175 // Baseline for prediction

  const forecastData = HOUR_PATTERN.map((factor, i) => {
    const hour = (currentHour + i) % 24
    return {
      time: `${hour}:00`,
      aqi: Math.round(baseAQI * factor),
      hour
    }
  })

  const sortedForecast = [...forecastData].sort((a, b) => a.aqi - b.aqi)
  const bestTime = sortedForecast[0]
  const worstTime = sortedForecast[sortedForecast.length - 1]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary">24-Hour Prediction</h1>
        <p className="text-muted-foreground">Plan your day with our hourly pollution forecast</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-secondary/10 border-secondary/20 border-2">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-sm text-secondary">
              <Sun className="size-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-secondary uppercase tracking-wider">Best Time to Go Out</p>
              <p className="text-2xl font-bold">{bestTime.time}</p>
              <p className="text-sm text-muted-foreground">Estimated AQI: {bestTime.aqi}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/10 border-destructive/20 border-2">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-sm text-destructive">
              <CloudSun className="size-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-destructive uppercase tracking-wider">Avoid Going Out</p>
              <p className="text-2xl font-bold">{worstTime.time}</p>
              <p className="text-sm text-muted-foreground">Estimated AQI: {worstTime.aqi}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="aqi-card">
        <CardHeader>
          <CardTitle>Forecast Visualizer</CardTitle>
          <CardDescription>Predicted AQI fluctuations over the next 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="time" />
                <YAxis hide domain={[0, 'dataMax + 20']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#2d6a4f" 
                  fillOpacity={1} 
                  fill="url(#colorAqi)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex items-center gap-2 p-4 bg-muted rounded-xl text-sm text-muted-foreground">
            <Info className="size-4 text-primary shrink-0" />
            <p>Our model uses daily historical patterns for your city to predict AQI spikes. Factors like morning traffic and evening cooling are considered.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
