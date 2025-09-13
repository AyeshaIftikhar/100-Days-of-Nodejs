import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sharding">Sharding</TabsTrigger>
          <TabsTrigger value="mongodb">MongoDB</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>General settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sharding" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sharding Configuration</CardTitle>
              <CardDescription>Configure sharding strategies and parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Sharding Strategies</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the sharding strategy for each collection
                </p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium">Users</h4>
                      <p className="text-sm text-muted-foreground">Current: Hash-based</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Products</h4>
                      <p className="text-sm text-muted-foreground">Current: Range-based</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Transactions</h4>
                      <p className="text-sm text-muted-foreground">Current: Geographic</p>
                    </div>
                  </div>
                  
                  <Button disabled>Update Sharding Strategy</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mongodb" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>MongoDB Configuration</CardTitle>
              <CardDescription>Configure MongoDB connection settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>MongoDB configuration settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
