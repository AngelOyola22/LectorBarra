"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, Heart, ShoppingBag, Search, Image as ImageIcon } from 'lucide-react'
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
  const [searchCode, setSearchCode] = useState('')
  const [isClient, setIsClient] = useState(false)
  const { data, refetch, isLoading, isError } = useQuery<ApiResponse, Error>(
    ['product', searchCode],
    () => fetchProduct(searchCode),
    { enabled: false }
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  const product = data?.Results[0]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Star className="w-8 h-8" />
            <h1 className="text-3xl font-bold">LOGO</h1>
          </div>
          <div className="flex items-center space-x-6">
            <Heart className="w-6 h-6 hover:text-pink-300 transition-colors duration-200" />
            <ShoppingBag className="w-6 h-6 hover:text-yellow-300 transition-colors duration-200" />
          </div>
        </div>
      </header>

      {isClient ? (
      <div className="container mx-auto p-6">
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-12">
          <input
            type="text"
            placeholder="Buscar código de producto"
            className="w-full pl-5 pr-12 py-3 rounded-full text-lg text-gray-700 border-2 border-blue-500 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
          <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-colors duration-200">
            <Search className="w-6 h-6" />
          </button>
        </form>

        <main>
          {isLoading && <div className="text-center text-2xl text-gray-600">Cargando...</div>}
          {isError && <div className="text-center text-2xl text-red-600">Error al buscar el producto</div>}
          {product ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full h-80 mb-6 flex items-center justify-center">
                    <div className="relative w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.Foto ? (
                        <Image
                          //src={`./graficos/${product.Foto}`}
                          src ={"./graficos/04dsc5.jpg"}
                          alt={product.Nombre}
                          layout="fill"
                          objectFit="contain"
                        />
                      ) : (
                        <ImageIcon className="w-32 h-32 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 p-4 rounded-lg flex justify-center">
                    <Barcode 
                      value={product.Codigo}
                      width={1.5}
                      height={80}
                      fontSize={14}
                      background="#f3f4f6"
                    />
                  </div>
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
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Buscador de Productos</h2>
              <p className="text-xl text-gray-600">Ingrese un código de producto en la barra de búsqueda y presione Enter para ver los detalles.</p>
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