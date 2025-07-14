export default function NotFound() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex gap-4 mt-4">
          <a 
            href="/" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Go Home
          </a>
          <a 
            href="/message" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Browse Messages
          </a>
        </div>
      </div>
    </section>
  )
}
