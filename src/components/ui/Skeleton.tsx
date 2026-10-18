import React from 'react';

interface SkeletonProps {
    count?: number;
    className?: string;
}

export function CardSkeleton() {
    return (
        <div className="flex flex-col animate-pulse">
            {/* Poster Shimmer with 2:3 Aspect Ratio */}
            <div className="w-full aspect-[2/3] rounded-xl bg-zinc-200 dark:bg-zinc-900 border border-zinc-300/80 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-10 h-5 bg-zinc-300 dark:bg-zinc-800/80 rounded-md"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
            {/* Title & Metadata Shimmer */}
            <div className="pt-2 px-0.5 space-y-1.5">
                <div className="h-3.5 bg-zinc-300 dark:bg-zinc-800/70 rounded w-3/4"></div>
                <div className="flex justify-between items-center pt-0.5">
                    <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800/40 rounded w-1/4"></div>
                    <div className="h-3 bg-zinc-300 dark:bg-zinc-800/50 rounded w-8"></div>
                </div>
            </div>
        </div>
    );
}

const Skeleton: React.FC<SkeletonProps> = ({ count = 10, className = '' }) => {
    return (
        <div className={`w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <CardSkeleton key={index} />
            ))}
        </div>
    );
};

export default Skeleton;