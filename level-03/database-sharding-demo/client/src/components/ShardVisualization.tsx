import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { IShardStatistics, IPerformanceMetrics } from '@/types/api';

interface ShardVisualizationProps {
  statistics?: IShardStatistics;
  performanceMetrics?: IPerformanceMetrics;
  isLoading: boolean;
}

const ShardVisualization: React.FC<ShardVisualizationProps> = ({ 
  statistics, 
  performanceMetrics,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-10 bg-gray-200 rounded" />
            <CardContent className="h-64 bg-gray-100 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!statistics || !performanceMetrics) {
    return <div>No data available</div>;
  }

  // Prepare data for the shard distribution chart
  const distributionData = Object.entries(statistics.shardDistribution).map(([collection, shards]) => {
    return {
      name: collection,
      ...Object.entries(shards).reduce((acc, [shardName, { count }]) => {
        acc[shardName] = count;
        return acc;
      }, {} as Record<string, number>),
    };
  });

  // Prepare data for the performance comparison chart
  const performanceData = [
    {
      name: 'Find By ID',
      sharded: performanceMetrics.metrics.shardedQueries.findById,
      nonSharded: performanceMetrics.metrics.nonShardedQueries.findById,
    },
    {
      name: 'Find By Range',
      sharded: performanceMetrics.metrics.shardedQueries.findByRange,
      nonSharded: performanceMetrics.metrics.nonShardedQueries.findByRange,
    },
    {
      name: 'Aggregation',
      sharded: performanceMetrics.metrics.shardedQueries.aggregation,
      nonSharded: performanceMetrics.metrics.nonShardedQueries.aggregation,
    },
  ];

  // Prepare data for improvement percentages
  const improvementData = [
    {
      name: 'Find By ID',
      improvement: performanceMetrics.metrics.improvement.findById,
    },
    {
      name: 'Find By Range',
      improvement: performanceMetrics.metrics.improvement.findByRange,
    },
    {
      name: 'Aggregation',
      improvement: performanceMetrics.metrics.improvement.aggregation,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Shard Distribution Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Data Distribution Across Shards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="shard1" fill="#8884d8" name="US Shard" />
                <Bar dataKey="shard2" fill="#82ca9d" name="EU Shard" />
                <Bar dataKey="shard3" fill="#ffc658" name="Asia Shard" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Comparison Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Query Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sharded" fill="#4f46e5" name="Sharded Query" />
                <Bar dataKey="nonSharded" fill="#ef4444" name="Non-Sharded Query" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Improvement Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={improvementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Improvement %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="improvement" 
                  fill="#10b981" 
                  stroke="#059669" 
                  name="% Improvement" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Shard Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shard Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics.shardInfo.map((shard) => (
              <div key={shard.shardId} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{shard.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {shard.documentCount.toLocaleString()} documents
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className={`h-3 w-3 rounded-full ${
                      shard.status === 'online' 
                        ? 'bg-green-500' 
                        : shard.status === 'rebalancing' 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`} 
                  />
                  <span className="text-sm capitalize">{shard.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShardVisualization;
