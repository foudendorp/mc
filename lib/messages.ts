import { Message } from '@/types/message';
import dataMessages from '@/@data/messages.json'
import roadmapData from '@/@data/roadmap.json'

const messages: Message[] = dataMessages;

export function getAllMessageIds(): { id: string }[] {
    return dataMessages.map((item) => {
        return {
            id: item.Id,
        };
    });
}

export function getAllMessages(): Message[] {
    return dataMessages;
}

export function getAllRoadmapItems() {
    return roadmapData || [];
}

export function getAllCombinedItems() {
    const messageCenterItems = dataMessages.map(msg => ({
        id: msg.Id,
        title: msg.Title,
        service: msg.Services,
        lastUpdated: getFormattedDate(msg.LastModifiedDateTime),
        isMajor: msg.IsMajorChange ?? false,
        type: 'message-center' as const
    }));

    const roadmapItems = getAllRoadmapItems().map((item: any) => ({
        id: item.Id,
        title: item.Title,
        service: item.Services || ['Microsoft 365 Roadmap'],
        lastUpdated: getFormattedDate(item.PubDate),
        isMajor: false,
        type: 'roadmap' as const,
        link: item.Link,
        description: item.Description,
        category: item.Categories
    }));

    // Combine and sort by last updated date (newest first)
    const combined = [...messageCenterItems, ...roadmapItems];
    return combined.sort((a, b) => {
        const dateA = new Date(a.lastUpdated || '1970-01-01');
        const dateB = new Date(b.lastUpdated || '1970-01-01');
        return dateB.getTime() - dateA.getTime();
    });
}

export function getMessageData(id: string): Message | undefined{
    const message = messages.find((item) => item.Id === id);
    return message;
}

export function getMessageSummary(msg: Message | undefined): string {    
    const summary = msg?.Details?.find((item) => item.Name === "Summary");
    return summary?.Value?.toString() || "";
}

export function getMessageRoadmapID(msg: Message | undefined): string {    
    const roadmapId = msg?.Details?.find((item) => item.Name === "RoadmapIds");
    return roadmapId?.Value?.toString() || "";
}

export function getMessagePlatforms(msg: Message | undefined): string {    
    const platforms = msg?.Details?.find((item) => item.Name === "Platforms");
    return platforms?.Value?.toString() || "";
}


export function getFormattedDate(dateInput: string | undefined | null): string {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();

    return `${month} ${day}, ${year}`;
  }
