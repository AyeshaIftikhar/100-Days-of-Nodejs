import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { strategyAPI, marketAPI, tradeAPI } from '@/services/api'
import { BarChart, LineChart, Wallet, Landmark, ArrowUp, ArrowDown, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const DashboardPage = () => {
  const [activeStrategies, setActiveStrategies] = useState(0)
  const [totalTrades, setTotalTrades] = useState(0)
  const [pnl, setPnl] = useState(0)
  const [winRate, setWinRate] = useState(0)

  // Fetch strategies
  const { data: strategiesData } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategyAPI.getStrategies(),
  })

  // Fetch trades
  const { data: tradesData } = useQuery({
    queryKey: ['trades'],
    queryFn: () => tradeAPI.getTrades({}),
  })

  useEffect(() => {
    if (strategiesData?.data) {
      setActiveStrategies(strategiesData.data.filter((s: any) => s.isActive).length)
    }

    if (tradesData?.data) {
      const trades = tradesData.data
      setTotalTrades(trades.length)
      
      // Calculate P&L and win rate
      if (trades.length > 0) {
        const totalPnl = trades.reduce((sum: number, trade: any) => sum + (trade.pnl || 0), 0)
        setPnl(totalPnl)
        
        const closedTrades = trades.filter((t: any) => t.status === 'closed')
        const winningTrades = closedTrades.filter((t: any) => (t.pnl || 0) > 0)
        
        if (closedTrades.length > 0) {
          setWinRate((winningTrades.length / closedTrades.length) * 100)
        }
      }
    }
  }, [strategiesData, tradesData])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/strategies/create">Create Strategy</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStrategies}</div>
            <p className="text-xs text-muted-foreground">
              {strategiesData?.data ? strategiesData.data.length : 0} Total Strategies
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={pnl >= 0 ? "text-green-500" : "text-red-500"}>
                {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} USD
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {pnl >= 0 ? <ArrowUp className="inline h-3 w-3 text-green-500" /> : <ArrowDown className="inline h-3 w-3 text-red-500" />}
              {" "}{Math.abs(pnl).toFixed(2)} USD
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              Last trade {tradesData?.data?.length > 0 ? new Date(tradesData.data[0].createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Based on {totalTrades} total trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active-strategies">Active Strategies</TabsTrigger>
          <TabsTrigger value="recent-trades">Recent Trades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Bot Overview</CardTitle>
              <CardDescription>
                Your automated trading performance at a glance
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              {/* This would be a chart in a real application */}
              <p className="text-muted-foreground">Chart visualization would be here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active-strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Strategies</CardTitle>
              <CardDescription>
                Strategies currently running and trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              {strategiesData?.data?.filter((s: any) => s.isActive).length > 0 ? (
                <div className="space-y-4">
                  {strategiesData.data
                    .filter((s: any) => s.isActive)
                    .map((strategy: any) => (
                      <div key={strategy._id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <h3 className="font-medium">{strategy.name}</h3>
                          <p className="text-sm text-muted-foreground">{strategy.market} - {strategy.timeframe}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/strategies/${strategy._id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active strategies</p>
                  <Button asChild>
                    <Link to="/strategies/create">Create Strategy</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent-trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>
                Latest automated trading activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tradesData?.data?.length > 0 ? (
                <div className="space-y-4">
                  {tradesData.data.slice(0, 5).map((trade: any) => (
                    <div key={trade._id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h3 className="font-medium">{trade.symbol}</h3>
                        <p className="text-sm text-muted-foreground">
                          {trade.direction.toUpperCase()} - {new Date(trade.entryTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={trade.pnl >= 0 ? "text-green-500" : "text-red-500"}>
                          {trade.pnl >= 0 ? "+" : ""}{trade.pnl?.toFixed(2) || "0.00"} USD
                        </p>
                        <p className="text-xs text-muted-foreground">{trade.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No trades yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DashboardPage
