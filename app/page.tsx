'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Maximize, Minimize } from 'lucide-react'
import { useQuery, QueryClient, QueryClientProvider } from 'react-query'
import axios from 'axios'
import Barcode from 'react-barcode'

// Crear una instancia de QueryClient
const queryClient = new QueryClient()

// Definir la URL base de la API
const API_BASE_URL = '/api'

// Definir la URL base para las imágenes
const IMAGE_BASE_URL = 'https://177.234.196.99:8089/images/'

// Definir la URL de la imagen de fallback
const FALLBACK_IMAGE_URL = 'https://177.234.196.99:8089/images/LOGONEXT.png'

// Tipos y funciones auxiliares (fetchProduct, etc.) aquí...

type ProductResponse = {
  Id: number;
  ProductoId: string;
  Codigo: string;
  Clase: string;
  Nombre: string;
  Descripcion: string;
  Foto: string;
  Empaque: string;
  CodEmpaque: string;
  Costo: number;
  Factor: number;
  PrecioClase01: number;
  PrecioClase02: number;
  PrecioClase03: number;
  PrecioClase04: number;
  PrecioClase05: number;
  PrecioClase06: number;
  PrecioClase07: number;
  PrecioClaseDefault: number;
  Stock: number;
  AIVA: boolean;
  PIVA: number;
  AICE: boolean;
  PICE: number;
  AVERDE: boolean;
  PVERDE: number;
  PromocionFechaInicio: string;
  PromocionFechaFinal: string;
}

type ApiResponse = {
  Results: ProductResponse[];
  Count: number;
  Total: number;
}

const fetchProduct = async (genericstring: string): Promise<ApiResponse> => {
  try {
    const requestData = {
      PageNumber: 0,
      PageSize: 0,
      genericstring: genericstring
    };

    console.log('Enviando petición POST:', {
      url: `${API_BASE_URL}/Productos/productReadBarCode`,
      data: requestData,
      headers: { 'Content-Type': 'application/json' }
    });

    const { data } = await axios.post<ApiResponse>(
      `${API_BASE_URL}/Productos/productReadBarCode`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error de Axios:', error.message)
      console.error('Detalles del error:', error.response?.data)
    } else {
      console.error('Error desconocido:', error)
    }
    throw error
  }
}

function ProductImage({ photoInfo, alt }: { photoInfo: string | null; alt: string }) {
  const [imgSrc, setImgSrc] = useState<string>(FALLBACK_IMAGE_URL)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (photoInfo) {
      const img = new Image()
      img.crossOrigin = 'anonymous'  // Añadir esto puede ayudar con problemas de CORS
      img.src = `${IMAGE_BASE_URL}${photoInfo}`
      //img.src = FALLBACK_IMAGE_URL
      const handleImageLoad = () => {
        setImgSrc(img.src)
        setIsLoading(false)
      }

      const handleImageError = () => {
        console.warn(`No se pudo cargar la imagen: ${img.src}`)
        //setImgSrc(FALLBACK_IMAGE_URL)
        setImgSrc(`${IMAGE_BASE_URL}${photoInfo}`)
        setIsLoading(false)
      }

      img.addEventListener('load', handleImageLoad)
      img.addEventListener('error', handleImageError)

      return () => {
        img.removeEventListener('load', handleImageLoad)
        img.removeEventListener('error', handleImageError)
      }
    } else {
      setImgSrc(FALLBACK_IMAGE_URL)
      setIsLoading(false)
    }
  }, [photoInfo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">Cargando imagen...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={imgSrc}
        alt={alt}
        className="object-contain w-full h-full p-2 sm:p-3 md:p-4"
        onError={() => {
          console.warn(`Error al cargar la imagen: ${imgSrc}`)
          setImgSrc(FALLBACK_IMAGE_URL)
        }}
      />
    </div>
  )
}

function BuscadorProductos() {
  const [barcode, setBarcode] = useState('')
  const [displayedBarcode, setDisplayedBarcode] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const barcodeBufferRef = useRef('')
  const lastKeyPressTimeRef = useRef(0)
  const [barcodeWidth, setBarcodeWidth] = useState(2)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const { data, refetch, isLoading, isError } = useQuery<ApiResponse, Error>(
    ['product', barcode],
    () => fetchProduct(barcode),
    { 
      enabled: false,
      retry: false,
    }
  )

  const handleSearch = useCallback((code: string) => {
    if (code && code.trim() !== '') {
      const trimmedCode = code.trim()
      console.log('Iniciando búsqueda para el código:', trimmedCode);
      setBarcode(trimmedCode)
      setDisplayedBarcode(trimmedCode)
      setHasSearched(true)
    } else {
      console.log('Intento de búsqueda con código vacío, ignorando.');
    }
  }, [])

  useEffect(() => {
    if (barcode) {
      refetch()
    }
  }, [barcode, refetch])

  useEffect(() => {
    setIsClient(true)

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentTime = new Date().getTime()
      
      if (event.key === 'Enter') {
        console.log('Enter presionado. Buffer actual:', barcodeBufferRef.current);
        if (barcodeBufferRef.current && barcodeBufferRef.current.trim() !== '') {
          handleSearch(barcodeBufferRef.current)
          barcodeBufferRef.current = ''
        } else {
          console.log('Buffer vacío al presionar Enter, ignorando.');
        }
      } else if (event.key.length === 1) { // Solo capturar caracteres imprimibles
        if (currentTime - lastKeyPressTimeRef.current > 100) {
          // Si ha pasado más de 100ms desde la última tecla, reiniciar el buffer
          barcodeBufferRef.current = ''
        }
        barcodeBufferRef.current += event.key
        console.log('Buffer actualizado:', barcodeBufferRef.current);
      }
      
      lastKeyPressTimeRef.current = currentTime
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSearch])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // sm
        setBarcodeWidth(1.5);
      } else if (window.innerWidth < 768) { // md
        setBarcodeWidth(2);
      } else {
        setBarcodeWidth(2.5);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const product = data?.Results[0]
  const productNotFound = hasSearched && (!product || !product.Nombre)

  const calculatePrice = (product: ProductResponse) => {
    const basePrice = parseFloat(product.PrecioClaseDefault.toFixed(3));
    const ivaAmount = product.AIVA ? (basePrice * product.PIVA / 100) : 0;
    return (basePrice + ivaAmount).toFixed(2);
  }

  return (
    <div className={`min-h-screen bg-gray-100 ${isFullScreen ? 'fixed inset-0 z-50' : ''}`} style={{ userSelect: 'none' }}>
      <header className="bg-blue-500 text-white p-2 sm:p-3 md:p-4 shadow-lg relative">
        <p className="font-bold text-lg sm:text-xl md:text-2xl">CONSULTOR DE PRECIOS</p>
        <button 
          onClick={toggleFullScreen} 
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
          aria-label={isFullScreen ? "Salir de pantalla completa" : "Entrar a pantalla completa"}
        >
          {isFullScreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </button>
      </header>

      {isClient ? (
      <div className="container mx-auto p-2 sm:p-3 md:p-4">
        <main>
          {isLoading && <div className="text-center text-lg sm:text-xl md:text-2xl text-gray-600">Cargando...</div>}
          {isError && <div className="text-center text-lg sm:text-xl md:text-2xl text-red-600">Error al buscar el producto</div>}
          {productNotFound && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 sm:p-3 mb-2 sm:mb-3" role="alert">
              <p className="font-bold text-base sm:text-lg md:text-xl">Producto no encontrado</p>
              <p className="text-sm sm:text-base md:text-lg">Por favor, intente escanear otro código de barras.</p>
            </div>
          )}
          {product && product.Nombre ? (
            <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full h-[16rem] sm:h-[20rem] md:h-[24rem] mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
                    <div className="relative w-full max-w-[18rem] sm:max-w-[22rem] md:max-w-[26rem] h-[16rem] sm:h-[20rem] md:h-[24rem] bg-white-200 rounded-lg flex items-center justify-center overflow-hidden">
                      <ProductImage
                        photoInfo={product.Foto}
                        alt={product.Nombre}
                      />
                    </div>
                  </div>
                  {displayedBarcode && (
                    <div className="w-full bg-white-100 p-2 sm:p-3 rounded-lg flex justify-center">
                      <Barcode 
                        value={displayedBarcode}
                        width={barcodeWidth}
                        height={50}
                        fontSize={14}
                        background="#ffffff"
                        lineColor="#000000"
                        margin={10}
                        displayValue={true}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="bg-white-100 p-2 sm:p-3 md:p-4 rounded-lg">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-gray-800">{product.Nombre}</h2>
                      <p className="text-lg sm:text-xl md:text-2xl text-gray-600">Cód: {product.Codigo}</p>
                    </div>
                    
                    <div className="bg-white-100 text-red-600 p-2 sm:p-3 md:p-4 rounded-lg my-2 sm:my-3 md:my-4">
                      <p className="font-semibold text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">Precio:</p>
                      <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-center">${calculatePrice(product)}</p>
                    </div>
                    <div className="bg-white-100 p-2 sm:p-3 md:p-4 rounded-lg">
                      <ul className="space-y-1 sm:space-y-2 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600">
                        <li><span className="font-semibold">Descripción:</span> {product.Descripcion}</li>
                        <li><span className="font-semibold">Empaque:</span> {product.Empaque}</li>
                        <li><span className="font-semibold">Stock:</span> {product.Stock}</li>
                        <li><span className="font-semibold">IVA:</span> {product.AIVA ? `${product.PIVA}%` : 'No aplica'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-4 text-center">
              <p className="text-base sm:text-lg md:text-xl text-gray-600">Escanee un código de barras para ver los  detalles del producto.</p>
            </div>
          )}
        </main>
      </div>
      ) : null}
    </div>
  )
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <BuscadorProductos />
    </QueryClientProvider> 
  )
}