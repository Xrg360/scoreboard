"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Admin() {
  const [session, setSession] = useState(null)
  const [events, setEvents] = useState([])
  const [houses, setHouses] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [positions, setPositions] = useState({ first: "", second: "", third: "" })
  const [houseScores, setHouseScores] = useState([])

  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) return router.push("/admin/login")
      setSession(sessionData.session)

      try {
        const [{ data: eventsData }, { data: housesData }] = await Promise.all([
          supabase.from("events").select("*"),
          supabase.from("houses").select("*").order("total_score", { ascending: false })
        ])
        setEvents(eventsData || [])
        setHouses(housesData || [])
        setHouseScores(housesData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [router])

  const handleSubmit = async () => {
    if (!selectedEvent || !positions.first || !positions.second || !positions.third) {
      alert("Please select all positions");
      return;
    }
  
    const event = events.find((e) => e.id === selectedEvent);
    if (!event) return;
  
    try {
      // Update scores using the RPC function
      await Promise.all([
        supabase.rpc("update_house_score", { house_id: positions.first, points: event.first_place_points }),
        supabase.rpc("update_house_score", { house_id: positions.second, points: event.second_place_points }),
        supabase.rpc("update_house_score", { house_id: positions.third, points: event.third_place_points }),
  
        // Insert score history
        supabase.from("score_history").insert([
          { house_id: positions.first, event_id: event.id, points: event.first_place_points, position: 1 },
          { house_id: positions.second, event_id: event.id, points: event.second_place_points, position: 2 },
          { house_id: positions.third, event_id: event.id, points: event.third_place_points, position: 3 }
        ])
      ]);
  
      // Wait a moment to ensure Supabase updates are processed
      await new Promise((resolve) => setTimeout(resolve, 500));
  
      // Re-fetch house scores to reflect updates
      const { data: updatedScores } = await supabase.from("houses").select("*").order("total_score", { ascending: false });
  
      setHouseScores(updatedScores || []);
  
      alert("Scores updated successfully!");
      setSelectedEvent(null);
      setPositions({ first: "", second: "", third: "" });
    } catch (error) {
      alert("Error updating scores: " + error.message);
    }
  };
  

  const isHouseSelected = (houseId) => Object.values(positions).includes(houseId)

  if (!session) return null

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Update Event Scores</h1>

          <div className="space-y-4">
            <div>
              <label className="block mb-2">Select Event</label>
              <Select value={selectedEvent} onValueChange={(value) => setSelectedEvent(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEvent && (
              <>
                {["first", "second", "third"].map((position) => (
                  <div key={position}>
                    <label className="block mb-2">{`${position.charAt(0).toUpperCase() + position.slice(1)} Place`}</label>
                    <Select
                      value={positions[position]}
                      onValueChange={(value) => setPositions((prev) => ({ ...prev, [position]: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select house" />
                      </SelectTrigger>
                      <SelectContent>
                        {houses.map((house) => (
                          <SelectItem
                            key={house.id}
                            value={house.id}
                            disabled={isHouseSelected(house.id) && positions.first === house.id}
                          >
                            {house.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <Button onClick={handleSubmit} className="w-full">
                  Update Scores
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Current House Standings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>House</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {houseScores.map((house) => (
                <TableRow key={house.id}>
                  <TableCell className="font-medium">{house.name}</TableCell>
                  <TableCell>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: house.color }} />
                  </TableCell>
                  <TableCell className="text-right">{house.total_score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
