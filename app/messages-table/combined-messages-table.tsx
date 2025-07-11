"use client"

import { DataTable } from "@/app/messages-table/data-table"
import { MessageView, columns } from "@/app/messages-table/columns";
import { getAllMessages, getFormattedDate } from "@/lib/messages";
import { fetchRoadmapData, getRoadmapServices } from "@/lib/roadmap";
import React, { useState, useEffect } from "react";

function getMessageCenterData(): MessageView[] {
    const dataMessages = getAllMessages();

    return dataMessages.map((item): MessageView => ({
        id: item.Id,
        title: item.Title,
        service: item.Services,
        lastUpdated: getFormattedDate(item.LastModifiedDateTime),
        isMajor: item.IsMajorChange ?? false,
        type: 'message-center',
        link: undefined,
        description: undefined,
        category: undefined
    }));
}

export default function CombinedMessagesTable() {
    const [data, setData] = useState<MessageView[]>(getMessageCenterData());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadRoadmapData() {
            try {
                const roadmapItems = await fetchRoadmapData();
                const roadmapData: MessageView[] = roadmapItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    service: getRoadmapServices(item.category),
                    lastUpdated: getFormattedDate(item.pubDate),
                    isMajor: false,
                    type: 'roadmap',
                    link: item.link,
                    description: item.description,
                    category: item.category
                }));

                // Combine message center and roadmap data
                const messageCenterData = getMessageCenterData();
                const combined = [...messageCenterData, ...roadmapData];
                
                // Sort by last updated date (newest first)
                combined.sort((a, b) => {
                    const dateA = new Date(a.lastUpdated || '1970-01-01');
                    const dateB = new Date(b.lastUpdated || '1970-01-01');
                    return dateB.getTime() - dateA.getTime();
                });

                setData(combined);
            } catch (error) {
                console.error('Failed to load roadmap data:', error);
                // Keep only message center data if roadmap fails
            } finally {
                setIsLoading(false);
            }
        }

        loadRoadmapData();
    }, []);

    return (
        <div className="">
            {isLoading && (
                <div className="text-center py-4 text-gray-500">
                    Loading roadmap data...
                </div>
            )}
            <DataTable columns={columns} data={data} />
        </div>
    )
}
