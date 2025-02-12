import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"

async function getHouses() {
  const { data: houses } = await supabase.from("houses").select("*").order("total_score", { ascending: false })
  return houses
}

async function getScoreHistory() {
  const { data: history } = await supabase
    .from("score_history")
    .select(`
      *,
      houses (name),
      events (name)
    `)
    .order("created_at", { ascending: false })
    .limit(10)
  return history
}

export default async function Home() {
  const houses = await getHouses()
  const history = await getScoreHistory()

  return (
    <main className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center">House Scores</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {houses?.map((house) => (
          <Card key={house.id} className={`bg-${house.color}-100`}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold">{house.name}</h2>
              <p className="text-4xl font-bold mt-2">{house.total_score}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Updates</h2>
        <div className="space-y-2">
          {history?.map((entry) => (
            <div key={entry.id} className="p-4 bg-gray-100 rounded-lg">
              <p>
                {entry.houses.name} received {entry.points} points for placing {entry.position} in {entry.events.name}
              </p>
              <p className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

