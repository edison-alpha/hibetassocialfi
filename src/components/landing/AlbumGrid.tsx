interface AlbumGridProps {
  albums: string[];
}

export const AlbumGrid = ({ albums }: AlbumGridProps) => {
  // Duplicate albums exactly 2x for seamless infinite scroll
  const duplicatedAlbums = [...albums, ...albums];

  return (
    <div className="relative w-full py-4 sm:py-6 lg:py-8" style={{ overflow: 'hidden' }}>
      {/* Overlay atas - tebal dan melengkung di bawah garis */}
      <div className="absolute top-0 left-0 right-0 h-24 sm:h-28 lg:h-32 pointer-events-none z-10">
        <svg className="w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
          {/* Area melengkung di bawah garis - tebal simetris kiri dan kanan */}
          <path 
            d="M 0,0 Q 600,130 1200,0 L 1200,80 Q 600,210 0,80 Z" 
            fill="hsl(280, 50%, 6%)"
          />
          
          {/* Border top lime - mengikuti kurva cekung */}
          <path 
            d="M 0,0 Q 600,130 1200,0" 
            fill="none" 
            stroke="#d5fd4c" 
            strokeWidth="2"
          />
        </svg>
      </div>
      
      {/* Overlay bawah - hanya lengkungan tanpa solid bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 lg:h-32 pointer-events-none z-10">
        <svg className="w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
          {/* Bagian cekung - 100% solid, extend ke bawah */}
          <path 
            d="M 0,150 Q 600,20 1200,150 L 1200,200 L 0,200 Z" 
            fill="hsl(280, 50%, 6%)"
          />
          
          {/* Border top lime - mengikuti kurva cekung */}
          <path 
            d="M 0,150 Q 600,20 1200,150" 
            fill="none" 
            stroke="#d5fd4c" 
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="relative w-full">
        <div className="relative">
          {/* Scrolling Albums - Full width edge to edge */}
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <div className="flex gap-[0.5rem] sm:gap-[0.7rem] lg:gap-[1rem] py-4 animate-infinite-scroll">
              {duplicatedAlbums.map((album, index) => (
                <div 
                  key={index}
                  className="group relative w-[10.5rem] h-[13.5rem] sm:w-[12.6rem] sm:h-[16.8rem] lg:w-[15.75rem] lg:h-[19.95rem] rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-300"
                  style={{
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(213, 253, 76, 0.1)'
                  }}
                >
                  <img 
                    src={album} 
                    alt={`Album ${(index % albums.length) + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-[0.7875rem] left-[0.7875rem] right-[0.7875rem] sm:bottom-[1.05rem] sm:left-[1.05rem] sm:right-[1.05rem]">
                      <h3 className="font-clash font-semibold text-[0.9188rem] sm:text-[1.05rem] lg:text-[1.1813rem] text-white mb-[0.2625rem] sm:mb-[0.3938rem]">
                        Album {(index % albums.length) + 1}
                      </h3>
                      <p className="font-clash text-[0.7875rem] sm:text-[0.9188rem] lg:text-[1.05rem] text-white/70">
                        Various Artists
                      </p>
                    </div>
                  </div>

                  {/* Reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Border glow on hover */}
                  <div className="absolute inset-0 border-2 border-[#a8c686]/0 group-hover:border-[#a8c686]/30 rounded-2xl transition-all duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced ambient glow effects - Responsive */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-80 sm:h-80 lg:w-[30rem] lg:h-[30rem] bg-[#a8c686]/6 sm:bg-[#a8c686]/8 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-80 sm:h-80 lg:w-[30rem] lg:h-[30rem] bg-purple-500/6 sm:bg-purple-500/8 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] pointer-events-none" />
    </div>
  );
};

