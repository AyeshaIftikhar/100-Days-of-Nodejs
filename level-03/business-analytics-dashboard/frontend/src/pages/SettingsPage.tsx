export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold">Account Settings</h3>
          <div className="h-[400px] mt-4 flex items-center justify-center text-muted-foreground">
            Settings configuration interface will be displayed here
          </div>
        </div>
      </div>
    </div>
  )
}
