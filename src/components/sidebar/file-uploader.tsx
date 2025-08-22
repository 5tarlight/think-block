import cn from "@yeahx4/cn";
import FileItem from "./file-item";

export default function FileUploader() {
  const files: { name: string; size: number }[] = [
    { name: "data.csv", size: 123 },
    { name: "image.png", size: 456 },
    { name: "document.txt", size: 789 },
  ];

  return (
    <div className="flex flex-col mt-16 gap-2">
      <div className="flex justify-between">
        <span className="text-sm">Files</span>
        <button className="text-sm text-blue-500 hover:underline">
          Upload
        </button>
      </div>
      <div
        className={cn(
          "flex flex-col border-neutral-700 border p-1 rounded-sm gap-1",
          "min-h-32 max-h-64 overflow-y-auto overflow-x-hidden"
        )}
      >
        {files.length > 0 ? (
          files.map((file) => (
            <FileItem key={file.name} name={file.name} size={file.size} />
          ))
        ) : (
          <div className="text-white/50 italic text-sm text-center">
            No Files.
          </div>
        )}
      </div>
    </div>
  );
}
