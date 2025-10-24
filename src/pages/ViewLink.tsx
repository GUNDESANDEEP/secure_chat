import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, Copy } from "lucide-react";
import { toast } from "sonner";

const ViewLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (token) {
      fetchContent();
    }
  }, [token]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/retrieve-secure-link?token=${token}`;
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || 'Failed to retrieve link');
      } else {
        setContent(result.content);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Content copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Decrypting content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full glass-effect border-2 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20 mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Link Not Available</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Create New Link
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="p-8 max-w-2xl w-full glass-effect border-2">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Secure Message</h2>
          <p className="text-muted-foreground">
            This link has been accessed and is no longer available
          </p>
        </div>

        <div className="p-6 rounded-lg bg-muted/50 mb-6">
          <pre className="whitespace-pre-wrap break-words text-sm">{content}</pre>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleCopy} 
            className="flex-1"
            variant={copied ? "secondary" : "default"}
          >
            {copied ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Content
              </>
            )}
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="flex-1"
          >
            Create New Link
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ViewLink;
