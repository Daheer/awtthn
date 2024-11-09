"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DayOne() {
    const router = useRouter();
    const organizationColor = "#cfa83a";

    const handleVoteClick = (position: string) => {
        router.push(`/vote?position=${encodeURIComponent(position)}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 space-y-8">
            {/* Organization Card */}
            <Card className="w-full max-w-lg border" style={{ borderColor: organizationColor }}>
                <CardHeader>
                    <img src="/logo.jpeg" alt="Organization Logo" className="w-36 h-36 mx-auto mb-4 pointer-events-none" />
                    <CardTitle className="text-center text-2xl font-bold">
                        Association of Women Traditional Title Holders in Nigeria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-center">
                        Empowering communities, enriching lives
                    </CardDescription>
                </CardContent>
            </Card>

            {/* Day One Title */}
            <h1 className="text-3xl font-bold text-center">
                 <span className='text-gray-400'>Election</span> Day Three
            </h1>

            {/* Voting Buttons */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                <Button
                    variant="outline"
                    className="p-4 md:p-8 text-lg w-full md:w-auto border"
                    style={{
                        borderColor: organizationColor,
                    }}
                    onClick={() => handleVoteClick('financial-secretary')}
                >
                    Vote for Financial Secretary
                </Button>
                <Button
                    variant="outline"
                    className="p-4 md:p-8 text-lg w-full md:w-auto border"
                    style={{
                        borderColor: organizationColor,
                    }}
                    onClick={() => handleVoteClick('treasurer')}
                >
                    Vote for Treasurer
                </Button>
            </div>
        </div>
    );
}
