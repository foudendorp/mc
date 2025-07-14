"use client"

import { DataTable } from "@/app/messages-table/data-table"
import { MessageView, columns } from "@/app/messages-table/columns"
import { getAllCombinedItems } from "@/lib/messages"
import { useEffect, useState } from "react"

export default function ClientDataTable() {
  const [data, setData] = useState<MessageView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const combinedItems = getAllCombinedItems()
      
      const processedData = combinedItems.map((item): MessageView => ({
        id: item.id,
        title: item.title,
        service: item.service,
        lastUpdated: item.lastUpdated,
        isMajor: item.isMajor,
        type: item.type,
        link: undefined,
        description: undefined,
        category: undefined
      }))
      
      setData(processedData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg font-medium">Loading messages...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm text-red-600">{error}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Please refresh the page or contact support if this issue persists.
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={data} />
}
