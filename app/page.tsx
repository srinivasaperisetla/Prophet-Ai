import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-900">
      <Navbar />
      {/* <Hero /> */}
    </div>
  );
}
