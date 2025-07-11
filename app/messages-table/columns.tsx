"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ColumnDef } from "@tanstack/react-table"

export type MessageView = {
  id: string
  title: string
  service: string[] | undefined
  lastUpdated: string | undefined
  isMajor: boolean
  type: 'message-center' | 'roadmap'
  link?: string
  description?: string
  category?: string[]
}

export const columns: ColumnDef<MessageView>[] = [
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <div className="text-center">Type</div>
      )
    },
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <div className="text-center">
          <span className={`px-2 py-1 rounded text-xs ${type === 'message-center' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {type === 'message-center' ? 'MC' : 'Roadmap'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <div>ID</div>
      )
    },
    cell: ({ row }) => {
      const displayId = row.original.id.startsWith('RM') ? row.original.id.replace('RM', '') : row.original.id;
      return (
        <div className="flex items-center gap-2">
          <span className="text-nowrap">{displayId}</span>
          {(row.original.isMajor &&
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="flex h-2 w-2 rounded-full bg-red-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Major change</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (<div>Title</div>)
    },
    cell: ({ row }) => {
      return (
        <div className="w-full">{row.original.title}</div>
      )
    },
  },
  {
    accessorKey: "service",
    header: ({ column }) => {
      return (
        <div className="text-center">
            Service
        </div>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="space-y-0.5 text-center">
          {row.original.service?.map((service) => (
            <Badge key={service} variant="secondary" className="text-nowrap">
              {service}
            </Badge>
          ))}
        </div>
      )
    },
    accessorFn: (row) => {
      // Convert the services array to a searchable string
      return row.service?.join(" ") || "";
    },
  },
  {
    accessorKey: "lastUpdated",
    header: ({ column }) => {
      return (
        <div className="text-nowrap">
          Last updated
        </div>
      )
    },
    cell: ({ row }) => {
      return (
        <span className="text-nowrap">{row.original.lastUpdated}</span>
      )
    },
  }
]
