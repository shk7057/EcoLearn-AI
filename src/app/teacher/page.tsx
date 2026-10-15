"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, BookOpen, BarChart3, TrendingUp, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TeacherPage() {
  const students = [
    { id: 1, name: "Alice Johnson", score: 1250, level: 25, streak: 12, city: "Delhi" },
    { id: 2, name: "Bob Smith", score: 1100, level: 22, streak: 8, city: "Delhi" },
    { id: 3, name: "Charlie Brown", score: 980, level: 19, streak: 5, city: "Gurgaon" },
    { id: 4, name: "Diana Prince", score: 850, level: 17, streak: 3, city: "Noida" },
    { id: 5, name: "Ethan Hunt", score: 720, level: 14, streak: 10, city: "Delhi" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary">Teacher Hub</h1>
        <p className="text-muted-foreground">Monitor class progress and environmental engagement</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="aqi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
              Active Students <Users className="size-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="text-xs text-secondary font-medium mt-1">+4 this week</p>
          </CardContent>
        </Card>
        <Card className="aqi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
              Avg Score <BarChart3 className="size-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">845</div>
            <p className="text-xs text-primary font-medium mt-1">Class Avg Rank: A-</p>
          </CardContent>
        </Card>
        <Card className="aqi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
              Lessons Completed <BookOpen className="size-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">128</div>
            <p className="text-xs text-secondary font-medium mt-1">92% Engagement Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="aqi-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Class Leaderboard</CardTitle>
              <CardDescription>Real-time student performance across all environmental modules</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-10 rounded-xl" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.city}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-bold">{student.score}</Badge>
                  </TableCell>
                  <TableCell>Lvl {student.level}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-orange-600 font-bold">
                      <TrendingUp className="size-3" /> {student.streak}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-primary hover:underline text-sm font-bold">View History</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}