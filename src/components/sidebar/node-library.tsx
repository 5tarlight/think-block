import { useEffect, useMemo, useRef, useState } from "react";
import { TbChevronDown, TbChevronRight, TbPlus, TbSearch } from "react-icons/tb";
import {
  categoryLabels,
  categoryOrder,
  nodeCatalog,
  type NodeCategory,
  type NodeType,
} from "../../lib/node";

const defaultOpenCategories: NodeCategory[] = ["datasets"];

export default function NodeLibrary({
  onAddNode,
}: {
  onAddNode: (type: NodeType) => void;
}) {
  const [query, setQuery] = useState("");
  const [openCategories, setOpenCategories] = useState(
    () => new Set<NodeCategory>(defaultOpenCategories)
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => {
    const visibleCatalog = nodeCatalog.filter((item) => !item.hidden);
    const normalized = query.trim().toLowerCase();
    if (!normalized) return visibleCatalog;
    return visibleCatalog.filter((item) =>
      [
        item.label,
        item.signature,
        item.description,
        item.type,
        ...item.keywords,
      ]
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

  const toggleCategory = (category: NodeCategory) => {
    setOpenCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div className="node-library">
      <label className="library-search">
        <TbSearch aria-hidden="true" />
        <span className="sr-only">블록 검색</span>
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search torch, nn, optim…"
        />
        <kbd>/</kbd>
      </label>

      <div className="node-library__summary">
        <span>{filtered.length} blocks</span>
        <button
          type="button"
          onClick={() =>
            setOpenCategories((current) =>
              current.size === categoryOrder.length
                ? new Set()
                : new Set(categoryOrder)
            )
          }
        >
          {openCategories.size === categoryOrder.length ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="node-library__groups">
        {categoryOrder.map((category) => {
          const items = filtered.filter((item) => item.category === category);
          if (items.length === 0) return null;
          const expanded = query.trim().length > 0 || openCategories.has(category);
          const contentId = `node-category-${category}`;
          return (
            <section className="node-group" key={category}>
              <button
                className="node-group__title"
                type="button"
                onClick={() => toggleCategory(category)}
                aria-expanded={expanded}
                aria-controls={contentId}
              >
                {expanded ? <TbChevronDown /> : <TbChevronRight />}
                <span className={`category-mark category-mark--${category}`} />
                <h3>{categoryLabels[category]}</h3>
                <span>{items.length}</span>
              </button>
              {expanded && (
                <div className="node-group__items" id={contentId}>
                  {items.map((item) => (
                    <button
                      key={item.type}
                      className="library-node"
                      type="button"
                      onClick={() => onAddNode(item.type)}
                      title={`${item.signature} 블록 추가`}
                    >
                      <span>
                        <strong>{item.label}</strong>
                        <code>{item.signature}</code>
                        <small>{item.description}</small>
                      </span>
                      <TbPlus aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="library-empty">
            <strong>No matching blocks</strong>
            <span>PyTorch API 이름이나 설명으로 다시 검색해 보세요.</span>
          </div>
        )}
      </div>
    </div>
  );
}
