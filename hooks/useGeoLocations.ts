"use client"

import { useCallback, useMemo } from "react"
import { globalApi } from "@/store/global.api"
import type { CommonQuery } from "@/store/global.type"
import type { SelectOption } from "@/components/common/select/AsyncSelect"

export type GeoKind = "division" | "district" | "upazila"

export interface GeoRefItem {
  id: string
  name: string
  bn_name?: string
}

interface GeoEndpoint {
  url: string
  parentParam?: "division_id" | "district_id"
}

const LIST_ENDPOINTS: Record<GeoKind, GeoEndpoint> = {
  division: { url: "/locations/divisions" },
  district: { url: "/locations/districts", parentParam: "division_id" },
  upazila: { url: "/locations/upazilas", parentParam: "district_id" },
}

const toSelectOption = (item: GeoRefItem): SelectOption => ({
  label: item.bn_name ? `${item.name} (${item.bn_name})` : item.name,
  value: item.id,
})

/**
 * Fetches one geo list (optionally scoped to a parent id) and exposes it as
 * selectable options. No per-keystroke server search — the result is cached
 * by RTK Query and shared across every consumer.
 */
export const useGeoList = (kind: GeoKind, parentId?: string) => {
  const endpoint = LIST_ENDPOINTS[kind]
  const queryArgs = useMemo<CommonQuery & { url: string }>(() => {
    const args: CommonQuery & { url: string } = { url: endpoint.url }
    if (endpoint.parentParam && parentId) {
      args[endpoint.parentParam] = parentId
    }
    return args
  }, [endpoint, parentId])

  const { data, isLoading } = globalApi.useGetDataQuery(queryArgs)
  const raw = useMemo<GeoRefItem[]>(
    () => (data?.data ?? []) as GeoRefItem[],
    [data?.data]
  )

  const options = useMemo(() => raw.map(toSelectOption), [raw])

  const rawByValue = useMemo(
    () => new Map(raw.map((item) => [item.id, item])),
    [raw]
  )

  return { raw, options, rawByValue, isLoading }
}

/**
 * Loads all three geo lists and exposes id → item maps plus stable name
 * getters, so any consumer (form selects, tables, detail pages) can resolve
 * stored `*_id` values without duplicating fetches or label logic.
 */
export const useGeoLocations = () => {
  const divisions = useGeoList("division")
  const districts = useGeoList("district")
  const upazilas = useGeoList("upazila")

  const divisionById = useMemo(
    () => new Map(divisions.raw.map((item) => [item.id, item])),
    [divisions.raw]
  )
  const districtById = useMemo(
    () => new Map(districts.raw.map((item) => [item.id, item])),
    [districts.raw]
  )
  const upazilaById = useMemo(
    () => new Map(upazilas.raw.map((item) => [item.id, item])),
    [upazilas.raw]
  )

  const getDivisionName = useCallback(
    (id?: string) => (id ? (divisionById.get(id)?.name ?? id) : ""),
    [divisionById]
  )
  const getDistrictName = useCallback(
    (id?: string) => (id ? (districtById.get(id)?.name ?? id) : ""),
    [districtById]
  )
  const getUpazilaName = useCallback(
    (id?: string) => (id ? (upazilaById.get(id)?.name ?? id) : ""),
    [upazilaById]
  )

  return {
    divisionOptions: divisions.options,
    districtOptions: districts.options,
    upazilaOptions: upazilas.options,
    divisionById,
    districtById,
    upazilaById,
    getDivisionName,
    getDistrictName,
    getUpazilaName,
    isLoading: divisions.isLoading || districts.isLoading || upazilas.isLoading,
  }
}
