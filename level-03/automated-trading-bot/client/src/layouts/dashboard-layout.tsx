import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  BarChart3, 
  Settings, 
  Code2, 
  History, 
  Moon, 
  Sun, 
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

interface DashboardLayoutProps {
  user?: {
    name: string;
    email: string;
  };
}

const DashboardLayout = ({ user }: DashboardLayoutProps) => {
  const [expanded, setExpanded] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      path: '/strategies',
      name: 'Strategies',
      icon: <Code2 className="h-5 w-5" />,
    },
    {
      path: '/backtest',
      name: 'Backtest',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      path: '/trades',
      name: 'Trades',
      icon: <History className="h-5 w-5" />,
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={`bg-card border-r border-border transition-all duration-300 ease-in-out ${
          expanded ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h1 className={`font-bold text-xl transition-opacity duration-200 ${
              expanded ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'
            }`}>
              Trading Bot
            </h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="rounded-full"
            >
              {expanded ? <ChevronLeft /> : <ChevronRight />}
            </Button>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      location.pathname.startsWith(item.path)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    } ${expanded ? 'justify-start' : 'justify-center'}`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className={`ml-3 transition-opacity duration-200 ${
                      expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-border p-4">
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleTheme}
                className="w-full justify-start"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    <span className={`transition-opacity duration-200 ${
                      expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                    }`}>
                      Light Mode
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    <span className={`transition-opacity duration-200 ${
                      expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                    }`}>
                      Dark Mode
                    </span>
                  </>
                )}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className={`transition-opacity duration-200 ${
                  expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                }`}>
                  Logout
                </span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {menuItems.find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard'}
          </h2>
          {user && (
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-medium text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
