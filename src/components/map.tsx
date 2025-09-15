'use client'
import { memo } from "react";
import dynamic from "next/dynamic";
import 'leaflet/dist/leaflet.css';
import type { MapViewProps } from './map-view';
import { Skeleton } from "./ui/skeleton";

// Dynamically import the MapView component with SSR disabled
const MapView = dynamic(() => import('@/components/map-view'), { 
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />
});

export const Map = memo(function Map(props: MapViewProps) {
  return <MapView {...props} />;
});
