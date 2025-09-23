import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Loader2 } from 'lucide-react';
import { useDonation } from '@/hooks/useWeb3';
import type { Charity } from '@/types';

interface DonationModalProps {
  charity: Charity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DonationModal({ charity, isOpen, onClose, onSuccess }: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { donate, isLoading, error } = useDonation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!charity || !amount) return;

    const result = await donate(charity.id, amount, message, isAnonymous);
    
    if (result.success) {
      onSuccess();
      onClose();
      setAmount('');
      setMessage('');
      setIsAnonymous(false);
    }
  };

  const handleClose = () => {
    onClose();
    setAmount('');
    setMessage('');
    setIsAnonymous(false);
  };

  if (!charity) return null;

  const progress = Number(charity.raisedAmount) / Number(charity.targetAmount) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Donate to {charity.name}
          </DialogTitle>
          <DialogDescription>
            Help make a difference by supporting this cause
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Charity Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Raised: {(Number(charity.raisedAmount) / 1e18).toFixed(4)} ETH</span>
              <span>Goal: {(Number(charity.targetAmount) / 1e18).toFixed(2)} ETH</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{progress.toFixed(1)}% funded</p>
          </div>

          {/* Donation Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Donation Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Leave an encouraging message..."
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked: boolean) => setIsAnonymous(checked === true)}
              />
              <Label htmlFor="anonymous" className="text-sm">
                Donate anonymously
              </Label>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !amount}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Donate {amount} ETH
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
