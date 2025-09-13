import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ShardVisualization from '@/components/ShardVisualization';
import api from '@/lib/api';
import { IShardStatistics, IPerformanceMetrics } from '@/types/api';

const Dashboard: React.FC = () => {
  const [activeCollection, setActiveCollection] = useState<string>('users');

  // Fetch shard statistics
  const { data: shardStats, isLoading: isLoadingStats } = useQuery<{ data: IShardStatistics }>({
    queryKey: ['shardStats'],
    queryFn: () => api.get('/shards/statistics'),
  });

  // Fetch performance metrics
  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery<{ data: IPerformanceMetrics }>({
    queryKey: ['performance', activeCollection],
    queryFn: () => api.get(`/shards/performance?collection=${activeCollection}`),
  });

  // Handle rebalance shards
  const handleRebalance = async () => {
    try {
      await api.post('/shards/rebalance');
      // Invalidate queries to refresh data
      // queryClient.invalidateQueries(['shardStats']);
      alert('Shard rebalancing initiated. This may take a few moments.');
    } catch (error) {
      console.error('Error rebalancing shards:', error);
      alert('Failed to rebalance shards. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Database Sharding Dashboard</h1>
        <Button onClick={handleRebalance}>Rebalance Shards</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? 'Loading...' : shardStats?.data.shardInfo.reduce((total, shard) => total + shard.documentCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all collections
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? 'Loading...' : shardStats?.data.shardInfo.filter(s => s.status === 'online').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {isLoadingStats ? '...' : shardStats?.data.shardInfo.length} total shards
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPerformance ? 'Loading...' : (
                Object.values(performanceData?.data.metrics.improvement || {}).reduce((sum, val) => sum + val, 0) / 
                Object.values(performanceData?.data.metrics.improvement || {}).length
              ).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to non-sharded setup
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shard Balance Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? 'Loading...' : '85%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Higher is better (more evenly distributed)
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="visualization" className="pt-4">
          <ShardVisualization 
            statistics={shardStats?.data} 
            performanceMetrics={performanceData?.data}
            isLoading={isLoadingStats || isLoadingPerformance} 
          />
        </TabsContent>
        <TabsContent value="configuration" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sharding Configuration</CardTitle>
              <CardDescription>
                Configure sharding strategies and parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Configuration options coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Shard Operation Logs</CardTitle>
              <CardDescription>
                Recent operations and changes to the sharded database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Log viewer coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
