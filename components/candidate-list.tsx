"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Candidate {
  id: string
  name: string
  avatar: string
  skills: Record<string, number>
  experience: number
  canJoinIn: number
  minimumSalary: number
}

interface CandidateListProps {
  candidates: Candidate[]
  onAddCandidate: (candidate: Candidate) => void
  loading: boolean
  error: string | null
}

export default function CandidateList({ candidates, onAddCandidate, loading, error }: CandidateListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Most recommended</h2>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          candidates.map((candidate) => (
            <div key={candidate.id} className="p-4 border-b flex items-center justify-between ">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={candidate.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={candidate.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span>{candidate.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddCandidate(candidate)}
                className="text-gray-400 hover:text-gray-600"
              >
                <PlusCircle className="h-6 w-6" />
                <span className="sr-only">Add candidate</span>
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t text-sm text-gray-500">
        <p>Recommendations are based on your skill requirements and candidate's performance.</p>
      </div>
    </div>
  )
}

