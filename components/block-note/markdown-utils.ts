/**
 * Markdown serialization / deserialization utilities for the BlockNote editor.
 */

export function parseMarkdownToBlocks(
  editor: any,
  markdown: string,
  assetsMapping: Record<string, string> = {},
): any[] {
  // Replace fileUuids with URLs for rendering
  const processedMarkdown = markdown.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)(?:\{([^}]*)\})?/g,
    (_, caption, identifier, attrStr) => {
      const url = assetsMapping[identifier] ?? identifier;
      return `![${caption}](${url})`;
    },
  );

  return editor.tryParseMarkdownToBlocks(processedMarkdown);
}

export function serializeBlocksToMarkdown(
  editor: any,
  blocks: any[],
): { markdown: string; assets: string[] } {
  const assets: string[] = [];
  const parts: string[] = [];

  for (const block of blocks) {
    if (block.type === 'image') {
      const { url = '', caption = '' } = block.props || {};
      parts.push(`![${caption}](${url})`);
    } else if (block.type === 'equation') {
      const { latex = '' } = block.props || {};
      parts.push(`$$${latex}$$`);
    } else {
      const md = editor.blocksToMarkdownLossy([block]);
      const trimmed = md.trim();
      if (trimmed) parts.push(trimmed);
    }
  }

  return { markdown: parts.join('\n\n'), assets };
}
