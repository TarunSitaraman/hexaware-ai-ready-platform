"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BrainCircuit, Database, FileText, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MOCK_CHUNKS = [
  { id: "chk-1", text: "In 2024, United States GDP grew by 2.4%, driven by strong consumer spending and tech sector investments despite elevated interest rates of 5.25%.", score: 0.92 },
  { id: "chk-2", text: "Eurozone inflation cooled to 2.8% in Q1 2024, allowing the ECB to consider initial rate cuts. However, German industrial output remained sluggish.", score: 0.85 },
  { id: "chk-3", text: "Japan's core CPI rose 2.6% year-on-year in March, maintaining above the BOJ's 2% target for the 24th consecutive month.", score: 0.78 },
  { id: "chk-4", text: "UK unemployment ticked up to 4.2% while wage growth slowed, signaling a cooling labor market that aligns with Bank of England projections.", score: 0.71 },
];

export default function EmbeddingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(MOCK_CHUNKS);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    
    if (!q) {
      setResults(MOCK_CHUNKS);
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setResults(MOCK_CHUNKS.filter(c => c.text.toLowerCase().includes(q.toLowerCase())));
      setIsSearching(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vector Embeddings</h1>
        <p className="text-muted-foreground">Manage and query AI-ready text chunks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chunks</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48,100</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embedding Model</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sm mt-1">text-embedding-ada-002</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dimensions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,536</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Tokens/Chunk</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">312</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vector Search Explorer</CardTitle>
          <CardDescription>Test semantic search against your embedded macro data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search concepts (e.g. 'US inflation trends')..." 
              className="pl-9 h-10"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <ScrollArea className="h-[400px] border rounded-md p-4">
            {isSearching ? (
              <div className="text-center text-muted-foreground py-8 animate-pulse">Searching vectors...</div>
            ) : results.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No matching chunks found.</div>
            ) : (
              <div className="space-y-4">
                {results.map((chunk, i) => (
                  <div key={chunk.id} className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                        {chunk.id}
                      </Badge>
                      {searchQuery && (
                        <Badge variant={chunk.score > 0.8 ? "default" : "secondary"}>
                          Score: {chunk.score.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{chunk.text}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}