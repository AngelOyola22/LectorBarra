"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Image as ImageIcon } from 'lucide-react'
import { useQuery, QueryClient, QueryClientProvider } from 'react-query'
import axios from 'axios'
import dynamic from 'next/dynamic'
import Barcode from 'react-barcode'

// Crear una instancia de QueryClient
const queryClient = new QueryClient()

// Definir la URL base de la API
const API_BASE_URL = '/api'

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

function BuscadorProductos() {
  const [barcode, setBarcode] = useState('')
  const [displayedBarcode, setDisplayedBarcode] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const barcodeBufferRef = useRef('')
  const lastKeyPressTimeRef = useRef(0)

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

  const product = data?.Results[0]
  const productNotFound = hasSearched && (!product || !product.Nombre)

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 p-6 shadow-lg">
        {/* Barra azul superior vacía */}
      </header>

      {isClient ? (
      <div className="container mx-auto p-6">
        <main>
          {isLoading && <div className="text-center text-2xl text-gray-600">Cargando...</div>}
          {isError && <div className="text-center text-2xl text-red-600">Error al buscar el producto</div>}
          {productNotFound && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
              <p className="font-bold">Producto no encontrado</p>
              <p>Por favor, intente escanear otro código de barras.</p>
            </div>
          )}
          {product && product.Nombre ? (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full h-80 mb-6 flex items-center justify-center">
                    <div className="relative w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.Foto ? (
                        <Image
                          src={`http://192.168.100.88:8081/images/${product.Foto}`}
                          alt={product.Nombre}
                          width={256}
                          height={256}
                          objectFit="contain"
                        />
                      ) : (
                        <ImageIcon className="w-32 h-32 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {displayedBarcode && (
                    <div className="w-full bg-gray-100 p-4 rounded-lg flex justify-center">
                      <Barcode 
                        value={displayedBarcode}
                        width={1.5}
                        height={80}
                        fontSize={14}
                        background="#f3f4f6"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">{product.Nombre}</h2>
                    <p className="text-2xl mb-4">Precio: <span className="font-bold text-green-600">${product.PrecioClaseDefault.toFixed(2)}</span></p>
                    <p className="text-xl mb-6 text-gray-600">Cód: {product.Codigo}</p>
                    <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
                      <p className="font-semibold text-lg">Costo</p>
                      <p className="text-3xl font-bold">${product.Costo.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-100 p-6 rounded-lg">
                      <h3 className="font-bold text-xl mb-4 text-gray-700">Detalles</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li><span className="font-semibold">Descripción:</span> {product.Descripcion}</li>
                        <li><span className="font-semibold">Empaque:</span> {product.Empaque}</li>
                        <li><span className="font-semibold">Stock:</span> {product.Stock}</li>
                        <li><span className="font-semibold">IVA:</span> {product.AIVA ? `${product.PIVA}%` : 'No aplica'}</li>
                        <li><span className="font-semibold">ICE:</span> {product.AICE ? `${product.PICE}%` : 'No aplica'}</li>
                        <li><span className="font-semibold">Impuesto Verde:</span> {product.AVERDE ? `${product.PVERDE}%` : 'No aplica'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Consultor de Productos</h2>
              <p className="text-xl text-gray-600">Escanee un código de barras para ver los detalles del producto.</p>
            </div>
          )}
        </main>
      </div>
      ) : null}
    </div>
  )
}

const BuscadorProductosDynamic = dynamic(() => Promise.resolve(BuscadorProductos), { 
  ssr: false,
  loading: () => <div>Loading...</div>
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BuscadorProductosDynamic />
    </QueryClientProvider> 
  )
}