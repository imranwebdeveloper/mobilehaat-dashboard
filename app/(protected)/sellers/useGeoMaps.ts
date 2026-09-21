"use client"
import { useGeoLocations } from "@/hooks/useGeoLocations"

/**
 * Backward-compatible wrapper exposing id -> name maps for the sellers module.
 * Backed by the shared `useGeoLocations` hook (single fetch source).
 */
export const useGeoMaps = () => useGeoLocations()
