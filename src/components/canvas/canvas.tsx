export default function Canvas({ ref }: { ref: React.Ref<HTMLCanvasElement> }) {
  return <canvas ref={ref} className="absolute inset-0" />;
}
