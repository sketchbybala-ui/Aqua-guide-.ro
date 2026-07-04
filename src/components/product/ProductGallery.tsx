import Image from "next/image";

export function ProductGallery({
  imageUrl,
  alt,
}: {
  imageUrl: string | null;
  alt: string;
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="object-cover"
          priority
        />
      )}
    </div>
  );
}
