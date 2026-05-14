import AMapLoader from '@amap/amap-jsapi-loader'

let amapInstance = null

export async function initAMap() {
  if (amapInstance) return amapInstance

  window._AMapSecurityConfig = {
    securityJsCode: 'your-security-code'
  }

  try {
    amapInstance = await AMapLoader.load({
      key: 'your-amap-key',
      version: '2.0',
      plugins: [
        'AMap.Geolocation',
        'AMap.Marker',
        'AMap.InfoWindow',
        'AMap.MapType',
        'AMap.Scale'
      ]
    })
    return amapInstance
  } catch (error) {
    console.error('高德地图加载失败:', error)
    throw error
  }
}

export function getAMap() {
  return amapInstance
}
