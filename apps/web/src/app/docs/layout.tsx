import { Leftbar } from "@/components/LeftBar";
import ClientHeader from "@/components/ClientHeader";
import Footer from "@/components/Footer";
import DocsBackground from "@/components/DocsBackground";
import { headers } from "next/headers";

export default async function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const header_url = headersList.get('x-url') || "";

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#181825] flex flex-col overflow-hidden">
      <DocsBackground />
      
      <ClientHeader />
      
      <div className="relative flex-1 flex items-start gap-14 px-4 md:px-8 py-8 z-10">
        <Leftbar key="leftbar" pathname={header_url} />
        <div className="flex-[4] max-w-none w-full">{children}</div>
      </div>
      
      <Footer />
    </main>
  );
}