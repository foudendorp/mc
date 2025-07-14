import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-center text-center gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-muted-foreground">404</h1>
          <h2 className="text-3xl font-bold">Page Not Found</h2>
          <p className="text-lg text-muted-foreground max-w-[600px]">
            The page you're looking for doesn't exist or may have been moved. 
            Let's get you back on track.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            ← Go Home
          </Link>
          <Link 
            href="/message" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Browse Messages
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>If you think this is an error, please contact support.</p>
        </div>
      </div>
    </section>
  )
}
