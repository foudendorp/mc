import { getAllCombinedItems } from '@/lib/messages'

export default function IndexPage() {
  let data = []
  let error = null

  try {
    const combinedItems = getAllCombinedItems()
    data = combinedItems
  } catch (err) {
    console.error('Error loading data:', err)
    error = 'Failed to load messages'
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          Microsoft 365 Message Center Archive
        </h1>
        <p className="text-lg text-muted-foreground">
          This site is an archive of Microsoft 365 Message Center messages for quick reference.
        </p>
      </div>

      <div className="">
        {error ? (
          <div className="rounded-md border p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Found {data.length} messages
            </div>
            <div className="grid gap-2">
              {data.slice(0, 10).map((item, index) => (
                <div key={index} className="rounded border p-3">
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.service} • {item.type} • {new Date(item.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {data.length > 10 && (
                <div className="text-center text-sm text-muted-foreground">
                  ...and {data.length - 10} more messages
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
