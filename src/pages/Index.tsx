import LinkGenerator from "@/components/LinkGenerator";

const Index = () => {
  return (
    <main className="min-h-screen">
      <header>
        <h1 className="sr-only">SecureLink - Encrypted One-Time Link Generator</h1>
      </header>
      <LinkGenerator />
    </main>
  );
};

export default Index;

