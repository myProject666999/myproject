import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Input, Pagination, Empty, Spin, Rate, Select, Button, Space } from 'antd'
import { ArrowLeftOutlined, FilterOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { getProductList, getCategoryList } from '@/api/home'
import type { Product, Category } from '@/types'
import { cn } from '@/lib/utils'

const MOCK_CATEGORIES: Category[] = [
  { id: 0, name: '全部', icon: '🏠' },
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
  { id: 1, name: '法式复古碎花连衣裙', description: '优雅法式风格，清新碎花图案', price: 299, originalPrice: 599, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20floral%20dress%20on%20mannequin%2C%20soft%20pastel%20colors%2C%20fashion%20photography%20studio%20lighting&image_size=square'], category: '连衣裙', categoryId: 1, brand: 'MODE FEMME', sales: 2341, rating: 4.8, tags: ['热卖', '新品'] },
  { id: 2, name: '纯棉休闲圆领T恤', description: '100%纯棉面料，舒适透气', price: 89, originalPrice: 159, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20white%20cotton%20tshirt%20flat%20lay%2C%20clean%20background%2C%20fashion%20product%20photography&image_size=square'], category: 'T恤', categoryId: 2, brand: 'BASIC PLUS', sales: 5672, rating: 4.6, tags: ['爆款'] },
  { id: 3, name: '韩版宽松风衣外套', description: '经典版型，百搭时尚', price: 459, originalPrice: 899, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beige%20trench%20coat%20fashion%20photography%2C%20elegant%20style%2C%20studio%20lighting&image_size=square'], category: '外套', categoryId: 3, brand: 'URBAN CLASSIC', sales: 1823, rating: 4.9, tags: ['新品'] },
  { id: 4, name: '高腰直筒牛仔裤', description: '修饰腿型，显高显瘦', price: 199, originalPrice: 399, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blue%20denim%20jeans%20flat%20lay%2C%20high%20waist%20straight%20leg%2C%20fashion%20product%20photography&image_size=square'], category: '裤装', categoryId: 4, brand: 'DENIM LAB', sales: 3456, rating: 4.7, tags: ['热卖'] },
  { id: 5, name: '复古帆布托特包', description: '大容量，轻便耐脏', price: 129, originalPrice: 259, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20canvas%20tote%20bag%2C%20neutral%20colors%2C%20fashion%20accessory%20photography&image_size=square'], category: '包包', categoryId: 6, brand: 'CARRY ON', sales: 4521, rating: 4.5, tags: ['爆款'] },
  { id: 6, name: '轻奢珍珠耳饰套装', description: '精致优雅，多场合适用', price: 69, originalPrice: 139, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pearl%20earrings%20jewelry%20set%2C%20elegant%20display%2C%20luxury%20product%20photography&image_size=square'], category: '配饰', categoryId: 7, brand: 'LUMIÈRE', sales: 6789, rating: 4.8, tags: ['热卖', '新品'] },
  { id: 7, name: '气垫休闲运动鞋', description: '轻便缓震，时尚百搭', price: 339, originalPrice: 599, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20sneakers%20fashion%20photography%2C%20modern%20minimalist%20style%2C%20clean%20background&image_size=square'], category: '鞋靴', categoryId: 5, brand: 'STEP UP', sales: 2134, rating: 4.7, tags: ['新品'] },
  { id: 8, name: '速干透气运动套装', description: '专业运动面料，舒适自在', price: 259, originalPrice: 499, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sportswear%20set%20athleisure%2C%20modern%20fitness%20outfit%2C%20product%20photography&image_size=square'], category: '运动', categoryId: 8, brand: 'ACTIVE FIT', sales: 1567, rating: 4.6, tags: ['爆款'] },
  { id: 9, name: '波西米亚长裙', description: '飘逸浪漫，度假必备', price: 359, originalPrice: 699, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bohemian%20maxi%20dress%20flowy%2C%20summer%20fashion%2C%20vibrant%20colors&image_size=square'], category: '连衣裙', categoryId: 1, brand: 'SUNNY GIRL', sales: 1234, rating: 4.7, tags: ['热卖'] },
  { id: 10, name: '条纹海魂衫', description: '经典海军风，休闲百搭', price: 119, originalPrice: 199, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=striped%20breton%20shirt%20navy%20white%2C%20classic%20style%2C%20fashion%20photography&image_size=square'], category: 'T恤', categoryId: 2, brand: 'NAVY BLUE', sales: 2890, rating: 4.5, tags: ['新品'] },
  { id: 11, name: '机车皮夹克', description: '帅气酷感，街头风必备', price: 599, originalPrice: 1199, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20leather%20biker%20jacket%2C%20cool%20style%2C%20fashion%20photography&image_size=square'], category: '外套', categoryId: 3, brand: 'ROCK STAR', sales: 876, rating: 4.9, tags: ['热卖'] },
  { id: 12, name: '阔腿西装裤', description: '垂感十足，气场全开', price: 279, originalPrice: 459, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wide%20leg%20tailored%20trousers%2C%20elegant%20office%20wear%2C%20fashion%20photography&image_size=square'], category: '裤装', categoryId: 4, brand: 'OFFICE CHIC', sales: 1567, rating: 4.8, tags: ['爆款'] },
]

function formatPrice(price: number) {
  return `¥${price.toFixed(2)}`
}

function formatSales(sales: number) {
  if (sales >= 10000) return `${(sales / 10000).toFixed(1)}万`
  if (sales >= 1000) return `${(sales / 1000).toFixed(1)}k`
  return String(sales)
}

export default function ProductList() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''

  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('sales_desc')
  const [searchValue, setSearchValue] = useState(keyword)
  const [page, setPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [catRes, prodRes] = await Promise.allSettled([
          getCategoryList(),
          getProductList({
            categoryId: currentCategory || undefined,
            keyword: searchValue || undefined,
            sortBy: sortBy as any,
            page,
            pageSize,
          }),
        ])
        if (catRes.status === 'fulfilled' && catRes.value.data?.length) {
          setCategories([{ id: 0, name: '全部', icon: '🏠' }, ...catRes.value.data])
        }
        if (prodRes.status === 'fulfilled' && prodRes.value.data?.list?.length) {
          setProducts(prodRes.value.data.list)
        }
      } catch {
        // use mock data
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentCategory, sortBy, searchValue, page])

  useEffect(() => {
    const catId = params.id ? parseInt(params.id, 10) : 0
    setCurrentCategory(catId)
  }, [params.id])

  function handleCategoryClick(catId: number) {
    setCurrentCategory(catId)
    setPage(1)
    if (catId === 0) {
      navigate('/products')
    } else {
      navigate(`/products/category/${catId}`)
    }
  }

  function handleProductClick(product: Product) {
    navigate(`/product/${product.id}`)
  }

  function handleSearch() {
    setPage(1)
  }

  const filteredProducts = products.filter((p) => {
    if (currentCategory > 0 && p.categoryId !== currentCategory) return false
    if (searchValue && !p.name.includes(searchValue) && !p.description.includes(searchValue)) return false
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      case 'sales_desc':
        return b.sales - a.sales
      case 'newest':
      default:
        return b.id - a.id
    }
  })

  const paginatedProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize)
  const currentCategoryName = categories.find((c) => c.id === currentCategory)?.name || '全部商品'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="flex-shrink-0">
              返回
            </Button>
            <div className="flex-1">
              <Input.Search
                placeholder="搜索商品..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                enterButton
                prefix={<SearchOutlined className="text-gray-400" />}
                allowClear
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-pink-500" onClick={() => navigate('/')}>首页</span>
          <span>/</span>
          <span className="text-gray-800 font-medium">{currentCategoryName}</span>
        </div>

        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-medium text-gray-700 flex items-center gap-2">
            <FilterOutlined /> 商品分类
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                type={currentCategory === cat.id ? 'primary' : 'default'}
                size="small"
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  'rounded-full',
                  currentCategory === cat.id ? 'bg-pink-500 border-pink-500' : ''
                )}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {sortedProducts.length} 件商品</span>
          <Space size="middle">
            <span className="text-sm text-gray-500">排序：</span>
            <Select
              value={sortBy}
              onChange={(v) => { setSortBy(v); setPage(1) }}
              style={{ width: 140 }}
              size="small"
              options={[
                { value: 'sales_desc', label: '销量优先' },
                { value: 'newest', label: '最新上架' },
                { value: 'price_asc', label: '价格从低到高' },
                { value: 'price_desc', label: '价格从高到低' },
              ]}
            />
          </Space>
        </div>

        <Spin spinning={loading}>
          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {paginatedProducts.map((product) => (
                  <Card
                    key={product.id}
                    hoverable
                    className="overflow-hidden rounded-xl border-0 shadow-sm"
                    styles={{ body: { padding: '12px' } }}
                    onClick={() => handleProductClick(product)}
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

              {sortedProducts.length > pageSize && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={sortedProducts.length}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-16">
              <Empty description="暂无符合条件的商品" />
            </div>
          )}
        </Spin>
      </main>

      <footer className="border-t bg-white py-6 mt-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-400">
          © 2026 衣尚优选 - 服装电商个性化推荐系统
        </div>
      </footer>
    </div>
  )
}
