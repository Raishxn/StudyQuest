import { Suspense } from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { QuickStats } from './components/QuickStats';
import { WeeklyQuests } from './components/WeeklyQuests';
import { WeeklyActivityChart } from './components/WeeklyActivityChart';
import { RecentForumActivity } from './components/RecentForumActivity';
import { FriendsRankingTop3 } from './components/FriendsRankingTop3';
import { RecentBankUploads } from './components/RecentBankUploads';

// Generic skeleton for error boundary / suspense fallbacks at the page level if needed
function SectionSkeleton({ heightClass = "h-[350px]" }: { heightClass?: string }) {
    return (
        <div className={`bg-background-surface border border-border-subtle rounded-xl p-6 shadow-sm w-full ${heightClass} animate-pulse flex flex-col`}>
            <div className="h-6 bg-background-elevated rounded w-1/3 mb-6"></div>
            <div className="flex-1 bg-background-base rounded-lg mt-2"></div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">

            {/* 1. HEADER (Welcome, XP Bar, Streak) */}
            <DashboardHeader />

            {/* 2. QUICK STATS (4 cards) */}
            <QuickStats />

            {/* 3. MIDDLE GRID (Chart + Quests) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Side: Activity Chart (takes up 2 columns on desktop) */}
                <div className="lg:col-span-2 flex flex-col">
                    <Suspense fallback={<SectionSkeleton />}>
                        <WeeklyActivityChart />
                    </Suspense>
                </div>

                {/* Right Side: Weekly Quests (1 column) */}
                <div className="flex flex-col">
                    <Suspense fallback={<SectionSkeleton />}>
                        <WeeklyQuests />
                    </Suspense>
                </div>

            </div>

            {/* 4. BOTTOM GRID (Forum, Ranking, Bank) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* Column 1: Forum */}
                <Suspense fallback={<SectionSkeleton heightClass="h-[400px]" />}>
                    <RecentForumActivity />
                </Suspense>

                {/* Column 2: Friends Ranking */}
                <Suspense fallback={<SectionSkeleton heightClass="h-[400px]" />}>
                    <FriendsRankingTop3 />
                </Suspense>

                {/* Column 3: Recent Uploads */}
                <Suspense fallback={<SectionSkeleton heightClass="h-[400px]" />}>
                    <RecentBankUploads />
                </Suspense>

            </div>

        </div>
    );
}
