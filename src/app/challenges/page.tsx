
"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Flame, CheckCircle2, Circle, Star, Zap, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { generateEcoChallenge } from "@/ai/flows/ai-eco-challenge"

export default function ChallengesPage() {
  const { toast } = useToast()
  const [points, setPoints] = useState(450)
  const [completed, setCompleted] = useState<number[]>([])
  const [generating, setGenerating] = useState(false)
  const [challenges, setChallenges] = useState([
    { id: 1, title: "No Plastic Bottles Today", pts: 20, difficulty: "Easy", icon: "🥤" },
    { id: 2, title: "Cycle/Walk to Work/School", pts: 50, difficulty: "Hard", icon: "🚲" },
    { id: 3, title: "Turn Off Standby Electronics", pts: 15, difficulty: "Easy", icon: "🔌" },
    { id: 4, title: "Compost Kitchen Waste", pts: 35, difficulty: "Medium", icon: "🥬" },
    { id: 5, title: "Plant a Small Indoor Plant", pts: 25, difficulty: "Medium", icon: "🌱" },
    { id: 6, title: "Use a Reusable Grocery Bag", pts: 20, difficulty: "Easy", icon: "🛍️" },
  ])

  const completeChallenge = (id: number, pts: number) => {
    if (completed.includes(id)) return
    setCompleted([...completed, id])
    setPoints(points + pts)
    toast({
      title: "Challenge Completed! 🎉",
      description: `You earned ${pts} eco points. Keep it up!`,
    })
  }

  const handleGenerateAiChallenge = async () => {
    setGenerating(true)
    try {
      const result = await generateEcoChallenge({
        difficulty: 'medium'
      })
      const newChallenge = {
        id: Date.now(),
        title: result.challengeText,
        pts: result.points,
        difficulty: result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1),
        icon: result.icon || "🌟"
      }
      setChallenges([newChallenge, ...challenges])
      toast({
        title: "AI Challenge Generated!",
        description: "A new personalized mission has been added to your list.",
      })
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate AI challenge right now.",
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline">Eco Missions</h1>
          <p className="text-muted-foreground">Complete tasks to save the planet and rank up</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center px-4 py-2 bg-white rounded-2xl shadow-sm border border-border">
            <Flame className="size-5 text-orange-500" />
            <span className="text-xs font-bold">5 DAY STREAK</span>
          </div>
          <div className="flex flex-col items-center px-6 py-2 bg-primary text-white rounded-2xl shadow-md">
            <Trophy className="size-5 text-yellow-300" />
            <span className="text-lg font-bold">{points} PTS</span>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((c) => (
          <Card key={c.id} className={`aqi-card overflow-hidden transition-all ${completed.includes(c.id) ? 'bg-secondary/5 border-secondary/20 opacity-80' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <span className="text-3xl">{c.icon}</span>
                <Badge variant={c.difficulty === 'Hard' ? 'destructive' : c.difficulty === 'Medium' ? 'default' : 'secondary'}>
                  {c.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight mt-2">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-1 text-sm font-bold text-primary">
                <Zap className="size-4 text-yellow-500 fill-yellow-500" />
                {c.pts} Points
              </div>
              <Button 
                onClick={() => completeChallenge(c.id, c.pts)} 
                disabled={completed.includes(c.id)}
                className={`w-full gap-2 rounded-xl transition-all ${completed.includes(c.id) ? 'bg-secondary' : ''}`}
              >
                {completed.includes(c.id) ? (
                  <>
                    <CheckCircle2 className="size-4" /> Completed
                  </>
                ) : (
                  <>
                    <Circle className="size-4" /> Mark Done
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-sidebar text-white overflow-hidden rounded-3xl border-0">
        <CardContent className="p-8 flex items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Need more challenges?</h2>
            <p className="text-sidebar-foreground/80">Our AI can generate personalized eco-missions based on your location and lifestyle.</p>
            <Button 
              onClick={handleGenerateAiChallenge} 
              disabled={generating} 
              variant="secondary" 
              className="mt-4 gap-2 rounded-xl"
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Star className="size-4 fill-white" />
              )}
              {generating ? "Generating..." : "Generate AI Challenge"}
            </Button>
          </div>
          <Trophy className="size-32 text-sidebar-foreground opacity-10 shrink-0 hidden md:block" />
        </CardContent>
      </Card>
    </div>
  )
}
