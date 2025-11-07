import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Copy, Check, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const LinkGenerator = () => {
  const [content, setContent] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState("60");
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content to encrypt");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-secure-link', {
        body: {
          content: content.trim(),
          expiresInMinutes: parseInt(expiresInMinutes),
        },
      });

      if (error) throw error;

      const linkUrl = `${window.location.origin}/view/${data.accessToken}`;
      setGeneratedLink(linkUrl);
      toast.success("Secure link generated successfully!");
    } catch (error) {
      console.error('Error generating link:', error);
      toast.error("Failed to generate secure link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setContent("");
    setGeneratedLink("");
    setCopied(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="p-8 glass-effect border-2">
        {!generatedLink ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="content" className="text-lg mb-2 block">
                Secret Message
              </Label>
              <Textarea
                id="content"
                placeholder="Enter your sensitive information here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] text-base"
              />
            </div>

            <div>
              <Label htmlFor="expiration" className="text-lg mb-2 block">
                Link Expiration
              </Label>
              <Select value={expiresInMinutes} onValueChange={setExpiresInMinutes}>
                <SelectTrigger id="expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                  <SelectItem value="10080">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading || !content.trim()}
              className="w-full h-14 text-lg glow-effect"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-5 w-5" />
                  Generate Secure Link
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Link Generated!</h3>
              <p className="text-muted-foreground">
                Share this link securely. It can only be accessed once.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 break-all">
              <p className="text-sm font-mono">{generatedLink}</p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleCopy} 
                className="flex-1 h-12"
                variant={copied ? "secondary" : "default"}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button 
                onClick={handleReset} 
                variant="outline"
                className="flex-1 h-12"
              >
                Create Another
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LinkGenerator;
