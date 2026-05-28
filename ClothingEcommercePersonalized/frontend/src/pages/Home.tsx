import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Carousel, Card, Input, Badge, Spin, Rate } from 'antd'
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  FireOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { getRecommendProducts, getCategoryList } from '@/api/home'
import type { Product, Category } from '@/types'
import { cn } from '@/lib/utils'

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: '连衣裙', icon: '👗' },
  { id: 2, name: 'T恤', icon: '👕' },
  { id: 3, name: '外套', icon: '🧥' },
  { id: 4, name: '裤装', icon: '👖' },
  { id: 5, name: '鞋靴', icon: '👟' },
  { id: 6, name: '包包', icon: '👜' },
  { id: 7, name: '配饰', icon: '💍' },
  { id: 8, name: '运动', icon: '🏋️' },
]

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: '法式复古碎花连衣裙',
    description: '优雅法式风格，清新碎花图案',
    price: 299,
    originalPrice: 599,
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20floral%20dress%20on%20mannequin%2C%20soft%20pastel%20colors%2C%20fashion%20photography%20studio%20lighting&image_size=square'],
    category: '连衣裙',
    categoryId: 1,
    brand: 'MODE FEMME',
    sales: 2341,
    rating: 4.8,
    tags: ['热卖', '新品'],
  },
  {
    id: 2,
    name: '纯棉休闲圆领T恤',
    description: '100%纯棉面料，舒适透气',
    price: 89,
    originalPrice: 159,
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20white%20cotton%20tshirt%20flat%20lay%2C%20clean%20background%2C%20fashion%20product%20photography&image_size=square'],
    category: 'T恤',
    categoryId: 2,
    brand: 'BASIC PLUS',
    sales: 5672,
    rating: 4.6,
    tags: ['爆款'],
  },
  {
    id: 3,
    name: '韩版宽松风衣外套',
    description: '经典版型，百搭时尚',
    price: 459,
    originalPrice: 899,
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beige%20trench%20coat%20fashion%20photography%2C%20elegant%20style%2C%20studio%20lighting&image_size=square'],
    category: '外套',
    categoryId: 3,
    brand: 'URBAN CLASSIC',
    sales: 1823,
    rating: 4.9,
    tags: ['新品'],
  },
  {
    id: 4,
    name: '高腰直筒牛仔裤',
    description: '修饰腿型，显高显瘦',
    price: 199,
    originalPrice: 399,
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blue%20denim%20jeans%20flat%20lay%2C%20high%20waist%20straight%20leg%2C%20fashion%20product%20photography&image_size=square'],
    category: '裤装',
    categoryId: 4,
    brand: 'DENIM LAB',
    sales: 3456,
    rating: 4.7,
    tags: ['热卖'],
  },
  {
    id: 5,
    name: '复古帆布托特包',
    description: '大容量，轻便耐脏',
    price: 129,
    originalPrice: 259,
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20canvas%20tote%20bag%2C%20neutral%20colors%2C%20fashion%20accessory%20photography&image_size=square'],
    category: '包包',
    categoryId: 6,
    brand: 'CARRY ON',
    sales: 4521,
    rating: 4.5,
    tags: ['爆款'],
  },
  {
    id: 6,
    name: '轻奢珍珠耳饰套装',
    description: '精致优雅，多场合适用',
    price: 69,
    originalPrice: 139,
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pearl%20earrings%20jewelry%20set%2C%20elegant%20display%2C%20luxury%20product%20photography&image_size=square'],
    category: '配饰',
    categoryId: 7,
    brand: 'LUMIÈRE',
    sales: 6789,
    rating: 4.8,
    tags: ['热卖', '新品'],
  },
  {
    id: 7,
    name: '气垫休闲运动鞋',
    description: '轻便缓震，时尚百搭',
    price: 339,
    originalPrice: 599,
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20sneakers%20fashion%20photography%2C%20modern%20minimalist%20style%2C%20clean%20background&image_size=square'],
    category: '鞋靴',
    categoryId: 5,
    brand: 'STEP UP',
    sales: 2134,
    rating: 4.7,
    tags: ['新品'],
  },
  {
    id: 8,
    name: '速干透气运动套装',
    description: '专业运动面料，舒适自在',
    price: 259,
    originalPrice: 499,
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sportswear%20set%20athleisure%2C%20modern%20fitness%20outfit%2C%20product%20photography&image_size=square'],
    category: '运动',
    categoryId: 8,
    brand: 'ACTIVE FIT',
    sales: 1567,
    rating: 4.6,
    tags: ['爆款'],
  },
]

const BANNER_IMAGES = [
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20summer%20sale%20banner%2C%20colorful%20clothing%20collection%2C%20elegant%20models%2C%20warm%20tones&image_size=landscape_16_9',
    title: '夏日焕新季',
    subtitle: '全场低至3折起',
  },
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=new%20arrival%20fashion%20banner%2C%20spring%20collection%2C%20modern%20elegant%20style%2C%20pastel%20colors&image_size=landscape_16_9',
    title: '新品首发',
    subtitle: '发现你的专属风格',
  },
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20brand%20fashion%20banner%2C%20luxury%20clothing%20display%2C%20golden%20accents%2C%20sophisticated%20style&image_size=landscape_16_9',
    title: '品牌精选',
    subtitle: '品质与格调的碰撞',
  },
]

function formatPrice(price: number) {
  return `¥${price.toFixed(2)}`
}

function formatSales(sales: number) {
  if (sales >= 10000) return `${(sales / 10000).toFixed(1)}万`
  if (sales >= 1000) return `${(sales / 1000).toFixed(1)}k`
  return String(sales)
}

export default function Home() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [catRes, prodRes] = await Promise.allSettled([
          getCategoryList(),
          getRecommendProducts({ limit: 8 }),
        ])
        if (catRes.status === 'fulfilled' && catRes.value.data?.length) {
          setCategories(catRes.value.data)
        }
        if (prodRes.status === 'fulfilled' && prodRes.value.data?.length) {
          setProducts(prodRes.value.data)
        }
      } catch {
        // use mock data as fallback
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function handleSearch(value: string) {
    if (value.trim()) {
      navigate(`/?keyword=${encodeURIComponent(value.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-sm font-bold text-white">
                CE
              </div>
              <span className="text-lg font-semibold text-gray-800">衣尚优选</span>
            </div>

            <div className="mx-8 flex-1 max-w-xl">
              <Input.Search
                placeholder="搜索你喜欢的商品..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                prefix={<SearchOutlined className="text-gray-400" />}
                allowClear
                className="rounded-full"
                style={{ borderRadius: 20 }}
              />
            </div>

            <div className="flex items-center gap-5">
              <Badge count={0} showZero={false}>
                <ShoppingCartOutlined className="text-xl text-gray-600 cursor-pointer hover:text-pink-500 transition-colors" />
              </Badge>
              <UserOutlined className="text-xl text-gray-600 cursor-pointer hover:text-pink-500 transition-colors" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-12">
        {/* Banner Carousel */}
        <section className="mt-4 overflow-hidden rounded-xl">
          <Carousel autoplay dotPosition="bottom" effect="fade">
            {BANNER_IMAGES.map((banner, idx) => (
              <div key={idx}>
                <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-xl">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                    <div className="ml-8 sm:ml-12 text-white">
                      <h2 className="text-2xl sm:text-4xl font-bold mb-2">{banner.title}</h2>
                      <p className="text-base sm:text-lg opacity-90">{banner.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </section>

        {/* Categories */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">精选分类</h2>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl bg-white p-3 sm:p-4',
                  'cursor-pointer shadow-sm hover:shadow-md transition-all',
                  'hover:-translate-y-0.5'
                )}
              >
                <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Products */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FireOutlined className="text-orange-500 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">为你推荐</h2>
            </div>
            <span className="text-sm text-gray-400 cursor-pointer hover:text-pink-500 transition-colors flex items-center gap-1">
              查看更多 <RightOutlined className="text-xs" />
            </span>
          </div>

          <Spin spinning={loading}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  hoverable
                  className="overflow-hidden rounded-xl border-0 shadow-sm"
                  styles={{ body: { padding: '12px' } }}
                  cover={
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {product.tags?.length > 0 && (
                        <div className="absolute top-2 left-2 flex gap-1">
                          {product.tags.map((tag) => (
                            <span
                              key={tag}
                              className={cn(
                                'rounded px-1.5 py-0.5 text-xs font-medium text-white',
                                tag === '新品' && 'bg-green-500',
                                tag === '热卖' && 'bg-red-500',
                                tag === '爆款' && 'bg-orange-500',
                                !['新品', '热卖', '爆款'].includes(tag) && 'bg-pink-500'
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {product.originalPrice > product.price && (
                        <span className="absolute top-2 right-2 rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}%OFF
                        </span>
                      )}
                    </div>
                  }
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-5 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-1 mb-2">{product.description}</p>
                    <div className="flex items-center gap-1 mb-2">
                      <Rate disabled allowHalf value={product.rating} style={{ fontSize: 10 }} />
                      <span className="text-xs text-gray-400">{product.rating}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-red-500">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        已售{formatSales(product.sales)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Spin>
        </section>

        {/* Features */}
        <section className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '🚚', title: '免费配送', desc: '满99元包邮' },
            { icon: '🔄', title: '7天无理由', desc: '退换无忧' },
            { icon: '✅', title: '正品保障', desc: '品牌授权' },
            { icon: '💬', title: '在线客服', desc: '贴心服务' },
          ].map((feat) => (
            <div
              key={feat.title}
              className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
            >
              <span className="text-2xl">{feat.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{feat.title}</p>
                <p className="text-xs text-gray-400">{feat.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-pink-500 to-rose-500 text-xs font-bold text-white">
                  CE
                </div>
                <span className="font-semibold text-gray-800">衣尚优选</span>
              </div>
              <p className="text-sm text-gray-500 leading-6">
                专注时尚穿搭，为你提供个性化的服装推荐服务，让每一次选择都充满自信。
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-800">快速链接</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="cursor-pointer hover:text-pink-500 transition-colors">新品上架</li>
                <li className="cursor-pointer hover:text-pink-500 transition-colors">热门推荐</li>
                <li className="cursor-pointer hover:text-pink-500 transition-colors">品牌精选</li>
                <li className="cursor-pointer hover:text-pink-500 transition-colors">限时特惠</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-800">帮助中心</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="cursor-pointer hover:text-pink-500 transition-colors">购物指南</li>
                <li className="cursor-pointer hover:text-pink-500 transition-colors">配送方式</li>
                <li className="cursor-pointer hover:text-pink-500 transition-colors">售后服务</li>
                <li className="cursor-pointer hover:text-pink-500 transition-colors">联系我们</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t pt-4 text-center text-xs text-gray-400">
            © 2026 衣尚优选 - 服装电商个性化推荐系统
          </div>
        </div>
      </footer>
    </div>
  )
}
