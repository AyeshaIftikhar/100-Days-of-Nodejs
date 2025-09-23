import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Heart, Calendar } from 'lucide-react'
import type { Charity } from '@/types'
import { formatEther } from 'ethers'

interface CharityCardProps {
  charity: Charity
  onDonate: (charityId: bigint) => void
  onViewDetails: (charityId: bigint) => void
}

export function CharityCard({ charity, onDonate, onViewDetails }: CharityCardProps) {
  const raisedAmount = Number(formatEther(charity.raisedAmount))
  const targetAmount = Number(formatEther(charity.targetAmount))
  const progressPercentage = Math.min((raisedAmount / targetAmount) * 100, 100)

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="aspect-video rounded-lg overflow-hidden mb-2">
          <img
            src={charity.imageUrl || '/placeholder-charity.jpg'}
            alt={charity.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-charity.jpg'
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <Badge variant={charity.isVerified ? 'default' : 'secondary'}>
            {charity.isVerified ? 'Verified' : 'Pending'}
          </Badge>
          <Badge variant="outline">{charity.category}</Badge>
        </div>
        <CardTitle className="text-xl">{charity.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {charity.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Raised</span>
            <span className="font-medium">
              {raisedAmount.toFixed(4)} ETH / {targetAmount.toFixed(4)} ETH
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-center text-sm text-muted-foreground">
            {progressPercentage.toFixed(1)}% of goal reached
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(charity.createdAt)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onViewDetails(charity.id)}
        >
          View Details
        </Button>
        <Button 
          size="sm" 
          className="flex-1"
          onClick={() => onDonate(charity.id)}
          disabled={!charity.isActive}
        >
          <Heart className="h-4 w-4 mr-1" />
          Donate
        </Button>
      </CardFooter>
    </Card>
  )
}
