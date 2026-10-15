"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CITY_STATIONS, getAqiStatus, WAQI_TOKEN } from "@/lib/constants"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { compareCities } from "@/ai/flows/ai-city-comparison"
import { Sparkles, Trophy, MapPin, RefreshCw, AlertCircle } from "lucide-react"

const CITIES = [
  { name: 'Delhi', id: 'delhi' },
  { name: 'Gurugram', id: 'gurugram' },
  { name: 'Noida', id: 'noida' },
  { name: 'Mumbai', id: 'mumbai' },
  { name: 'Bangalore', id: 'bangalore' },
  { name: 'Chennai', id: 'chennai' },
  { name: 'Hyderabad', id: 'hyderabad' },
  { name: 'Kolkata', id: 'kolkata' },
]

export default function ComparePage() {
  const [city1Id, setCity1Id] = useState('delhi')
  const [city2Id, setCity2Id] = useState('mumbai')
  const [comparing, setComparing] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [aqiData, setAqiData] = useState<{ [key: string]: number }>({})

  async function fetchCityAqi(cityId: string) {
    const stationId = (CITY_STATIONS as any)[cityId]
    if (!stationId) return 0
    try {
      const res = await fetch(`https://api.waqi.info/feed/${stationId}/?token=${WAQI_TOKEN}`)
      const json = await res.json()
      if (json.status === 'ok') {
        return json.data.aqi
      }
      return 0
    } catch (e) {
      console.error(e)
      return 0
    }
  }

  const runComparison = async () => {
    setComparing(true)
    setAiResult(null)
    try {
      const realAqi1 = await fetchCityAqi(city1Id)
      const realAqi2 = await fetchCityAqi(city2Id)
      
      setAqiData({
        [city1Id]: realAqi1,
        [city2Id]: realAqi2
      })

      const cityName1 = CITIES.find(c => c.id === city1Id)?.name || city1Id
      const cityName2 = CITIES.find(c => c.id === city2Id)?.name || city2Id

      const res = await compareCities({
        city1: { 
          name: cityName1, 
          currentAqi: realAqi1, 
          analysis: { trend: realAqi1 > 150 ? 'WORSENING' : 'STABLE', weeklyAvg: Math.round(realAqi1 * 0.95) } 
        },
        city2: { 
          name: cityName2, 
          currentAqi: realAqi2, 
          analysis: { trend: realAqi2 > 150 ? 'WORSENING' : 'IMPROVING', weeklyAvg: Math.round(realAqi2 * 1.05) } 
        },
      })
      setAiResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setComparing(false)
    }
  }

  const name1 = CITIES.find(c => c.id === city1Id)?.name || city1Id
  const name2 = CITIES.find(c => c.id === city2Id)?.name || city2Id

  const currentAqi1 = aqiData[city1Id] || 0
  const currentAqi2 = aqiData[city2Id] || 0

  const chartData = [
    { name: name1, aqi: currentAqi1, color: getAqiStatus(currentAqi1).color },
    { name: name2, aqi: currentAqi2, color: getAqiStatus(currentAqi2).color },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary">City Comparison</h1>
        <p className="text-muted-foreground">Compare real-time air quality between major urban centers</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="aqi-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Select Cities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">1</div>
                <Select value={city1Id} onValueChange={(val) => { setCity1Id(val); setAiResult(null); }}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">2</div>
                <Select value={city2Id} onValueChange={(val) => { setCity2Id(val); setAiResult(null); }}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={runComparison} disabled={comparing} className="w-full gap-2 rounded-xl py-6 text-lg">
              {comparing ? <RefreshCw className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
              Fetch Real-time & Compare
            </Button>
          </CardContent>
        </Card>

        <Card className="aqi-card">
          <CardHeader>
            <CardTitle>AQI Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="aqi" radius={[8, 8, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div>
                <p className="text-3xl font-bold" style={{ color: chartData[0].color }}>{currentAqi1 || '--'}</p>
                <p className="text-xs uppercase font-bold text-muted-foreground">{name1}</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: chartData[1].color }}>{currentAqi2 || '--'}</p>
                <p className="text-xs uppercase font-bold text-muted-foreground">{name2}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {aiResult && (
        <Card className="aqi-card border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> AI Insights Summary
              </CardTitle>
              {aiResult.winnerCity && (
                <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-primary/20 text-xs font-bold text-primary">
                  <Trophy className="size-3 text-yellow-500 fill-yellow-500" />
                  WINNER: {aiResult.winnerCity}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed italic">
              "{aiResult.summary}"
            </div>
          </CardContent>
        </Card>
      )}

      {!aiResult && !comparing && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-xl text-sm text-muted-foreground justify-center">
          <AlertCircle className="size-4" />
          Click the button to fetch live data and get an AI comparison.
        </div>
      )}
    </div>
  )
}
