/**
 * Custom BlockNote image block with simple URL support.
 */
import React from 'react';

export const customImagePropSchema = {
  textAlignment: { default: 'center' as const },
  backgroundColor: { default: 'transparent' as const },
  name: { default: '' as const },
  url: { default: '' as const },
  caption: { default: '' as const },
} as const;

/** Renders the <img> element. */
const ImagePreview = ({ block }: { block: any }) => {
  const { url, caption, name } = block.props as any;
  return (
    <img
      className="bn-visual-media"
      src={url}
      alt={caption || name || 'image'}
      contentEditable={false}
      draggable={false}
      style={{ display: 'block', maxWidth: '100%', borderRadius: '8px' }}
    />
  );
};

/** Wrapper component for image block. */
const ImageBlockRender = (props: any) => {
  const { block } = props;

  return (
    <div
      style={{
        padding: '8px 0',
        textAlign: block.props?.textAlign || 'center',
      }}
    >
      <ImagePreview block={block} />
    </div>
  );
};

export const customImageBlockConfig = {
  type: 'image' as const,
  propSchema: customImagePropSchema,
  content: 'none' as const,
  isFileBlock: true,
};

export const createCustomImageBlockSpec = (createReactBlockSpec: any) => {
  return createReactBlockSpec(customImageBlockConfig, {
    meta: { fileBlockAccept: ['image/*'] },
    render: (props: any) => <ImageBlockRender {...props} />,
    parse: (element: HTMLElement) => {
      if (element.tagName === 'IMG') {
        return {
          url: (element as HTMLImageElement).src || '',
          caption: element.getAttribute('alt') || '',
          name: element.getAttribute('alt') || '',
          textAlignment: 'center',
        };
      }
      return undefined;
    },
  });
};

export const customImageBlockSpec = customImageBlockConfig;
