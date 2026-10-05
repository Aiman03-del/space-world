import SmoothScroll from "@/components/SmoothScroll";
import SpaceCanvasLoader from "@/components/SpaceCanvasLoader";

export default function Home() {
  return (
    <main>
      <SmoothScroll />

      <div className="fixed inset-0 z-0">
        <SpaceCanvasLoader />
      </div>

      <div className="relative z-10 h-[500vh]">
        <section className="flex h-screen items-center justify-center">
          <h1 className="text-5xl font-light tracking-[0.3em] text-white">
            SPACE WORLD
          </h1>
        </section>
      </div>
    </main>
  );
}