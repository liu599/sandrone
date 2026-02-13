import React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'micro-app': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string;
        url?: string;
        baseroute?: string;
        inline?: boolean | string;
        destory?: boolean | string;
        'keep-alive'?: boolean | string;
        shadowDOM?: boolean | string;
        ssr?: boolean | string;
        'router-mode'?: string; // 补上你截图中用到的这个属性
        data?: any;
      };
    }
  }
}

// 针对某些特定的 TS/React 配置，如果上面不生效，尝试补充下面这段
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'micro-app': any; // 简单粗暴先看红线消不消失
    }
  }
}
