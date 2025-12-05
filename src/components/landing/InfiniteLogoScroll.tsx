import somniaLogo from '../../assets/somnia.png';
import group10Image from '../../assets/Group 10.png';

export default function InfiniteLogoScroll() {
  // Array untuk membuat multiple logo instances
  const logoCount = 15;

  return (
    <div className="relative w-full">
      {/* Scrolling Container dengan CSS Animation - Full Width */}
      <div className="overflow-hidden pt-8 sm:pt-10 lg:pt-12 pb-4 sm:pb-6 lg:pb-8">
        <div className="flex gap-12 sm:gap-16 lg:gap-20 animate-infinite-scroll">
          {/* First set of logos */}
          {Array.from({ length: logoCount }).map((_, index) => (
            <div 
              key={`logo-1-${index}`}
              className="flex-shrink-0 flex items-center justify-center group"
            >
              <img 
                src={somniaLogo} 
                alt="Somnia" 
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain opacity-50 group-hover:opacity-100 transition-opacity duration-300 filter brightness-90 group-hover:brightness-110"
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {Array.from({ length: logoCount }).map((_, index) => (
            <div 
              key={`logo-2-${index}`}
              className="flex-shrink-0 flex items-center justify-center group"
            >
              <img 
                src={somniaLogo} 
                alt="Somnia" 
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain opacity-50 group-hover:opacity-100 transition-opacity duration-300 filter brightness-90 group-hover:brightness-110"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Group 10 Image - Full Width */}
      <div className="w-full -mt-4 sm:-mt-6 lg:-mt-8">
        <img 
          src={group10Image} 
          alt="Powered by Somnia" 
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}
