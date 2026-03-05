"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CITIZEN_NAVIGATOR_DISCLAIMER } from "@shared/constants/disclaimers";

export default function LegalNavigatorPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-16 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Legal Navigator</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Free AI-powered legal information for Filipino citizens
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Ask a Legal Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 text-sm">
                <p className="font-medium">Hello! I&apos;m the Bayanihan.AI Legal Navigator.</p>
                <p className="mt-2 text-muted-foreground">
                  I can help you understand Philippine laws, your rights, and legal procedures.
                  Ask me anything in English, Filipino, Cebuano, or Ilocano.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: Wire to API
                }}
                className="flex gap-2"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g., What are my rights if I get arrested?"
                  className="flex-1"
                />
                <Button type="submit">Send</Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <p className="font-medium">Know Your Rights</p>
              <p className="text-sm text-muted-foreground">
                Workers&apos; rights, tenant rights, consumer protection
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <p className="font-medium">Family Law</p>
              <p className="text-sm text-muted-foreground">Marriage, annulment, custody, support</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <p className="font-medium">Small Claims</p>
              <p className="text-sm text-muted-foreground">How to file, requirements, process</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <p className="font-medium">OFW Legal Help</p>
              <p className="text-sm text-muted-foreground">POEA, OWWA, labor disputes abroad</p>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground text-center">{CITIZEN_NAVIGATOR_DISCLAIMER}</p>
      </main>
      <Footer />
    </div>
  );
}
