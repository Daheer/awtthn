'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from "@/components/ui/table";
import { Loader } from 'lucide-react';

function formatPosition(str: String) {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
}

export default function ResultsPage() {
  const [electionData, setElectionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElectionData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          position,
          name,
          votes (
            voter_id
          )
        `);

      if (error) {
        console.error("Error fetching election data:", error.message);
      } else {
        const groupedData = data.reduce((acc, candidate) => {
          if (!acc[candidate.position]) {
            acc[candidate.position] = [];
          }
          acc[candidate.position].push({
            name: candidate.name,
            votes: candidate.votes.length,
          });
          return acc;
        }, [] as any[]);

        setElectionData(groupedData);
      }
      setLoading(false);
    };

    fetchElectionData();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Election Results</h1>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-10 h-10 text-gray-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(electionData).map(([position, candidates]) => (
            <Card className="bg-white shadow-md rounded-lg p-4" key={position}>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">{formatPosition(position)}'s Office</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Table className="w-full border">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="bg-gray-200 text-gray-700">Candidate Name</TableHead>
                      <TableHead className="bg-gray-200 text-gray-700">Vote Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate: { name: string; votes: number }) => (
                      <TableRow key={candidate.name} className="even:bg-gray-50">
                        <TableCell className="p-3">{candidate.name}</TableCell>
                        <TableCell className="p-3">{candidate.votes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="flex justify-center mt-10">
        <Button variant="outline" onClick={() => window.location.reload()}>Refresh Data</Button>
      </div>
    </div>
  );
}
