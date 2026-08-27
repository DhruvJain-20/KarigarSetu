import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, SwitchCamera, AlertCircle } from 'lucide-react';

interface LiveCameraModalProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export function LiveCameraModal({ onCapture, onClose }: LiveCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      setError('');
      setIsReady(false);
      try {
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error);
            setIsReady(true);
          };
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setError('Camera permission was denied or camera is unavailable. Please allow camera access in your browser or choose file upload.');
      }
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      startCamera();
    } else {
      setError('Live camera is not supported in this browser. Please use the device file picker.');
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleTakePhoto = () => {
    if (!videoRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // If user facing, flip horizontally
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      // Stop camera tracks immediately
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onCapture(dataUrl);
      onClose();
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-stone-950 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-800 flex flex-col my-auto relative max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold">Capture Product Photo</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              if (stream) {
                stream.getTracks().forEach((t) => t.stop());
              }
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[340px] max-h-[60vh] overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-stone-300 space-y-3 max-w-xs">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover max-h-[60vh] ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
              {!isReady && (
                <div className="absolute inset-0 bg-stone-900/80 flex items-center justify-center gap-2 text-stone-200 text-sm font-medium">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Starting camera...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Camera Control Footer */}
        <div className="p-5 bg-stone-900/95 border-t border-stone-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={toggleCameraFacing}
            disabled={!isReady || !!error}
            className="w-12 h-12 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
            title="Flip camera"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>

          {/* Shutter Button */}
          <button
            type="button"
            disabled={!isReady || !!error}
            onClick={handleTakePhoto}
            className="w-16 h-16 rounded-full bg-white hover:bg-stone-200 p-1.5 shadow-lg transition-transform active:scale-95 disabled:opacity-40 flex items-center justify-center cursor-pointer"
          >
            <div className="w-full h-full rounded-full border-2 border-stone-900 bg-[#963E20] flex items-center justify-center text-white">
              <Camera className="w-6 h-6" />
            </div>
          </button>

          <div className="w-12 h-12" /> {/* Spacer */}
        </div>
      </div>
    </div>
  );
}
