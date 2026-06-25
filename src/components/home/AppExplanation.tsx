import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const STEPS = [
  {
    number: "1",
    title: "Link kopieren",
    description:
      "Öffne das TikTok, tippe auf Teilen und dann auf Link kopieren. Du kannst auch einfach eine Aussage eintippen.",
  },
  {
    number: "2",
    title: "Hier einfügen",
    description:
      "Füge den Link oben ein oder schreibe eine Aussage, die du checken willst.",
  },
  {
    number: "3",
    title: "Check starten",
    description:
      "Drücke auf Überprüfen. Wir schauen dann im Internet nach, was wirklich stimmt.",
  },
  {
    number: "4",
    title: "Ergebnis lesen",
    description:
      "Du siehst für jede Aussage, ob sie wahr, falsch oder nur teilweise richtig ist.",
  },
];

export const AppExplanation = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  return (
    <div className="fade-in-up-d3 mt-12 w-full">
      <h2 className="mb-4 font-display text-xl font-bold">
        So funktioniert es
      </h2>

      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {STEPS.map((step) => (
            <CarouselItem key={step.number} className="basis-full pl-3">
              <div className="flex min-h-[150px] items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-soft md:p-6">
                <span className="select-none font-display text-5xl font-extrabold leading-none text-primary">
                  {step.number}
                </span>
                <div>
                  <h3 className="mb-1.5 font-display text-base font-semibold">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => api?.scrollPrev()}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Vorheriger Schritt"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                aria-label={`Schritt ${index + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  current === index
                    ? "w-5 bg-foreground"
                    : "w-1.5 bg-border hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>

          <button
            onClick={() => api?.scrollNext()}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Nächster Schritt"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Carousel>
    </div>
  );
};
