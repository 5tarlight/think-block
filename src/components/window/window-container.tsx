import { useWinStore } from "../../store/windowStore";
import WindowView from "./window-view";

export default function WindowContainer() {
  const { windows } = useWinStore();

  return (
    <div>
      {windows.map((win) => (
        <WindowView key={win.id} window={win} />
      ))}
    </div>
  );
}
