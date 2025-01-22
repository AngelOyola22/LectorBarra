import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("Missing URL parameter", { status: 400 });
    }

    const response = await fetch(imageUrl, {
      headers: {
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image. Status: ${response.status}`, {
        status: response.status,
      });
    }

    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "image/jpeg");
    
    // Añadir más cabeceras de CORS para asegurar que el navegador permita la respuesta
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    return new NextResponse(buffer, {
      headers: headers,
      status: 200,
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
