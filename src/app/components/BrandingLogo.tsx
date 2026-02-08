import { Sprout } from "lucide-react";
import { cn } from "../utils/cn";

interface BrandingLogoProps {
    className?: string;
    iconOnly?: boolean;
    withText?: boolean;
    isBilingual?: boolean;
    textColor?: string;
}

export default function BrandingLogo({
    className,
    iconOnly = false,
    withText = true,
    isBilingual = false,
    textColor = "text-foreground"
}: BrandingLogoProps) {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center p-2 shrink-0 shadow-lg shadow-primary/5">
                <div className="relative">
                    <Sprout className="w-6 h-6 text-primary" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
                </div>
            </div>

            {!iconOnly && withText && (
                <div className="flex flex-col">
                    <span className={cn("font-bold text-xl leading-none", textColor)}>
                        منصة الفلاح
                    </span>
                    {isBilingual && (
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
                            Al-Fallah Platform
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
