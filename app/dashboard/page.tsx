'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from "@/components/ui/table";
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function formatPosition(str: String) {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
}

export default function AdminDashboard() {
  const [electionData, setElectionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [closedPositions, setClosedPositions] = useState<string[]>(["president", "vice-president", "secretary-general", "national-assistant-secretary-general"]);
   // "treasurer", "financial-secretary"
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
      } else {
        setUser(user);
        await fetchElectionData();
        await fetchClosedPositions();
      }
    };
    checkUser();
  }, [router]);

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
          voters: candidate.votes.map(vote => vote.voter_id).filter(voter => voter !== null)
        });
        return acc;
      }, [] as any[]);

      setElectionData(groupedData);
    }
    setLoading(false);
  };

  const fetchClosedPositions = async () => {
    const { data, error } = await supabase
      .from('closed_positions')
      .select('position');

    if (error) {
      console.error("Error fetching closed positions:", error.message);
    } else {
      setClosedPositions(data.map((item: { position: string }) => item.position));
    }
  };

  const handleClosePosition = async (position: string) => {
    const { error } = await supabase
      .from('closed_positions')
      .insert([{ position }]);

    if (error) {
      console.error("Error closing position:", error.message);
    } else {
      setClosedPositions([...closedPositions, position]);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Admin Election Dashboard</h1>
        <Button variant="outline" onClick={handleLogout} className="bg-yellow-500/90" disabled={loggingOut}>
          {loggingOut ? <Loader className="animate-spin mr-2" /> : "Logout"}
        </Button>
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
                {closedPositions.includes(position) ? (
                  <div className="text-gray-500 italic">Election closed for this position.</div>
                ) : (
                  <Table className="w-full border">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-gray-200 text-gray-700">Candidate Name</TableHead>
                        <TableHead className="bg-gray-200 text-gray-700">Vote Count</TableHead>
                        <TableHead className="bg-gray-200 text-gray-700">Voters (IDs)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.map((candidate: { name: string; votes: number; voters: string[] }) => (
                        <TableRow key={candidate.name} className="even:bg-gray-50">
                          <TableCell className="p-3">{candidate.name}</TableCell>
                          <TableCell className="p-3">{candidate.votes}</TableCell>
                          <TableCell className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {candidate.voters.slice(0, 5).map((voter, index) => (
                                <span key={index} className="inline-block bg-gray-200 rounded-sm px-5 py-2 text-sm font-medium text-gray-700">
                                  {voter}
                                </span>
                              ))}
                              {candidate.voters.length > 5 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="outline">...</Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="flex flex-wrap gap-2">
                                        {candidate.voters.map((voter, index) => (
                                          <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                                            {voter}
                                          </span>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
