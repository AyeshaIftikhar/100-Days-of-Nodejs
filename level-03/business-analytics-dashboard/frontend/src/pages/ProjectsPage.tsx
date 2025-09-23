export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Manage and track your project progress
        </p>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold">Project List</h3>
          <div className="h-[400px] mt-4 flex items-center justify-center text-muted-foreground">
            Project management interface will be displayed here
          </div>
        </div>
      </div>
    </div>
  )
}
