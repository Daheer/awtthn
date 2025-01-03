'use client';

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import { supabase } from "../supabaseClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, Suspense } from "react";
import { Loader } from "lucide-react"; // Placeholder for a loading spinner

const FormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  voterId: z.string().min(1, { message: "Voter ID is required." }),
  candidate: z.string().min(1, { message: "Please select a candidate." }),
  pin: z.string().min(4, { message: "Pin must be at least 4 characters." }),
});

function formatPosition(str: string) {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
}

const organizationColor = "#cfa83a";

export default function InputForm() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  return (
    <Suspense fallback={<Loader />}>
      <InputFormWithParams
        candidates={candidates}
        loadingCandidates={loadingCandidates}
        submitting={submitting}
        setCandidates={setCandidates}
        setLoadingCandidates={setLoadingCandidates}
        setSubmitting={setSubmitting}
        toast={toast}
      />
    </Suspense>
  );
}

function InputFormWithParams({
  candidates,
  loadingCandidates,
  submitting,
  setCandidates,
  setLoadingCandidates,
  setSubmitting,
  toast,
}: {
  candidates: any[];
  loadingCandidates: boolean;
  submitting: boolean;
  setCandidates: React.Dispatch<React.SetStateAction<any[]>>;
  setLoadingCandidates: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
}) {
  const searchParams = useSearchParams();
  const position = searchParams.get('position');

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('position', position);
      if (error) {
        console.error("Error fetching candidates:", error.message);
      } else {
        setCandidates(data);
      }
      setLoadingCandidates(false);
    };
    fetchCandidates();
  }, [position]);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", voterId: "", candidate: "", pin: "" },
  });

  const onSubmit = async (data: { name: string; voterId: string; candidate: string; pin: string }) => {
    setSubmitting(true);
    const { name, voterId, candidate, pin } = data;

    const { data: pinData, error: pinError } = await supabase
      .from('voters')
      .select('pin')
      .eq('voter_id', voterId)
      .maybeSingle();

    if (pinError) {
      console.error("Error verifying pin:", pinError.message);
      toast({ title: "Error", description: "Failed to verify your pin." });
      setSubmitting(false);
      return;
    }

    if (!pinData || pinData.pin !== pin) {
      toast({
        title: "Invalid Pin",
        description: "The pin you entered is incorrect.",
      });
      setSubmitting(false);
      return;
    }

    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_id', voterId)
      .eq('candidate', candidate)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST100') {
      console.error("Error checking vote:", checkError.message);
      toast({ title: "Error", description: "Failed to verify your voting status." });
      setSubmitting(false);
      return;
    }

    if (existingVote) {
      toast({
        title: "Duplicate Vote",
        description: "You have already voted for this position.",
      });
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('votes')
      .insert([{ voter_id: voterId, candidate }]);

    if (insertError) {
      console.error("Error inserting vote:", insertError.message);
      toast({ title: "Error", description: "Failed to submit your vote." });
    } else {
      toast({
        title: "Vote Submitted",
        description: "Your vote has been successfully recorded.",
      });
      form.reset();
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl" style={{ borderColor: organizationColor }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Cast Your Vote for the {formatPosition(position!)}'s Office
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} className="shadow-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="voterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Voter ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your Voter ID" {...field} className="shadow-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Pin</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your Pin" {...field} className="shadow-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="candidate"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="font-medium text-lg">Select Your Candidate</FormLabel>
                    <FormControl>
                      {loadingCandidates ? (
                        <div className="flex justify-center items-center py-4">
                          <Loader className="text-gray-500 w-8 h-8" />
                        </div>
                      ) : (
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          {candidates.map((candidate) => (
                            <FormItem key={candidate.id}>
                              <FormControl>
                                <label
                                  htmlFor={candidate.id}
                                  className={`relative block rounded-lg border-2 p-4 hover:border-yellow-400 ${
                                    field.value === candidate.name ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                                  } transition-all duration-200 cursor-pointer ${
                                    form.formState.errors.candidate ? 'border-red-500' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <RadioGroupItem
                                        value={candidate.name}
                                        id={candidate.id}
                                        className="sr-only"
                                      />
                                      <img src={candidate.image} alt={candidate.name} className="w-24 h-24 rounded-xl object-cover mb-4" />
                                    </div>
                                    <div className="ml-4 text-right">
                                      <div className="font-semibold text-lg">{candidate.name}</div>
                                      <div className="text-sm text-gray-500">{formatPosition(candidate.position)}</div>
                                    </div>
                                  </div>
                                </label>
                              </FormControl>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="outline" className="w-full bg-yellow-500 border-black-400 py-6 text-lg" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Vote"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
