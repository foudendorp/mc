import { Message } from '@/types/message';
import dataMessages from '@/@data/messages.json'
import { fetchRoadmapData, getRoadmapServices, type RoadmapItem, type CombinedItem } from './roadmap';

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

export async function getAllCombinedItems(): Promise<CombinedItem[]> {
    // Get message center data
    const messageCenterItems: CombinedItem[] = dataMessages.map(msg => ({
        id: msg.Id,
        title: msg.Title,
        service: msg.Services,
        lastUpdated: getFormattedDate(msg.LastModifiedDateTime),
        isMajor: msg.IsMajorChange ?? false,
        type: 'message-center' as const
    }));

    // Get roadmap data
    const roadmapItems = await fetchRoadmapData();
    const roadmapCombinedItems: CombinedItem[] = roadmapItems.map(item => ({
        id: item.id,
        title: item.title,
        service: getRoadmapServices(item.category),
        lastUpdated: getFormattedDate(item.pubDate),
        isMajor: false, // Roadmap items are not "major changes" in the same sense
        type: 'roadmap' as const,
        link: item.link,
        description: item.description,
        category: item.category
    }));

    // Combine and sort by last updated date (newest first)
    const combined = [...messageCenterItems, ...roadmapCombinedItems];
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
