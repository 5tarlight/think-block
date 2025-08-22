export default function Canvas({ ref }: { ref: React.Ref<HTMLCanvasElement> }) {
  return <canvas ref={ref} className="absolute w-full h-full z-10" />;
}
