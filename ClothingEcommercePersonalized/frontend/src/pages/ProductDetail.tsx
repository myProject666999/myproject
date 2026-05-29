import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Image,
  Rate,
  Select,
  InputNumber,
  Tag,
  Divider,
  Space,
  Descriptions,
  List,
  Avatar,
  App as AntApp,
  Breadcrumb,
  Row,
  Col,
} from 'antd'
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  CheckCircleOutlined,
  StarOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import type { Product, Sku } from '@/types'
import { cn } from '@/lib/utils'

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: '法式复古碎花连衣裙', description: '优雅法式风格，清新碎花图案', price: 299, originalPrice: 599, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20floral%20dress%20on%20mannequin%2C%20soft%20pastel%20colors%2C%20fashion%20photography%20studio%20lighting&image_size=square'], category: '连衣裙', categoryId: 1, brand: 'MODE FEMME', sales: 2341, rating: 4.8, tags: ['热卖', '新品'] },
  { id: 2, name: '纯棉休闲圆领T恤', description: '100%纯棉面料，舒适透气', price: 89, originalPrice: 159, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20white%20cotton%20tshirt%20flat%20lay%2C%20clean%20background%2C%20fashion%20product%20photography&image_size=square'], category: 'T恤', categoryId: 2, brand: 'BASIC PLUS', sales: 5672, rating: 4.6, tags: ['爆款'] },
  { id: 3, name: '韩版宽松风衣外套', description: '经典版型，百搭时尚', price: 459, originalPrice: 899, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beige%20trench%20coat%20fashion%20photography%2C%20elegant%20style%2C%20studio%20lighting&image_size=square'], category: '外套', categoryId: 3, brand: 'URBAN CLASSIC', sales: 1823, rating: 4.9, tags: ['新品'] },
  { id: 4, name: '高腰直筒牛仔裤', description: '修饰腿型，显高显瘦', price: 199, originalPrice: 399, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blue%20denim%20jeans%20flat%20lay%2C%20high%20waist%20straight%20leg%2C%20fashion%20product%20photography&image_size=square'], category: '裤装', categoryId: 4, brand: 'DENIM LAB', sales: 3456, rating: 4.7, tags: ['热卖'] },
  { id: 5, name: '复古帆布托特包', description: '大容量，轻便耐脏', price: 129, originalPrice: 259, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20canvas%20tote%20bag%2C%20neutral%20colors%2C%20fashion%20accessory%20photography&image_size=square'], category: '包包', categoryId: 6, brand: 'CARRY ON', sales: 4521, rating: 4.5, tags: ['爆款'] },
  { id: 6, name: '轻奢珍珠耳饰套装', description: '精致优雅，多场合适用', price: 69, originalPrice: 139, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pearl%20earrings%20jewelry%20set%2C%20elegant%20display%2C%20luxury%20product%20photography&image_size=square'], category: '配饰', categoryId: 7, brand: 'LUMIÈRE', sales: 6789, rating: 4.8, tags: ['热卖', '新品'] },
  { id: 7, name: '气垫休闲运动鞋', description: '轻便缓震，时尚百搭', price: 339, originalPrice: 599, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20sneakers%20fashion%20photography%2C%20modern%20minimalist%20style%2C%20clean%20background&image_size=square'], category: '鞋靴', categoryId: 5, brand: 'STEP UP', sales: 2134, rating: 4.7, tags: ['新品'] },
  { id: 8, name: '速干透气运动套装', description: '专业运动面料，舒适自在', price: 259, originalPrice: 499, images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sportswear%20set%20athleisure%2C%20modern%20fitness%20outfit%2C%20product%20photography&image_size=square'], category: '运动', categoryId: 8, brand: 'ACTIVE FIT', sales: 1567, rating: 4.6, tags: ['爆款'] },
]

const MOCK_SKUS: Sku[] = [
  { id: 101, productId: 1, color: '粉色', colorCode: '#FFB6C1', size: 'S', price: 299, stock: 50, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20floral%20dress%20on%20mannequin%2C%20soft%20pastel%20colors%2C%20fashion%20photography%20studio%20lighting&image_size=square' },
  { id: 102, productId: 1, color: '粉色', colorCode: '#FFB6C1', size: 'M', price: 299, stock: 30, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20floral%20dress%20on%20mannequin%2C%20soft%20pastel%20colors%2C%20fashion%20photography%20studio%20lighting&image_size=square' },
  { id: 103, productId: 1, color: '粉色', colorCode: '#FFB6C1', size: 'L', price: 299, stock: 20, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20floral%20dress%20on%20mannequin%2C%20soft%20pastel%20colors%2C%20fashion%20photography%20studio%20lighting&image_size=square' },
  { id: 104, productId: 1, color: '蓝色', colorCode: '#87CEEB', size: 'S', price: 299, stock: 40, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20floral%20dress%20on%20mannequin%2C%20soft%20pastel%20colors%2C%20fashion%20photography%20studio%20lighting&image_size=square' },
  { id: 105, productId: 1, color: '蓝色', colorCode: '#87CEEB', size: 'M', price: 299, stock: 0, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20floral%20dress%20on%20mannequin%2C%20soft%20pastel%20colors%2C%20fashion%20photography%20studio%20lighting&image_size=square' },
  { id: 106, productId: 1, color: '蓝色', colorCode: '#87CEEB', size: 'L', price: 299, stock: 15, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20floral%20dress%20on%20mannequin%2C%20soft%20pastel%20colors%2C%20fashion%20photography%20studio%20lighting&image_size=square' },
]

const MOCK_REVIEWS = [
  { id: 1, user: '用户***8', avatar: '👩', rating: 5, content: '衣服质量很好，穿上很显瘦，颜色也很正，物流很快！', images: [], time: '2026-05-20', size: 'M', color: '粉色' },
  { id: 2, user: '用户***3', avatar: '👨', rating: 4, content: '面料舒适，版型不错，就是稍微有点长，整体满意。', images: [], time: '2026-05-18', size: 'L', color: '蓝色' },
  { id: 3, user: '用户***6', avatar: '👩', rating: 5, content: '超级喜欢！已经是第二次购买了，推荐给朋友们了~', images: [], time: '2026-05-15', size: 'S', color: '粉色' },
]

const MOCK_SIMILAR: Product[] = MOCK_PRODUCTS.slice(0, 4)

function formatPrice(price: number) {
  return `¥${price.toFixed(2)}`
}

function formatSales(sales: number) {
  if (sales >= 10000) return `${(sales / 10000).toFixed(1)}万`
  if (sales >= 1000) return `${(sales / 1000).toFixed(1)}k`
  return String(sales)
}

export default function ProductDetail() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const { message } = AntApp.useApp()

  const [product, setProduct] = useState<Product | null>(null)
  const [skus, setSkus] = useState<Sku[]>([])
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const productId = parseInt(params.id || '1', 10)
    const foundProduct = MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0]
    setProduct(foundProduct)

    const productSkus = MOCK_SKUS.filter((s) => s.productId === foundProduct.id)
    if (productSkus.length > 0) {
      setSkus(productSkus)
      setSelectedColor(productSkus[0].color)
      setSelectedSize(productSkus[0].size)
    } else {
      const defaultSkus: Sku[] = [
        { id: 201, productId: foundProduct.id, color: '默认', colorCode: '#000000', size: 'S', price: foundProduct.price, stock: 100, image: foundProduct.images[0] },
        { id: 202, productId: foundProduct.id, color: '默认', colorCode: '#000000', size: 'M', price: foundProduct.price, stock: 80, image: foundProduct.images[0] },
        { id: 203, productId: foundProduct.id, color: '默认', colorCode: '#000000', size: 'L', price: foundProduct.price, stock: 50, image: foundProduct.images[0] },
        { id: 204, productId: foundProduct.id, color: '默认', colorCode: '#000000', size: 'XL', price: foundProduct.price, stock: 30, image: foundProduct.images[0] },
      ]
      setSkus(defaultSkus)
      setSelectedColor('默认')
      setSelectedSize('M')
    }
  }, [params.id])

  const availableSizes = skus
    .filter((s) => s.color === selectedColor)
    .map((s) => ({ size: s.size, stock: s.stock }))

  const selectedSku = skus.find((s) => s.color === selectedColor && s.size === selectedSize)
  const currentStock = selectedSku?.stock || 0
  const displayPrice = selectedSku?.price || product?.price || 0

  function handleAddToCart() {
    if (currentStock === 0) {
      message.error('该规格暂无库存')
      return
    }
    message.success(`已添加 ${product?.name} (${selectedColor}/${selectedSize}) x ${quantity} 到购物车`)
  }

  function handleBuyNow() {
    if (currentStock === 0) {
      message.error('该规格暂无库存')
      return
    }
    message.success('正在跳转到结算页面...')
  }

  function handleFavorite() {
    setIsFavorite(!isFavorite)
    message.success(isFavorite ? '已取消收藏' : '已添加到收藏夹')
  }

  function handleSimilarClick(p: Product) {
    setActiveImageIndex(0)
    navigate(`/product/${p.id}`)
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                返回
              </Button>
              <div className="text-sm text-gray-500">商品详情</div>
            </div>
            <Space size="middle">
              <ShareAltOutlined className="text-lg text-gray-500 cursor-pointer" />
            </Space>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumb className="mb-4" separator="/">
          <Breadcrumb.Item className="cursor-pointer" onClick={() => navigate('/')}>首页</Breadcrumb.Item>
          <Breadcrumb.Item className="cursor-pointer" onClick={() => navigate('/products')}>商品列表</Breadcrumb.Item>
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Card className="mb-6 overflow-hidden">
          <Row gutter={32}>
            <Col xs={24} md={10}>
              <div className="sticky top-20">
                <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 mb-4">
                  <Image
                    src={product.images[activeImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    preview
                  />
                </div>
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all',
                        activeImageIndex === idx ? 'border-pink-500' : 'border-transparent hover:border-gray-300'
                      )}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            <Col xs={24} md={14}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex gap-2 mb-2">
                      {product.tags?.map((tag) => (
                        <Tag key={tag} color={tag === '新品' ? 'green' : tag === '热卖' ? 'red' : 'orange'}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h1>
                    <p className="text-sm text-gray-500">{product.description}</p>
                  </div>
                  <Button
                    type="text"
                    icon={isFavorite ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                    onClick={handleFavorite}
                    className="flex-shrink-0"
                  />
                </div>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-red-500">{formatPrice(displayPrice)}</span>
                    {product.originalPrice > displayPrice && (
                      <>
                        <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                        <Tag color="red">省{formatPrice(product.originalPrice - displayPrice)}</Tag>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>已售 {formatSales(product.sales)}</span>
                    <span className="flex items-center gap-1">
                      <Rate disabled allowHalf value={product.rating} style={{ fontSize: 12 }} />
                      {product.rating}
                    </span>
                    <span>评价 {MOCK_REVIEWS.length}</span>
                  </div>
                </div>

                <Divider />

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">颜色</div>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(skus.map((s) => s.color))].map((color) => {
                      const colorSku = skus.find((s) => s.color === color)
                      const hasStock = skus.some((s) => s.color === color && s.stock > 0)
                      return (
                        <Button
                          key={color}
                          type={selectedColor === color ? 'primary' : 'default'}
                          size="small"
                          onClick={() => {
                            setSelectedColor(color)
                            const firstAvailableSize = skus.find((s) => s.color === color && s.stock > 0)?.size
                            if (firstAvailableSize) setSelectedSize(firstAvailableSize)
                          }}
                          disabled={!hasStock}
                          className={cn(
                            'rounded-full',
                            selectedColor === color ? 'bg-pink-500 border-pink-500' : ''
                          )}
                        >
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-1 border border-gray-300"
                            style={{ backgroundColor: colorSku?.colorCode || '#ccc' }}
                          />
                          {color}
                          {!hasStock && <span className="ml-1 text-xs">(缺货)</span>}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">尺码</div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(({ size, stock }) => (
                      <Button
                        key={size}
                        type={selectedSize === size ? 'primary' : 'default'}
                        size="small"
                        onClick={() => setSelectedSize(size)}
                        disabled={stock === 0}
                        className={cn(
                          'rounded-full',
                          selectedSize === size ? 'bg-pink-500 border-pink-500' : ''
                        )}
                      >
                        {size}
                        {stock === 0 && <span className="ml-1 text-xs">(缺货)</span>}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">数量</div>
                  <InputNumber
                    min={1}
                    max={currentStock}
                    value={quantity}
                    onChange={(v) => setQuantity(v || 1)}
                    size="large"
                  />
                  <span className="ml-3 text-sm text-gray-500">库存 {currentStock} 件</span>
                </div>

                <Divider />

                <div className="flex gap-4">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    className="flex-1 h-12 bg-pink-500 hover:bg-pink-600"
                  >
                    加入购物车
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleBuyNow}
                    className="flex-1 h-12 bg-red-500 hover:bg-red-600"
                  >
                    立即购买
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-xs text-gray-400 pt-2">
                  <span className="flex items-center gap-1"><CheckCircleOutlined /> 正品保证</span>
                  <span className="flex items-center gap-1"><CheckCircleOutlined /> 7天无理由</span>
                  <span className="flex items-center gap-1"><CheckCircleOutlined /> 极速发货</span>
                  <span className="flex items-center gap-1"><CheckCircleOutlined /> 运费险</span>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        <Card className="mb-6" title={
          <span className="flex items-center gap-2">
            <StarOutlined className="text-yellow-500" />
            用户评价 ({MOCK_REVIEWS.length})
          </span>
        }>
          <List
            itemLayout="horizontal"
            dataSource={MOCK_REVIEWS}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar size="large">{item.avatar}</Avatar>}
                  title={
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700">{item.user}</span>
                      <Rate disabled allowHalf value={item.rating} style={{ fontSize: 12 }} />
                      <span className="text-xs text-gray-400">{item.size} / {item.color}</span>
                    </div>
                  }
                  description={
                    <div>
                      <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <ShopOutlined className="text-pink-500" />
              猜你喜欢
            </span>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MOCK_SIMILAR.map((p) => (
              <Card
                key={p.id}
                hoverable
                size="small"
                className="overflow-hidden cursor-pointer"
                styles={{ body: { padding: '8px' } }}
                onClick={() => handleSimilarClick(p)}
                cover={
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                }
              >
                <h3 className="text-xs font-medium text-gray-800 line-clamp-2 h-8">{p.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-red-500">{formatPrice(p.price)}</span>
                  <span className="text-xs text-gray-400">已售{formatSales(p.sales)}</span>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </main>

      <footer className="border-t bg-white py-6 mt-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-400">
          © 2026 衣尚优选 - 服装电商个性化推荐系统
        </div>
      </footer>
    </div>
  )
}
