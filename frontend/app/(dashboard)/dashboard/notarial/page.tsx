import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NOTARIAL_DISCLAIMER } from "@shared/constants/disclaimers";

export default function NotarialPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notarial Register</h1>
          <p className="text-muted-foreground">
            Digital notarial register per 2004 Rules on Notarial Practice (A.M. No. 02-8-13-SC).
          </p>
        </div>
        <Button>New Entry</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Entries This Month</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Weekly Cert Status</CardDescription>
            <CardTitle className="text-lg text-green-600">Up to date</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Commission Expiry</CardDescription>
            <CardTitle className="text-lg">Not configured</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notarial Register</CardTitle>
          <CardDescription>All notarial entries for the current commission period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No notarial entries yet.</p>
            <p className="text-sm mt-1">Click &quot;New Entry&quot; to add your first notarial act.</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{NOTARIAL_DISCLAIMER}</p>
    </div>
  );
}
