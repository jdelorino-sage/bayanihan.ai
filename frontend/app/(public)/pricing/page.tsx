import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    description: "For citizens seeking legal information",
    price: "PHP 0",
    period: "forever",
    features: [
      "5 AI queries per day",
      "Legal Navigator chatbot",
      "Basic search",
      "English & Filipino",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Student",
    description: "For law students",
    price: "PHP 499",
    period: "/month",
    features: [
      "50 AI queries per day",
      "Full case database access",
      "Citation analysis",
      "Document templates (basic)",
      "Valid .edu email required",
    ],
    cta: "Start Student Plan",
    highlighted: false,
  },
  {
    name: "Professional",
    description: "For practicing lawyers",
    price: "PHP 2,499",
    period: "/month",
    features: [
      "200 AI queries per day",
      "Full case & statute database",
      "Advanced citation analysis",
      "Document drafting suite",
      "Case management",
      "API access",
    ],
    cta: "Start Professional",
    highlighted: true,
  },
  {
    name: "Firm",
    description: "For law firms",
    price: "PHP 4,999",
    period: "/month",
    features: [
      "Unlimited AI queries",
      "Everything in Professional",
      "Team management (up to 10)",
      "Notarial register suite",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Start Firm Plan",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Accessible legal technology for every Filipino
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.highlighted ? "border-primary shadow-lg" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
