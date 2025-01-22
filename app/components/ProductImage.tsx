"use client";

import { useState, useEffect, useRef } from "react";

const IMAGE_BASE_URL = "https://177.234.196.99:8089/images/";
const FALLBACK_IMAGE_URL = "https://177.234.196.99:8089/images/LOGONEXT.png";

export default function ProductImage({ photoInfo, alt }: { photoInfo: string | null; alt: string }) {
  const [imgSrc, setImgSrc] = useState<string>(FALLBACK_IMAGE_URL);
  const [isLoading, setIsLoading] = useState(true);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      if (photoInfo) {
        try {
          const response = await fetch(`${IMAGE_BASE_URL}${photoInfo}`, {
            headers: {
              Accept: "image/*",
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          objectUrlRef.current = objectUrl; // Guardar el objeto URL en la referencia
          setImgSrc(objectUrl);
          setIsLoading(false);
        } catch (error) {
          console.error("Error loading image:", error);
          setImgSrc(FALLBACK_IMAGE_URL);
          setIsLoading(false);
        }
      } else {
        setImgSrc(FALLBACK_IMAGE_URL);
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup function to revoke the object URL
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [photoInfo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">Cargando imagen...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={imgSrc || FALLBACK_IMAGE_URL}
        alt={alt}
        className="object-contain p-2 sm:p-3 md:p-4"
        onError={() => setImgSrc(FALLBACK_IMAGE_URL)}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
