import { useEffect, useState } from "react";
import { useGPUStore } from "../../store/gpuStore";

declare global {
  interface GPUAdapter {
    info?: {
      vendor?: string;
      architecture?: string;
      device?: string;
      description?: string;
      subgroupMaxSize?: number;
      subgroupMinSize?: number;
      isFallbackAdapter?: boolean;
    };
  }

  interface GPURequestAdapterOptions {
    powerPreference?: "low-power" | "high-performance";
    forceFallbackAdapter?: boolean;
  }

  interface Navigator {
    gpu?: any & {
      wgslLanguageFeatures?: Set<string>;
      getPreferredCanvasFormat?: () => string;
      requestAdapter?: (
        opts?: GPURequestAdapterOptions
      ) => Promise<GPUAdapter | null>;
    };
  }
}

export default function GPUSelector() {
  const { isAvailable, current, setCurrent, setAvailability } = useGPUStore();
  const [vendor, setVendor] = useState<string | null>(null);
  const [architecture, setArchitecture] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!navigator.gpu) {
        setAvailability(false);
        setCurrent("cpu");
        return;
      }

      const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter({
        powerPreference: "high-performance",
      });

      if (!adapter) {
        setAvailability(false);
        setCurrent("cpu");
        return;
      }

      // 일부 브라우저만 info 노출
      const info = (adapter as GPUAdapter).info ?? {};
      setVendor(info.vendor ?? "unknown");
      setArchitecture(info.architecture ?? "unknown");

      setAvailability(true);
    })();
  }, [setAvailability, setCurrent]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as "cpu" | "gpu";
    if (v === "gpu" && !isAvailable) {
      setCurrent("cpu");
      return;
    }
    setCurrent(v);
  };

  const value: "cpu" | "gpu" =
    isAvailable && (current === "cpu" || current === "gpu") ? current : "cpu";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-neutral-300">Hardware</label>
      <select
        className="bg-neutral-800 text-white border border-neutral-700 rounded px-2 py-1"
        value={value}
        onChange={handleChange}
      >
        <option value="cpu">CPU</option>
        <option value="gpu" disabled={!isAvailable}>
          {isAvailable
            ? `GPU ${vendor ?? ""}${architecture ? ` (${architecture})` : ""}`
            : "GPU (Not available)"}
        </option>
      </select>
    </div>
  );
}
