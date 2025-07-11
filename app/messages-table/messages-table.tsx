
import { DataTable } from "@/app/messages-table/data-table"
import { MessageView, columns } from "@/app/messages-table/columns";
import { getAllCombinedItems } from "@/lib/messages";
import { CombinedItem } from "@/lib/roadmap";
import { use } from "react";

async function getData(): Promise<MessageView[]> {
    const combinedItems = await getAllCombinedItems();

    return combinedItems.map((item: CombinedItem): MessageView => ({
        id: item.id,
        title: item.title,
        service: item.service,
        lastUpdated: item.lastUpdated,
        isMajor: item.isMajor,
        type: item.type,
        link: item.link,
        description: item.description,
        category: item.category
    }));
}

export default function MessagesTable2() {
    const data = use(getData());

    return (
        <div className="">
            <DataTable columns={columns} data={data} />
        </div>
    )
}