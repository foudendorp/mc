import { Metadata, ResolvingMetadata } from "next"
import { getAllMessageIds, getMessageSummary, getRoadmapData, getMessageData, getAllRoadmapItems } from "@/lib/messages"
import MessageDetail from "@/app/message/[id]/components/message-detail";

type Props = {
    params: { id: string }
  }

export default function Page({ params }: Props) {
    const isRoadmapId = params.id.startsWith('RM');
    
    if (isRoadmapId) {
        const roadmapItem = getRoadmapData(params.id);
        
        if (!roadmapItem) {
            return (
                <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
                    <div className="flex flex-col items-start gap-2">
                        <h1 className="text-3xl font-extrabold md:text-4xl">
                            Roadmap Item Not Found
                        </h1>
                        <p>The roadmap item with ID {params.id} could not be found.</p>
                    </div>
                </section>
            );
        }
        
        return (
            <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
                <div className="flex flex-col items-start gap-2">
                    <h1 className="text-3xl font-extrabold md:text-4xl">
                        {params.id} - {roadmapItem.Title}
                    </h1>
                    <div className="prose max-w-none">
                        <p><strong>Description:</strong> {roadmapItem.Description}</p>
                        <p><strong>Published:</strong> {roadmapItem.PubDate}</p>
                        <p><strong>Categories:</strong> {roadmapItem.Categories?.join(', ')}</p>
                        <p><strong>Services:</strong> {Array.isArray(roadmapItem.Services) ? roadmapItem.Services.join(', ') : roadmapItem.Services}</p>
                        {roadmapItem.Link && (
                            <p><strong>Link:</strong> <a href={roadmapItem.Link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View on Microsoft 365 Roadmap</a></p>
                        )}
                    </div>
                </div>
            </section>
        );
    } else {
        const msg = getMessageData(params.id);

        return (
            <>
                <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
                    <div className="flex flex-col items-start gap-2">
                        <h1 className="text-3xl font-extrabold md:text-4xl">
                        {msg?.Id} - {msg?.Title}</h1>

                            <MessageDetail id={params.id} />

                    </div>
                </section >
            </>
        )
    }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
  ): Promise<Metadata> {
    const isRoadmapId = params.id.startsWith('RM');
    
    if (isRoadmapId) {
        const roadmapItem = getRoadmapData(params.id);
        return {
            title: params.id + " - " + (roadmapItem?.Title || 'Roadmap Item'),
            description: roadmapItem?.Description || ""
        }
    } else {
        const msg = getMessageData(params.id);
        //get message summary if summary is empty the return detail
        var summary = getMessageSummary(msg);
        if(summary === ""){
            summary = msg?.Body?.Content || "";
        }

        return {
            title: msg?.Id + " - " + msg?.Title,
            description: summary
        }
    }
  }
  
export async function generateStaticParams() {
    const messagePaths = getAllMessageIds();
    
    // Add roadmap item paths
    const roadmapItems = getAllRoadmapItems();
    const roadmapPaths = roadmapItems.map((item: any) => {
        let roadmapId = 'roadmap-unknown';
        if (item.Link && item.Link.match(/id=(\d+)/)) {
            roadmapId = `RM${item.Link.match(/id=(\d+)/)[1]}`;
        } else if (item.Id && !item.Id.includes('System.Xml.XmlElement')) {
            roadmapId = item.Id;
        }
        return { id: roadmapId };
    });
    
    return [...messagePaths, ...roadmapPaths];
}