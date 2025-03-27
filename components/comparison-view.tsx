"use client"

import { useState, useMemo } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Candidate {
  id: string
  name: string
  avatar: string
  skills: Record<string, number>
  experience: number
  canJoinIn: number
  minimumSalary: number
}

interface ComparisonViewProps {
  candidates: Candidate[]
  heatMapData: Record<string, any>[]
  onRemoveCandidate: (candidateId: string) => void
}

export default function ComparisonView({ candidates, heatMapData, onRemoveCandidate }: ComparisonViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Extract all unique skills from candidates
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>()

    // Add default skills that are always shown
    skillsSet.add("Experience")
    skillsSet.add("Can join in")
    skillsSet.add("Minimum salary expected")

    // Add skills from heat map data
    heatMapData.forEach((candidate) => {
      if (candidate.skillset && Array.isArray(candidate.skillset)) {
        candidate.skillset.forEach((skillData) => {
          if (skillData.skill_name) {
            skillsSet.add(skillData.skill_name)
          }
        })
      }
    })

    return Array.from(skillsSet)
  }, [heatMapData])

  // Filter skills based on search term and selected skills
  const filteredSkills = useMemo(() => {
    if (!searchTerm && selectedSkills.length === 0) {
      return allSkills
    }

    return allSkills.filter((skill) => {
      const matchesSearch = searchTerm ? skill.toLowerCase().includes(searchTerm.toLowerCase()) : true

      const isSelected = selectedSkills.length > 0 ? selectedSkills.includes(skill) : true

      return matchesSearch && isSelected
    })
  }, [allSkills, searchTerm, selectedSkills])

  // Get skill value for a candidate
  const getSkillValue = (candidateId: string, skill: string) => {
    const candidate = heatMapData.find((c) => c.id === candidateId)

    if (!candidate) return null

    if (skill === "Experience") return candidate.experience
    if (skill === "Can join in") return candidate.canJoinIn
    if (skill === "Minimum salary expected") return candidate.minimumSalary

    // For other skills, look in the skillset array for consensus_score
    if (candidate.skillset && Array.isArray(candidate.skillset)) {
      const skillData = candidate.skillset.find((s) => s.skill_name === skill)
      return skillData ? skillData.consensus_score : 0
    }

    return 0
  }

  // Determine cell color based on skill value
  const getCellColor = (value: number | null) => {
    if (value === null) return "bg-gray-100"

    // For numeric values like experience, salary, etc.
    if (typeof value === "number" && value > 100) return ""

    // For consensus scores (typically 1-5)
    if (typeof value === "number" && value <= 5) {
      if (value >= 5) return "bg-green-800 text-white"
      if (value >= 4) return "bg-green-600 text-white"
      if (value >= 3) return "bg-green-400"
      if (value >= 2) return "bg-green-200"
      if (value >= 1) return "bg-yellow-200"
      return "bg-gray-100"
    }

    // For percentage-based values (0-100)
    const normalizedValue = Math.min(100, Math.max(0, value))

    if (normalizedValue >= 80) return "bg-green-800 text-white"
    if (normalizedValue >= 60) return "bg-green-600 text-white"
    if (normalizedValue >= 40) return "bg-green-400"
    if (normalizedValue >= 20) return "bg-green-200"
    return "bg-yellow-200"
  }

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  if (candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No candidates selected</h3>
          <p className="text-gray-500">Add candidates from the sidebar to compare them.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-auto">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                {allSkills.map((skill) => (
                  <DropdownMenuCheckboxItem
                    key={skill}
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedSkills.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedSkills([])} className="ml-2">
              Clear filters
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="w-48 p-2 text-left"></th>
                {candidates.map((candidate, index) => (
                  <th key={candidate.id} className="p-2 text-center min-w-[60px]">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-300 mb-1"></div>
                      <span className="text-xs font-normal">A{index + 1}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map((skill) => {
                const isNumeric = ["Experience", "Can join in", "Minimum salary expected"].includes(skill)

                return (
                  <tr key={skill} className="border-t">
                    <td className="p-2 text-left">{skill}</td>
                    {candidates.map((candidate) => {
                      const value = getSkillValue(candidate.id, skill)

                      return (
                        <td
                          key={`${candidate.id}-${skill}`}
                          className={`p-2 text-center ${isNumeric ? "" : getCellColor(value)}`}
                        >
                          {isNumeric ? value : ""}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {candidates.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button className="bg-green-600 hover:bg-green-700">Select candidate to compare</Button>
          </div>
        )}
      </div>
    </div>
  )
}

