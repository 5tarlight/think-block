import { useEffect, useMemo, useRef, useState } from "react";
import { TbPlus, TbSearch } from "react-icons/tb";
import {
  categoryLabels,
  nodeCatalog,
  type NodeCategory,
  type NodeType,
} from "../../lib/node";

const categoryOrder: NodeCategory[] = [
  "data",
  "preprocessing",
  "model",
  "evaluation",
  "statistics",
  "arithmetic",
  "output",
];

export default function NodeLibrary({
  onAddNode,
}: {
  onAddNode: (type: NodeType) => void;
}) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return nodeCatalog;
    return nodeCatalog.filter((item) =>
      [item.label, item.description, item.type, ...item.keywords]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (
        event.key !== "/" ||
        (event.target instanceof HTMLElement &&
          (event.target.isContentEditable ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)))
      ) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <div className="node-library">
      <label className="library-search">
        <TbSearch aria-hidden="true" />
        <span className="sr-only">블록 검색</span>
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="블록 이름이나 개념 검색"
        />
        <kbd>/</kbd>
      </label>

      <div className="node-library__groups">
        {categoryOrder.map((category) => {
          const items = filtered.filter((item) => item.category === category);
          if (items.length === 0) return null;
          return (
            <section className="node-group" key={category}>
              <div className="node-group__title">
                <span className={`category-mark category-mark--${category}`} />
                <h3>{categoryLabels[category]}</h3>
                <span>{items.length}</span>
              </div>
              <div className="node-group__items">
                {items.map((item) => (
                  <button
                    key={item.type}
                    className="library-node"
                    type="button"
                    onClick={() => onAddNode(item.type)}
                    title={`${item.label} 추가`}
                  >
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    <TbPlus aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="library-empty">
            <strong>일치하는 블록이 없어요</strong>
            <span>다른 개념이나 영문 이름으로 검색해 보세요.</span>
          </div>
        )}
      </div>
    </div>
  );
}
