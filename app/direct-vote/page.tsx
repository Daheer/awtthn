'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import { Loader } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

function formatPosition(str: String) {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
}

export default function DirectVote() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*');

      if (error) {
        console.error("Error fetching candidates:", error.message);
      } else {
        setCandidates(data);
      }
      setLoading(false);
    };
    fetchCandidates();
  }, []);

  const handleVote = async (candidate: any) => {
    const { error } = await supabase
      .from('votes')
      .insert([{ candidate_id: candidate.id }]);

    if (error) {
      console.error("Error casting vote:", error.message);
      toast({ title: "Error", description: "Failed to cast your vote." });
    } else {
      toast({ title: "Vote Cast", description: "Your vote has been successfully recorded." });
      setShowModal(true);
      setSelectedCandidate(candidate);
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
                  <Button variant="outline" onClick={() => handleVote(candidate)}>Vote</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {showModal && (
        <Modal open={showModal} onOpenChange={setShowModal}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Vote Confirmation</ModalTitle>
            </ModalHeader>
            <ModalDescription>
              Your vote for {selectedCandidate?.name} has been recorded.
            </ModalDescription>
            <ModalFooter>
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
