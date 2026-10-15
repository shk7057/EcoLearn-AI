
"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Upload, CheckCircle2, AlertTriangle, Leaf, Info, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function PlantPage() {
  const [image, setImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const simulateAnalysis = () => {
    setAnalyzing(true)
    setResult(null)
    setTimeout(() => {
      setAnalyzing(false)
      setResult({
        name: "Tomato Late Blight",
        confidence: 0.94,
        status: "Warning",
        recommendation: "Remove infected leaves immediately. Improve air circulation and avoid overhead watering. Apply copper-based fungicide if necessary."
      })
    }, 2500)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (readerEvent) => {
        setImage(readerEvent.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary text-headline font-headline">AI Plant Doctor</h1>
        <p className="text-muted-foreground">Scan your plants to detect diseases using AI</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="aqi-card overflow-hidden">
          <CardHeader>
            <CardTitle>Camera / Upload</CardTitle>
            <CardDescription>Capture or select a clear photo of the leaf</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center relative border-2 border-dashed border-border overflow-hidden">
              {image ? (
                <Image src={image} fill alt="Captured plant" className="object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="size-12 opacity-20" />
                  <p className="text-sm font-medium">No image captured</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2 rounded-xl" onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="size-4" /> Upload
              </Button>
              <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleUpload} />
              
              <Button className="gap-2 rounded-xl" onClick={simulateAnalysis} disabled={!image || analyzing}>
                {analyzing ? <RefreshCw className="size-4 animate-spin" /> : <Leaf className="size-4" />}
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={`aqi-card transition-all duration-500 ${result ? 'scale-100' : 'opacity-50 grayscale'}`}>
          <CardHeader>
            <CardTitle>Diagnosis Result</CardTitle>
            <CardDescription>AI Analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!result && !analyzing && (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Info className="size-10 opacity-10" />
                  <p>Upload a photo to see results</p>
                </div>
              </div>
            )}

            {analyzing && (
              <div className="space-y-4 py-6">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-20 bg-muted animate-pulse rounded w-full" />
                <div className="h-10 bg-muted animate-pulse rounded w-full" />
              </div>
            )}

            {result && (
              <>
                <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-2xl border border-destructive/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-destructive size-6" />
                    <div>
                      <p className="font-bold text-destructive">{result.name}</p>
                      <p className="text-xs text-muted-foreground">Confidence Score: {(result.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <Badge className="bg-destructive text-white border-none">Action Required</Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recommendation</p>
                  <p className="text-sm leading-relaxed bg-muted p-4 rounded-xl border border-border/50">
                    {result.recommendation}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3 text-secondary" />
                  <span>Works with high precision models</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
