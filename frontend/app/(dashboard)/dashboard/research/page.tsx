"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LEGAL_DISCLAIMER } from "@shared/constants/disclaimers";

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    // TODO: Wire up to API
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Legal Research</h1>
        <p className="text-muted-foreground">
          Search Philippine case law, statutes, and legal provisions using natural language.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., What are the elements of estafa under Article 315 of the Revised Penal Code?"
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
          <CardDescription>Tips for effective legal research</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Ask questions in natural language, just as you would ask a colleague:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>&quot;What is the doctrine of command responsibility in Philippine law?&quot;</li>
            <li>&quot;Requirements for valid service of summons by publication&quot;</li>
            <li>&quot;Recent SC rulings on cyberlibel and Revised Penal Code Art. 355&quot;</li>
            <li>&quot;Grounds for annulment of marriage under the Family Code&quot;</li>
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{LEGAL_DISCLAIMER}</p>
    </div>
  );
}
