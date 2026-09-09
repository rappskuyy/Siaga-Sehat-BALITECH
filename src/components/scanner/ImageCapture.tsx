import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, FlipHorizontal, ImagePlus, RotateCcw, UploadCloud, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface SelectedImage {
  base64: string;
  mediaType: string;
  previewUrl: string;
}

export interface ScanAlertInfo {
  title: string;
  message: string;
  details?: string[];
}

interface ImageCaptureProps {
  image: SelectedImage | null;
  onChange: (image: SelectedImage | null) => void;
  disabled?: boolean;
  alert?: ScanAlertInfo | null;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function fileToSelectedImage(file: File): Promise<SelectedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const result = reader.result as string;
      const [, base64] = result.split(",");
      resolve({ base64, mediaType: file.type, previewUrl: result });
    };
    reader.readAsDataURL(file);
  });
}

export function ImageCapture({
  image,
  onChange,
  disabled,
  alert,
}: ImageCaptureProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  useEffect(() => {
    if (!cameraOpen) {
      stopCamera();
      return;
    }
    setCameraError(null);
    let cancelled = false;

    stopCamera();

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn("getUserMedia facingMode failed, retrying fallback:", err);
        if (!cancelled) {
          navigator.mediaDevices
            ?.getUserMedia({ video: true, audio: false })
            .then((stream) => {
              if (cancelled) {
                stream.getTracks().forEach((track) => track.stop());
                return;
              }
              streamRef.current = stream;
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
            })
            .catch(() => {
              if (!cancelled) {
                setCameraError(
                  "Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan, atau gunakan opsi unggah foto.",
                );
              }
            });
        }
      });

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [cameraOpen, facingMode, stopCamera]);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      const file = fileList?.[0];
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        window.alert("Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.");
        return;
      }
      const selected = await fileToSelectedImage(file);
      onChange(selected);
    },
    [onChange],
  );

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const [, base64] = dataUrl.split(",");
    onChange({ base64, mediaType: "image/jpeg", previewUrl: dataUrl });
    setCameraOpen(false);
  }, [facingMode, onChange]);

  if (image) {
    return (
      <div className="relative overflow-hidden rounded-[24px] bg-black/5 shadow-[var(--shadow-clinic)]">
        <img
          src={image.previewUrl}
          alt="Foto yang dipilih"
          width="400"
          height="300"
          loading="lazy"
          decoding="async"
          className={`aspect-[4/3] w-full object-cover transition duration-300 ${
            alert ? "brightness-50 filter blur-[1.5px]" : ""
          }`}
        />
        {!disabled && !alert && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[color:var(--color-clinic-ink)] shadow-md backdrop-blur transition hover:bg-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Ganti Foto
          </button>
        )}

        {/* Centered Alert Overlay directly in the middle of the frame */}
        {alert && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-3.5 sm:p-5 bg-black/40 backdrop-blur-[2px] animate-fade-in">
            <div className="relative w-full max-w-sm sm:max-w-md max-h-[94%] overflow-y-auto rounded-2xl border-2 border-amber-300 bg-white/98 p-4 sm:p-5 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-xs">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wide">
                    Perhatian Foto
                  </span>
                  <h3 className="mt-0.5 text-sm sm:text-base font-bold text-amber-950 leading-snug">
                    {alert.title}
                  </h3>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-amber-50/90 p-2.5 sm:p-3 border border-amber-200">
                <p className="text-xs sm:text-[13px] leading-relaxed text-amber-950 font-medium">
                  {alert.message}
                </p>
              </div>

              {alert.details && alert.details.length > 0 && (
                <div className="mt-2.5 rounded-xl bg-slate-50 p-2.5 sm:p-3 border border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    Hal yang Perlu Diperbaiki:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-[11px] text-slate-700">
                    {alert.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3.5 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => onChange(null)}
                  className="w-full gap-2 rounded-full bg-[color:var(--color-clinic-blue)] py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[color:var(--color-clinic-blue-dark)] shadow-xs"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ganti / Foto Ulang
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`group relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed bg-[color:var(--color-clinic-blue-soft)]/40 text-center transition ${
          isDragging
            ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]"
            : "border-[color:var(--color-clinic-blue)]/30 hover:border-[color:var(--color-clinic-blue)]/60"
        }`}
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-md transition group-hover:scale-105">
          <UploadCloud className="h-7 w-7 text-[color:var(--color-clinic-blue)]" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-[color:var(--color-clinic-ink)]">
            Tempat Upload Gambar
          </p>
          <p className="mt-1 max-w-xs text-xs text-[color:var(--color-clinic-muted)]">
            Klik atau seret foto ke sini (JPG, PNG, WebP)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 rounded-full border-[color:var(--color-clinic-blue)]/30 py-6 text-[color:var(--color-clinic-ink)] hover:bg-[color:var(--color-clinic-blue-soft)]"
        onClick={() => setCameraOpen(true)}
      >
        <Camera className="h-4 w-4 text-[color:var(--color-clinic-blue)]" />
        Ambil Foto Langsung
      </Button>

      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2 font-display">
              <Camera className="h-5 w-5 text-[color:var(--color-clinic-blue)]" />
              Ambil Foto
            </DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleCamera}
              className="gap-1.5 rounded-full text-xs font-semibold border-[color:var(--color-clinic-blue)]/30 text-[color:var(--color-clinic-ink)] hover:bg-[color:var(--color-clinic-blue-soft)]"
            >
              <FlipHorizontal className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)]" />
              {facingMode === "user" ? "Kamera Depan" : "Kamera Belakang"}
            </Button>
          </DialogHeader>

          {cameraError ? (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{cameraError}</div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`aspect-[4/3] w-full object-cover ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />
              <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-white/60" />

              <button
                type="button"
                onClick={toggleCamera}
                className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/80"
              >
                <FlipHorizontal className="h-3.5 w-3.5" />
                <span>{facingMode === "user" ? "Kamera Depan" : "Kamera Belakang"}</span>
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCameraOpen(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Batal
            </Button>
            <Button
              type="button"
              disabled={!!cameraError}
              onClick={capturePhoto}
              className="gap-2 rounded-full bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]"
            >
              <ImagePlus className="h-4 w-4" />
              Ambil Foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
