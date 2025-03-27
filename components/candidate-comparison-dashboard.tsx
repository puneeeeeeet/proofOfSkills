"use client"

import { useState, useEffect } from "react"
import CandidateList from "@/components/candidate-list"
import ComparisonView from "@/components/comparison-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Candidate {
  id: string
  name: string
  avatar: string
  skills: Record<string, number>
  experience: number
  canJoinIn: number
  minimumSalary: number
}

export default function CandidateComparisonDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [heatMapData, setHeatMapData] = useState<Record<string, any>[]>([])
  const [jobTitle, setJobTitle] = useState("")

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://forinterview.onrender.com/people")
        if (!response.ok) {
          throw new Error("Failed to fetch candidates")
        }
        const data = await response.json()

        // Transform the data to match our interface
        const transformedData = data.map((candidate: any) => ({
          id: candidate.id,
          name: candidate.name,
          avatar: candidate.avatar || "/placeholder.svg?height=40&width=40",
          skills: candidate.skills || {},
          experience: candidate.experience || 0,
          canJoinIn: candidate.canJoinIn || 0,
          minimumSalary: candidate.minimumSalary || 0,
        }))

        setCandidates(transformedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [])

  const fetchHeatMapData = async () => {
    if (selectedCandidates.length === 0) return

    try {
      const heatMapPromises = selectedCandidates.map(async (candidate) => {
        const response = await fetch(`https://forinterview.onrender.com/people/${candidate.id}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch heat map data for ${candidate.name}`)
        }
        const data = await response.json()
        return {
          id: candidate.id,
          name: candidate.name,
          avatar: candidate.avatar,
          experience: data.experience || candidate.experience || 0,
          canJoinIn: data.canJoinIn || candidate.canJoinIn || 0,
          minimumSalary: data.minimumSalary || candidate.minimumSalary || 0,
          skillset: data.skillset || [],
        }
      })

      const heatMapResults = await Promise.all(heatMapPromises)
      setHeatMapData(heatMapResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  useEffect(() => {
    fetchHeatMapData()
  }, [selectedCandidates])

  const handleAddCandidate = (candidate: Candidate) => {
    if (!selectedCandidates.some((c) => c.id === candidate.id)) {
      setSelectedCandidates([...selectedCandidates, candidate])
    }
  }

  const handleRemoveCandidate = (candidateId: string) => {
    setSelectedCandidates(selectedCandidates.filter((c) => c.id !== candidateId))
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-medium text-gray-600">{jobTitle}</h1>
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedCandidates.length} Candidates</span>
          <div className="flex gap-1 ml-4">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[300px] border-r flex-shrink-0">
          <CandidateList candidates={candidates} onAddCandidate={handleAddCandidate} loading={loading} error={error} />
        </div>

        <main className="flex-1 overflow-auto">
          <Tabs defaultValue="compare" className="w-full">
            <div className="border-b">
              <TabsList className="ml-4 mt-2">
                <TabsTrigger
                  value="compare"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  Compare View
                </TabsTrigger>
                <TabsTrigger value="individual">Individual view</TabsTrigger>
                <TabsTrigger value="shortlisted">Shortlisted candidates</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="compare" className="p-0 m-0">
              <ComparisonView
                candidates={selectedCandidates}
                heatMapData={heatMapData}
                onRemoveCandidate={handleRemoveCandidate}
              />
            </TabsContent>
            <TabsContent value="individual">
              <div className="p-4">Individual view content</div>
            </TabsContent>
            <TabsContent value="shortlisted">
              <div className="p-4">Shortlisted candidates content</div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

