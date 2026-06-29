"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    toast({ title: "Settings saved", description: "Your configuration has been updated." });
  };

  const handleTest = async (service: string) => {
    setIsTesting(service);
    // Simulate test
    await new Promise((r) => setTimeout(r, 1500));
    setIsTesting(null);
    toast({ title: `${service} Connection`, description: "Connection successful." });
  };

  const HealthIndicator = ({ status }: { status: "good" | "warning" | "error" }) => (
    <div className={`h-2.5 w-2.5 rounded-full ${status === "good" ? "bg-green-500" : status === "warning" ? "bg-yellow-500" : "bg-red-500"}`} />
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your AI-Ready Data Platform configuration.</p>
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="data">Data Platform</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Azure OpenAI <HealthIndicator status="good" /></CardTitle>
              <CardDescription>Configure your GPT and embedding models.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Input id="endpoint" defaultValue="https://openai-eastus.api.cognitive.microsoft.com/" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="gpt-deployment">GPT Deployment Name</Label>
                  <Input id="gpt-deployment" defaultValue="gpt-4o" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="embed-deployment">Embedding Deployment Name</Label>
                  <Input id="embed-deployment" defaultValue="text-embedding-ada-002" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTest("Azure OpenAI")} disabled={isTesting === "Azure OpenAI"}>
                {isTesting === "Azure OpenAI" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Azure Databricks <HealthIndicator status="good" /></CardTitle>
                <CardDescription>Configure data processing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="workspace">Workspace URL</Label>
                  <Input id="workspace" defaultValue="https://adb-123456789.12.azuredatabricks.net" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="catalog">Unity Catalog</Label>
                  <Input id="catalog" defaultValue="aiready" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => handleTest("Databricks")}>Test Connection</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Azure AI Search <HealthIndicator status="good" /></CardTitle>
                <CardDescription>Configure vector database.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="search-service">Service Name</Label>
                  <Input id="search-service" defaultValue="macro-search-service" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="index">Index Name</Label>
                  <Input id="index" defaultValue="macro-knowledge-index" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => handleTest("AI Search")}>Test Connection</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}