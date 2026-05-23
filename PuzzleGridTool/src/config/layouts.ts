import { Layout, Rect } from '@/types';

const createRect = (x: number, y: number, width: number, height: number): Rect => ({
  x, y, width, height
});

export const layouts: Layout[] = [
  {
    id: 'grid_3x3',
    name: '九宫格',
    description: '3x3 等分布局',
    minImages: 1,
    maxImages: 9,
    slots: [
      createRect(0, 0, 1/3, 1/3),
      createRect(1/3, 0, 1/3, 1/3),
      createRect(2/3, 0, 1/3, 1/3),
      createRect(0, 1/3, 1/3, 1/3),
      createRect(1/3, 1/3, 1/3, 1/3),
      createRect(2/3, 1/3, 1/3, 1/3),
      createRect(0, 2/3, 1/3, 1/3),
      createRect(1/3, 2/3, 1/3, 1/3),
      createRect(2/3, 2/3, 1/3, 1/3),
    ]
  },
  {
    id: 'grid_2x2',
    name: '四宫格',
    description: '2x2 等分布局',
    minImages: 1,
    maxImages: 4,
    slots: [
      createRect(0, 0, 0.5, 0.5),
      createRect(0.5, 0, 0.5, 0.5),
      createRect(0, 0.5, 0.5, 0.5),
      createRect(0.5, 0.5, 0.5, 0.5),
    ]
  },
  {
    id: 'grid_1x3',
    name: '横三宫格',
    description: '横向三等分',
    minImages: 1,
    maxImages: 3,
    slots: [
      createRect(0, 0, 1/3, 1),
      createRect(1/3, 0, 1/3, 1),
      createRect(2/3, 0, 1/3, 1),
    ]
  },
  {
    id: 'grid_3x1',
    name: '竖三宫格',
    description: '纵向三等分',
    minImages: 1,
    maxImages: 3,
    slots: [
      createRect(0, 0, 1, 1/3),
      createRect(0, 1/3, 1, 1/3),
      createRect(0, 2/3, 1, 1/3),
    ]
  },
  {
    id: 'left_big_right',
    name: '左大右小',
    description: '左侧大图+右侧两张小图',
    minImages: 1,
    maxImages: 3,
    slots: [
      createRect(0, 0, 0.6667, 1),
      createRect(0.6667, 0, 0.3333, 0.5),
      createRect(0.6667, 0.5, 0.3333, 0.5),
    ]
  },
  {
    id: 'top_big_bottom',
    name: '上大下小',
    description: '上方大图+下方两张小图',
    minImages: 1,
    maxImages: 3,
    slots: [
      createRect(0, 0, 1, 0.6667),
      createRect(0, 0.6667, 0.5, 0.3333),
      createRect(0.5, 0.6667, 0.5, 0.3333),
    ]
  },
  {
    id: 'diagonal',
    name: '对角线',
    description: '对角线布局',
    minImages: 1,
    maxImages: 5,
    slots: [
      createRect(0, 0, 0.5, 0.5),
      createRect(0.5, 0, 0.25, 0.25),
      createRect(0.75, 0.25, 0.25, 0.25),
      createRect(0.5, 0.5, 0.25, 0.25),
      createRect(0.25, 0.75, 0.25, 0.25),
    ]
  },
  {
    id: 'mosaic',
    name: '马赛克',
    description: '不规则马赛克布局',
    minImages: 1,
    maxImages: 6,
    slots: [
      createRect(0, 0, 0.4, 0.5),
      createRect(0.4, 0, 0.3, 0.3),
      createRect(0.7, 0, 0.3, 0.4),
      createRect(0, 0.5, 0.3, 0.5),
      createRect(0.3, 0.5, 0.4, 0.3),
      createRect(0.3, 0.8, 0.7, 0.2),
    ]
  },
  {
    id: 'center_focus',
    name: '中心聚焦',
    description: '中心大图+四周小图',
    minImages: 1,
    maxImages: 5,
    slots: [
      createRect(0.25, 0.25, 0.5, 0.5),
      createRect(0, 0, 0.25, 0.25),
      createRect(0.75, 0, 0.25, 0.25),
      createRect(0, 0.75, 0.25, 0.25),
      createRect(0.75, 0.75, 0.25, 0.25),
    ]
  },
];

export const getLayoutById = (id: string): Layout | undefined => {
  return layouts.find(l => l.id === id);
};

export const getDefaultLayout = (): Layout => {
  return layouts[0];
};
