"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-4 py-4 text-right">
        <Skeleton className="h-4 w-12 ml-auto" />
      </td>
      <td className="px-4 py-4 text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </td>
      <td className="px-4 py-4 text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </td>
      <td className="px-4 py-4 text-right">
        <Skeleton className="h-4 w-20 ml-auto" /> 
      </td>
      <td className="px-4 py-4 text-right">
        <Skeleton className="h-4 w-16 ml-auto mb-1" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </td>
      <td className="px-4 py-4 text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </td>
    </tr>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
};

export const WatchListItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex-1">
        <Skeleton className="h-5 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="text-right mr-4">
        <Skeleton className="h-5 w-20 mb-1" />
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-64 w-full" />  
    </div>
  );
};