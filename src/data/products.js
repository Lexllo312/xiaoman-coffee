export const categories = [
  { id: 'all', label: '全部' },
  { id: 'single', label: '单一产地' },
  { id: 'blend', label: '拼配' }
]

export const products = [
  {
    id: 'baoshan-typica', name: '保山 · 铁皮卡', category: 'single',
    origin: '云南保山', process: '水洗', roast: '中浅烘', notes: ['红提', '红糖', '乌龙茶'],
    price: 88, weight: '200g', stock: 24, featured: true,
    image: '/images/baoshan-typica.jpg',
    story: '干净的红糖甜感，尾韵带一点乌龙茶回甘，适合作为日常手冲。'
  },
  {
    id: 'guji-natural', name: '古吉 · 日晒', category: 'single',
    origin: '埃塞俄比亚古吉', process: '日晒', roast: '浅烘', notes: ['蓝莓', '茉莉', '蜜桃'],
    price: 118, weight: '200g', stock: 12, featured: true,
    image: '/images/guji-natural.jpg',
    story: '蓝莓甜香里带一缕茉莉花香，凉下来之后蜜桃风味更明显。'
  },
  {
    id: 'huila-washed', name: '慧兰 · 水洗', category: 'single',
    origin: '哥伦比亚慧兰', process: '水洗', roast: '中烘', notes: ['青苹果', '焦糖', '杏仁'],
    price: 96, weight: '200g', stock: 31, featured: false,
    image: '/images/huila-washed.jpg',
    story: '青苹果的清爽酸质，搭配焦糖与杏仁的香甜，也适合做奶咖。'
  },
  {
    id: 'yirga-cheffe', name: '耶加雪菲 · 水洗', category: 'single',
    origin: '埃塞俄比亚耶加雪菲', process: '水洗', roast: '浅烘', notes: ['柠檬皮', '佛手柑', '白花'],
    price: 108, weight: '200g', stock: 8, featured: true,
    image: '/images/yirga-cheffe.jpg',
    story: '明亮的柑橘调，杯中有佛手柑与白色花香，推荐用 92℃ 水温冲煮。'
  },
  {
    id: 'blend-morning', name: '晨间拼配', category: 'blend',
    origin: '云南 + 巴西', process: '半水洗', roast: '中深烘', notes: ['黑巧', '烤榛子', '奶油'],
    price: 78, weight: '250g', stock: 46, featured: false,
    image: '/images/blend-morning.jpg',
    story: '为意式机与摩卡壶准备，黑巧与榛果风味在牛奶里也很清楚。'
  },
  {
    id: 'blend-night', name: '夜航拼配', category: 'blend',
    origin: '印尼 + 哥伦比亚', process: '湿刨', roast: '深烘', notes: ['雪松', '黑糖', '烟熏'],
    price: 82, weight: '250g', stock: 19, featured: false,
    image: '/images/blend-night.jpg',
    story: '醇厚的雪松与黑糖风味，苦味圆润，适合慢慢喝的一杯。'
  }
]

export function findProduct(id) {
  return products.find((product) => product.id === id)
}
