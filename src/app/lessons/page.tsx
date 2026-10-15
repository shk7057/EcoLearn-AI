"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { generateEnvironmentalLesson } from "@/ai/flows/ai-environmental-lesson"
import { detectLocationAndAQI } from "@/lib/location"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, RefreshCcw, Sparkles } from "lucide-react"

export default function LessonsPage() {
  const [lesson, setLesson] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadLesson() {
    setLoading(true)
    setError(null)
    try {
      const location = await detectLocationAndAQI()
      // Calling the flow which now returns the lesson string via the wrapper
      const result = await generateEnvironmentalLesson({
        city: location.city,
        aqi: location.aqi.aqi,
        pm25: location.aqi.iaqi.pm25?.v || 0,
        temp: location.aqi.iaqi.t?.v || 25,
        trend: "STABLE", 
        diffFromAvg: 5, 
        weeklyAvg: 160, 
        bestDay: { aqi: 120, date: new Date().toISOString().split('T')[0] }
      })
      setLesson(result)
    } catch (err: any) {
      setError(err.message || "Unable to generate lesson. Please check your connection.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLesson()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">AI Environmental Lesson</h1>
          <p className="text-muted-foreground">Personalized learning based on your current environment</p>
        </div>
        <Button onClick={loadLesson} disabled={loading} variant="outline" className="gap-2 rounded-xl">
          <RefreshCcw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          New Lesson
        </Button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Sparkles className="size-12 text-secondary animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Crafting your custom lesson...</p>
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5 rounded-2xl">
          <CardContent className="p-8 text-center text-destructive">{error}</CardContent>
        </Card>
      ) : (
        <Card className="aqi-card overflow-hidden shadow-xl border-0">
          <CardHeader className="bg-primary text-primary-foreground border-b-0 py-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="size-6" /> Today's Learning Session
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 md:p-10">
            <div className="prose prose-slate max-w-none prose-p:text-lg prose-p:leading-relaxed whitespace-pre-wrap font-body">
              {lesson}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
