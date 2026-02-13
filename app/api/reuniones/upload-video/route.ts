import { NextResponse } from "next/server";
import { createClient } from "@/backend/utils/supabase/server";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime", // .mov
];

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const formData = await req.formData();

    const video = formData.get("video") as File | null;
    const idReunion = Number(formData.get("id_reunion"));

    console.log("[UPLOAD-VIDEO] Datos recibidos", {
      hasVideo: !!video,
      idReunion,
      type: video?.type,
      size: video?.size,
      name: video?.name,
    });

    // 🔐 Validaciones duras
    if (!video || !idReunion || Number.isNaN(idReunion)) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    if (!ALLOWED_VIDEO_TYPES.includes(video.type)) {
      return NextResponse.json(
        { error: "Formato de vídeo no permitido" },
        { status: 400 }
      );
    }

    if (video.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "El vídeo supera el tamaño máximo permitido" },
        { status: 400 }
      );
    }

    // 📦 Path en storage
    const ext = video.name.split(".").pop();
    const path = `${idReunion}/video.${ext}`;

    console.log("[UPLOAD-VIDEO] Subiendo a storage", {
      bucket: "reuniones-videos",
      path,
    });

    const { error: uploadError } = await supabase.storage
      .from("reuniones-videos")
      .upload(path, video, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json(
        { error: "Error subiendo el vídeo" },
        { status: 500 }
      );
    }

    // 🌍 URL pública
    const { data } = supabase.storage
      .from("reuniones-videos")
      .getPublicUrl(path);

    const videoUrl = data.publicUrl;

    console.log("[UPLOAD-VIDEO] URL pública:", videoUrl);

    // 📝 Guardar URL en la BBDD
    const { error: updateError } = await supabase
      .from("reuniones")
      .update({ video: videoUrl })
      .eq("id_reuniones", idReunion);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json(
        { error: "Error guardando el vídeo en la base de datos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      video: videoUrl,
    });
  } catch (err) {
    console.error("[UPLOAD-VIDEO] Error inesperado", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
