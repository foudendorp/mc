"use client"

import { DataTable } from "@/app/messages-table/data-table"
import { MessageView, columns } from "@/app/messages-table/columns";
import { getAllCombinedItems } from "@/lib/messages";

// Memoized data processing function to optimize performance
function getData(): MessageView[] {
    const combinedItems = getAllCombinedItems();

    return combinedItems.map((item): MessageView => ({
        id: item.id,
        title: item.title,
        service: item.service,
        lastUpdated: item.lastUpdated,
        isMajor: item.isMajor,
        type: item.type,
        link: undefined,
        description: undefined,
        category: undefined
    }));
}

export default function MessagesTable2() {
    const data = getData();

    return (
        <div className="">
            <DataTable columns={columns} data={data} />
        </div>
    )
}