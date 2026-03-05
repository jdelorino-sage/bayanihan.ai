import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Bayanihan.AI</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>AI Queries Today</CardDescription>
            <CardTitle className="text-3xl">0 / 5</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Free tier limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saved Cases</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">No cases saved yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documents</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">No documents created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Notarial Entries</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">No entries this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with Bayanihan.AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="/dashboard/research"
              className="block p-4 rounded-lg border hover:border-primary transition-colors"
            >
              <h3 className="font-semibold">AI Legal Research</h3>
              <p className="text-sm text-muted-foreground">
                Search Philippine case law and statutes using natural language
              </p>
            </a>
            <a
              href="/dashboard/drafting"
              className="block p-4 rounded-lg border hover:border-primary transition-colors"
            >
              <h3 className="font-semibold">Draft a Document</h3>
              <p className="text-sm text-muted-foreground">
                Generate legal documents from AI-powered templates
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
