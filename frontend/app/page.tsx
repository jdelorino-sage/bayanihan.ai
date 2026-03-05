import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="container py-24 md:py-32 space-y-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            AI-Powered Legal Technology
            <br />
            <span className="text-primary">for the Philippines</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Research Supreme Court decisions, draft legal documents, manage notarial registers, and
            navigate Philippine law — all powered by AI built specifically for Filipino legal professionals.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="/legal-navigator">
              <Button size="lg" variant="outline">
                Try Legal Navigator
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container py-16 md:py-24">
          <h2 className="text-3xl font-bold text-center mb-12">Built for Philippine Legal Practice</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Legal Research</CardTitle>
                <CardDescription>
                  Search SC, CA, and CTA decisions with natural language. Get cited answers with confidence scores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Powered by RAG over 500K+ Philippine court decisions with verified citations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Drafting</CardTitle>
                <CardDescription>
                  Generate contracts, pleadings, and legal opinions using AI-assisted templates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Templates built on Philippine legal standards and Supreme Court circulars.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notarial Suite</CardTitle>
                <CardDescription>
                  Digital notarial register compliant with the 2004 Rules on Notarial Practice.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Auto-numbering, weekly certs, monthly Clerk of Court reports, commission tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Legal Navigator</CardTitle>
                <CardDescription>
                  Free AI chatbot helping Filipino citizens understand their legal rights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Available in English, Filipino, Cebuano, and Ilocano. Connects users to PAO/IBP aid.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="container py-16 md:py-24 text-center">
          <h2 className="text-3xl font-bold mb-4">Accessible Pricing for Every Filipino</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            From free citizen access to comprehensive firm plans. Student discounts available.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For citizens</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">PHP 0</p>
                <p className="text-sm text-muted-foreground mt-2">5 AI queries/day</p>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>For lawyers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">PHP 2,499</p>
                <p className="text-sm text-muted-foreground mt-2">200 AI queries/day</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Firm</CardTitle>
                <CardDescription>For law firms</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">PHP 4,999</p>
                <p className="text-sm text-muted-foreground mt-2">Unlimited queries</p>
              </CardContent>
            </Card>
          </div>
          <Link href="/pricing" className="inline-block mt-8">
            <Button variant="outline">View All Plans</Button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
