import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Heart, Wallet, Plus, Users, Target, TrendingUp } from 'lucide-react'
import { CharityCard } from '@/components/CharityCard'
import { DonationModal } from '@/components/DonationModal'
import { useWeb3, useCharities, useCharityStats } from '@/hooks/useWeb3'
import type { Charity } from '@/types'

function App() {
  const { isConnected, account, connectWallet, error: walletError } = useWeb3()
  const { charities, loadCharities } = useCharities()
  const { totalRaised, totalCharities, totalDonors } = useCharityStats()
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null)
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)

  const handleDonate = (charityId: bigint) => {
    if (!isConnected) {
      connectWallet()
      return
    }
    
    const charity = charities.find(c => c.id === charityId)
    if (charity) {
      setSelectedCharity(charity)
      setIsDonationModalOpen(true)
    }
  }

  const handleViewDetails = (charityId: bigint) => {
    // TODO: Implement view details functionality
    console.log('View details for charity:', charityId)
  }

  const handleDonationSuccess = () => {
    loadCharities() // Refresh charities data
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">CharityDAO</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Explore
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Create Campaign
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Dashboard
              </a>
            </nav>
            
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </Badge>
                <Button variant="outline" size="sm">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connected
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet}>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
          
          {/* Display wallet connection errors */}
          {walletError && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive text-destructive rounded text-sm">
              {walletError}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Transparent Charity
            <br />
            <span className="text-primary">On Blockchain</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Donate with confidence. Track every contribution. Ensure your impact reaches those who need it most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              <Heart className="h-5 w-5 mr-2" />
              Start Donating
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              <Plus className="h-5 w-5 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-3xl font-bold">{parseFloat(totalRaised).toFixed(2)} ETH</CardTitle>
                <CardDescription>Total Raised</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-3xl font-bold">{totalCharities}</CardTitle>
                <CardDescription>Active Campaigns</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-3xl font-bold">{totalDonors}</CardTitle>
                <CardDescription>Generous Donors</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Featured Campaigns</h3>
            <p className="text-lg text-muted-foreground">
              Discover impactful projects that need your support
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {charities.map((charity) => (
              <CharityCard
                key={charity.id.toString()}
                charity={charity}
                onDonate={handleDonate}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              View All Campaigns
            </Button>
          </div>
        </div>
      </section>

      {/* Donation Modal */}
      <DonationModal
        charity={selectedCharity}
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        onSuccess={handleDonationSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">CharityDAO</span>
              </div>
              <p className="text-muted-foreground">
                Building a transparent and decentralized future for charitable giving.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">How it Works</a></li>
                <li><a href="#" className="hover:text-foreground">Create Campaign</a></li>
                <li><a href="#" className="hover:text-foreground">Browse</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Discord</a></li>
                <li><a href="#" className="hover:text-foreground">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 CharityDAO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
