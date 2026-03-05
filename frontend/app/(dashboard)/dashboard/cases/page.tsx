import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Management</h1>
          <p className="text-muted-foreground">Track your cases, hearings, and deadlines.</p>
        </div>
        <Button>New Case</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Cases</CardTitle>
          <CardDescription>All your active cases and matters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No cases yet.</p>
            <p className="text-sm mt-1">Click &quot;New Case&quot; to start tracking a matter.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
