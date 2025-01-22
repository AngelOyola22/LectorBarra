"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const IMAGE_BASE_URL = "https://177.234.196.99:8089/images/";
const FALLBACK_IMAGE_URL = "https://177.234.196.99:8089/images/LOGONEXT.png";

export default function ProductImage({ photoInfo, alt }: { photoInfo: string | null; alt: string }) {
  const [imgSrc, setImgSrc] = useState<string>(FALLBACK_IMAGE_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      if (photoInfo) {
        try {
          const response = await fetch(`${IMAGE_BASE_URL}${photoInfo}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          objectUrlRef.current = objectUrl; // Guardar el objeto URL en la referencia
          setImgSrc(objectUrl);
          setIsLoading(false);
        } catch (e) {
          console.error(`Error loading image: ${e instanceof Error ? e.message : String(e)}`);
          setError(`Error loading image: ${e instanceof Error ? e.message : String(e)}`);
          setImgSrc(FALLBACK_IMAGE_URL);
          setIsLoading(false);
        }
      } else {
        setImgSrc(FALLBACK_IMAGE_URL);
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup function to revocar el objeto URL
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [photoInfo]); // `imgSrc` ya no está en las dependencias

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">Cargando imagen...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        fill
        className="object-contain p-2 sm:p-3 md:p-4"
        onError={() => {
          console.warn(`Error al cargar la imagen: ${imgSrc}`);
          setImgSrc(FALLBACK_IMAGE_URL);
        }}
        unoptimized
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
