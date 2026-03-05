import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const templates = [
  { name: "Demand Letter", description: "Generate a demand letter with AI assistance" },
  { name: "Affidavit", description: "Draft affidavits with guided AI prompts" },
  { name: "Contract", description: "Create contracts from customizable templates" },
  { name: "Legal Opinion", description: "Draft legal opinions with cited authorities" },
  { name: "Pleading", description: "Generate court pleadings and motions" },
  { name: "Deed of Sale", description: "Prepare deeds of sale with standard clauses" },
];

export default function DraftingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Drafting</h1>
        <p className="text-muted-foreground">AI-assisted legal document templates.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.name} className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
