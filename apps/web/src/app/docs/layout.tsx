import { Leftbar } from "@/components/LeftBar";
import ClientHeader from "@/components/ClientHeader";
import Footer from "@/components/Footer";
import DocsBackground from "@/components/DocsBackground";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#181825] flex flex-col overflow-hidden">
      <DocsBackground />
      
      <ClientHeader />
      
      <div className="relative flex-1 flex items-start gap-14 px-4 md:px-8 py-8 z-10">
        <Leftbar key="leftbar" />
        <div className="flex-[4] max-w-none w-full">{children}</div>
      </div>
      
      <Footer />
    </main>
  );
}