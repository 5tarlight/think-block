import { useWinStore } from "../../store/windowStore";
import WindowView from "./window-view";

export default function WindowContainer() {
  const { windows, contents } = useWinStore();

  return windows.map((win) => (
    <WindowView key={win.id} window={win}>
      {contents[win.id]}
    </WindowView>
  ));
}
