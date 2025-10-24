import { Shield, Lock, Clock } from "lucide-react";
import heroImage from "@/assets/hero-security.jpg";

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Image Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass-effect">
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-sm">End-to-End Encrypted</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Share Secrets
          <br />
          <span className="gradient-text">Securely & Once</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Generate encrypted one-time links for sensitive information. 
          Your data is automatically deleted after being viewed or expired.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 px-6 py-3 rounded-full glass-effect">
            <Shield className="w-5 h-5 text-primary" />
            <span>AES-256 Encryption</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full glass-effect">
            <Lock className="w-5 h-5 text-primary" />
            <span>One-Time Access</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full glass-effect">
            <Clock className="w-5 h-5 text-primary" />
            <span>Auto-Expiration</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
