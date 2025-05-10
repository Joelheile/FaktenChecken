import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="flex flex-col items-center relative">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-100/20 via-transparent to-purple-100/20 rounded-3xl blur-3xl" />

      <div className="flex flex-col items-center mb-6 md:mb-8 relative">
        <div className="flex justify-center mb-4 transform transition-transform  hover:scale-105 duration-300">
          <img
            src="/schule.png"
            alt="Ernst-Schering-Schule Logo"
            className="h-16 md:h-20 bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg"
          />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          TikTok Faktencheck
        </h1>
        <p className="text-sm md:text-base text-gray-600 text-center max-w-md">
          Du hast ein TikTok-Video gesehen und bist dir nicht sicher, ob die
          Behauptungen darin stimmen? Unser KI-Tool überprüft die Fakten für
          dich!
        </p>
      </div>
    </header>
  );
};
