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
                    
                    {/* Info Cards Section */}
                    <div className="space-y-4 w-full">
                        {/* Services badges at the top */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Services</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(roadmapItem.Services) ? 
                                    roadmapItem.Services.map((service: string) => (
                                        <span key={service} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                            {service}
                                        </span>
                                    )) : 
                                    roadmapItem.Services && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                            {roadmapItem.Services}
                                        </span>
                                    )
                                }
                            </div>
                        </div>

                        {/* Info cards grid */}
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {/* Roadmap ID Card */}
                            <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow-md md:shadow-md p-4">
                                <a href={roadmapItem.Link} target="_blank" rel="noopener noreferrer">
                                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <h3 className="text-sm font-medium flex gap-1">
                                            Roadmap ID
                                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </h3>
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold">{params.id}</div>
                                    <p className="text-xs text-muted-foreground">View on Microsoft 365 Roadmap</p>
                                </a>
                            </div>

                            {/* Cloud Instance Card */}
                            <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow-md md:shadow-md p-4">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="text-sm font-medium">Cloud Instance(s)</h3>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    {roadmapItem.Categories?.filter((cat: string) => 
                                        cat.includes('Worldwide') || cat.includes('GCC') || cat.includes('DoD') || cat.includes('Standard Multi-Tenant')
                                    ).map((instance: string) => (
                                        <div key={instance} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                            {instance}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Platform Card */}
                            <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow-md md:shadow-md p-4">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="text-sm font-medium">Platform(s)</h3>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    {roadmapItem.Categories?.filter((cat: string) => 
                                        cat.includes('Desktop') || cat.includes('Web') || cat.includes('Mobile') || 
                                        cat.includes('Android') || cat.includes('iOS') || cat.includes('Mac') || cat.includes('Linux')
                                    ).map((platform: string) => (
                                        <div key={platform} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                            {platform}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Release Phase Card */}
                            <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow-md md:shadow-md p-4">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="text-sm font-medium">Release Phase(s)</h3>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    {roadmapItem.Categories?.filter((cat: string) => 
                                        cat.includes('In development') || cat.includes('Rolling out') || cat.includes('Launched') || 
                                        cat.includes('General Availability') || cat.includes('Preview') || cat.includes('Targeted Release')
                                    ).map((phase: string) => (
                                        <div key={phase} className={`px-2 py-1 rounded text-xs ${
                                            phase.includes('Launched') ? 'bg-green-100 text-green-800' :
                                            phase.includes('Rolling out') ? 'bg-yellow-100 text-yellow-800' :
                                            phase.includes('In development') ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {phase}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow-md md:shadow-md">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Description</h3>
                                <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: roadmapItem.Description }} />
                            </div>
                        </div>

                        {/* Date Information */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="overflow-hidden rounded-[0.5rem] border bg-background bg-slate-100 dark:bg-slate-700 shadow-md md:shadow-md">
                                <div className="p-4">
                                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Added to roadmap
                                    </h3>
                                    <p className="text-lg font-bold">{roadmapItem.PubDate}</p>
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-[0.5rem] border bg-background bg-slate-100 dark:bg-slate-700 shadow-md md:shadow-md">
                                <div className="p-4">
                                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Last modified
                                    </h3>
                                    <p className="text-lg font-bold">{roadmapItem.LastModifiedDateTime}</p>
                                </div>
                            </div>
                        </div>
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