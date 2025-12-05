interface EcosystemGridProps {
  ecosystem: {
    hibeatMusic: string;
    musicChart: string;
    liveDiffuser: string;
    channel: string;
    tuneAI: string;
    aiPlaylist: string;
  };
}

export const EcosystemGrid = ({ ecosystem }: EcosystemGridProps) => {
  const items = [
    { image: ecosystem.hibeatMusic, title: 'HiBeats Music', gradient: 'from-purple-600 to-black', imageStyle: 'object-cover' },
    { image: ecosystem.musicChart, title: 'Top Music', gradient: 'from-blue-600 to-black', imageStyle: 'object-cover' },
    { image: ecosystem.liveDiffuser, title: 'YourVibe', gradient: 'from-blue-500 via-indigo-700 to-black', imageStyle: 'object-contain scale-75' },
    { image: ecosystem.channel, title: 'AI Agent create song', gradient: 'from-gray-800 to-black', imageStyle: 'object-cover' },
    { image: ecosystem.tuneAI, title: 'Beats', gradient: 'from-gray-900 to-black', imageStyle: 'object-cover' },
    { image: ecosystem.aiPlaylist, title: 'AI Playlist Agent', gradient: 'from-gray-900 to-black', imageStyle: 'object-cover' },
  ];

  return (
    <div className="relative -mx-[1.05rem] sm:-mx-[1.575rem]">
      {/* Left Fade Overlay - Extended to edge */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 md:w-40 lg:w-48 bg-gradient-to-r from-[#180a1f] via-[#180a1f]/90 via-[#180a1f]/60 to-transparent z-10 pointer-events-none" />
      
      {/* Right Fade Overlay - Extended to edge */}
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 md:w-40 lg:w-48 bg-gradient-to-l from-[#180a1f] via-[#180a1f]/90 via-[#180a1f]/60 to-transparent z-10 pointer-events-none" />
      
      <div className="overflow-x-auto pb-[1.05rem] scrollbar-hide scroll-smooth">
        <div className="flex gap-[2rem] sm:gap-[2.5rem] lg:gap-[3rem] min-w-max px-[1.05rem] sm:px-[1.575rem]">
          {items.map((item, index) => (
            <div 
              key={index}
              className={`relative w-[10rem] h-[13rem] sm:w-[13rem] sm:h-[16rem] lg:w-[16rem] lg:h-[19rem] rounded-2xl sm:rounded-3xl lg:rounded-[42px] overflow-hidden group hover:scale-105 transition-transform duration-300 bg-gradient-to-b ${item.gradient}`}
            >
              <img 
                src={item.image} 
                alt={item.title}
                className={`absolute inset-0 w-full h-full ${item.imageStyle} opacity-90`}
              />
              
              <div className="absolute inset-0 p-[0.875rem] sm:p-[1.25rem] lg:p-[1.5rem] flex flex-col justify-start">
                <h3 className="font-clash font-semibold text-[1.125rem] sm:text-[1.25rem] lg:text-[1.5rem] xl:text-[1.875rem] text-white leading-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
