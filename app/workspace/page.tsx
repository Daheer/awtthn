'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Candidate {
  id: number;
  name: string;
  position: string;
}

function formatPosition(str: string): string {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function DirectVote() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [voteInProgress, setVoteInProgress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*');

      if (error) {
        console.error("Error fetching candidates:", error.message);
        toast({
          title: "Error",
          description: "Failed to fetch candidates. Please try again later.",
          variant: "destructive"
        });
      } else {
        setCandidates(data || []);
      }
      setLoading(false);
    };
    fetchCandidates();
  }, [toast]);

  const handleVote = async (candidate: Candidate) => {
    setVoteInProgress(true);
    try {
      const { error } = await supabase
        .from('votes')
        .insert([{ 
          candidate: candidate.name,
          voter_id: null, 
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: `Your vote for ${candidate.name} has been recorded.`,
        variant: "default"
      });
      
      setDialogOpen(false);
    } catch (error) {
      console.error("Error casting vote:", error.message);
      toast({
        title: "Error",
        description: "Failed to cast your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVoteInProgress(false);
      setSelectedCandidate(null);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">Direct Vote</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-10 h-10 text-gray-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {candidates.map(candidate => (
            <Card className="bg-white shadow-md rounded-lg p-4" key={candidate.id}>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">{formatPosition(candidate.position)}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{candidate.name}</h2>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        Vote
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Your Vote</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to vote for {selectedCandidate?.name} as {selectedCandidate ? formatPosition(selectedCandidate.position) : ''}?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-4 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDialogOpen(false);
                            setSelectedCandidate(null);
                          }}
                          disabled={voteInProgress}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => selectedCandidate && handleVote(selectedCandidate)}
                          disabled={voteInProgress}
                        >
                          {voteInProgress ? (
                            <>
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Confirm Vote'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}