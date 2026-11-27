import Image from "next/image";
import { getValidImageUrl } from "@/lib/utils";

export function CatalogImage({ src, alt, sizes = "(min-width: 1024px) 25vw, 50vw", eager = false, className = "object-cover" }: {
  src: string; alt: string; sizes?: string; eager?: boolean; className?: string;
}) {
  const valid = getValidImageUrl(src);
  return valid ? <Image src={valid} alt={alt} fill sizes={sizes} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} className={className} /> :
    <div className="absolute inset-0 grid place-items-center text-sm text-black/50">Image unavailable</div>;
}
