export default function Canvas({ ref }: { ref: React.Ref<HTMLCanvasElement> }) {
  return (
    <div className="absolute text-white z-10 w-full h-full">
      <canvas ref={ref} className="absolute inset-0 w-full h-full z-10" />
    </div>
  );
}
