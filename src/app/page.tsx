import SmoothScroll from "@/components/SmoothScroll";
import SpaceCanvasLoader from "@/components/SpaceCanvasLoader";
import Intro from "@/components/intro/Intro";

export default function Home() {
  return (
    <main>
      <SmoothScroll />

      <div className="fixed inset-0 z-0">
        <SpaceCanvasLoader />
      </div>

      <Intro />

      <div className="relative z-10 h-[500vh]">
        <section className="h-screen" />
      </div>
    </main>
  );
}