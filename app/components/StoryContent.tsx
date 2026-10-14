import React from "react";

/**
 * Renders TipTap/ProseMirror JSON produced by StoryEditor.
 * Styling lives in globals.css under `.story-prose`.
 */
function renderMarks(text: string, marks: any[] = []) {
  let result: React.ReactNode = text;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        result = <strong>{result}</strong>;
        break;

      case "italic":
        result = <em>{result}</em>;
        break;

      case "underline":
        result = <u>{result}</u>;
        break;

      case "strike":
        result = <s>{result}</s>;
        break;

      case "link":
        result = (
          <a
            href={mark.attrs?.href}
            target={
              mark.attrs?.target === "_blank" ? "_blank" : undefined
            }
            rel={
              mark.attrs?.target === "_blank"
                ? "noopener noreferrer"
                : undefined
            }
          >
            {result}
          </a>
        );
        break;

      case "textStyle":
        result = (
          <span
            style={{
              color: mark.attrs?.color || undefined,
              fontSize: mark.attrs?.fontSize || undefined,
            }}
          >
            {result}
          </span>
        );
        break;

      case "highlight":
        result = (
          <mark
            style={{
              backgroundColor: mark.attrs?.color || "#fff59d",
            }}
          >
            {result}
          </mark>
        );
        break;

      default:
        break;
    }
  }

  return result;
}

function renderChildren(node: any, key: string | number) {
  return node.content?.map((child: any, index: number) =>
    renderNode(child, `${key}-${index}`)
  );
}

function alignStyle(node: any): React.CSSProperties | undefined {
  const align = node.attrs?.textAlign;
  return align && align !== "left" ? { textAlign: align } : undefined;
}

export function renderNode(
  node: any,
  key: string | number
): React.ReactNode {
  if (!node) return null;

  switch (node.type) {
    case "text":
      return (
        <React.Fragment key={key}>
          {renderMarks(node.text || "", node.marks)}
        </React.Fragment>
      );

    case "paragraph":
      return (
        <p key={key} style={alignStyle(node)}>
          {renderChildren(node, key)}
        </p>
      );

    case "heading": {
      const level = node.attrs?.level || 1;
      const Tag = (level === 1 ? "h2" : level === 2 ? "h3" : "h4") as
        | "h2"
        | "h3"
        | "h4";

      return (
        <Tag key={key} style={alignStyle(node)}>
          {renderChildren(node, key)}
        </Tag>
      );
    }

    case "blockquote":
      return (
        <blockquote key={key}>{renderChildren(node, key)}</blockquote>
      );

    case "bulletList":
      return <ul key={key}>{renderChildren(node, key)}</ul>;

    case "orderedList":
      return <ol key={key}>{renderChildren(node, key)}</ol>;

    case "listItem":
      return <li key={key}>{renderChildren(node, key)}</li>;

    case "horizontalRule":
      return (
        <div key={key} className="story-prose-break" aria-hidden>
          ✦ ✦ ✦
        </div>
      );

    case "image":
      return (
        <figure
          key={key}
          style={{
            textAlign:
              node.attrs?.align === "left"
                ? "left"
                : node.attrs?.align === "right"
                ? "right"
                : "center",
          }}
        >
          <img
            src={node.attrs?.src}
            alt={node.attrs?.alt || ""}
            loading="lazy"
            style={{ width: node.attrs?.width || "auto" }}
          />

          {node.attrs?.title && (
            <figcaption>{node.attrs.title}</figcaption>
          )}
        </figure>
      );

    case "hardBreak":
      return <br key={key} />;

    default:
      return <div key={key}>{renderChildren(node, key)}</div>;
  }
}

export default function StoryContent({
  content,
  className = "",
  style,
}: {
  content: any;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`story-prose ${className}`} style={style}>
      {content?.content?.map((node: any, index: number) =>
        renderNode(node, index)
      )}
    </div>
  );
}

export function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      style={{ flexShrink: 0, display: "inline-block" }}
    >
      <defs>
        <linearGradient id="coin-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="1" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill="url(#coin-grad)" />
      <circle
        cx="12"
        cy="12"
        r="7.5"
        fill="none"
        stroke="#c97c00"
        strokeOpacity="0.55"
        strokeWidth="1.4"
      />
      <path
        d="M13.6 8.2h-2.4a2 2 0 0 0 0 4h1.6a2 2 0 0 1 0 4h-2.6M12 7v1.2M12 16.2v1.2"
        fill="none"
        stroke="#8a5200"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/** localStorage key for the last chapter a reader opened in a story. */
export function lastReadKey(storyId: string) {
  return `story:${storyId}:lastChapter`;
}
