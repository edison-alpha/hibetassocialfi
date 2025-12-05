import { useState } from 'react';
import { Star } from 'lucide-react';

const reviews = [
  {
    name: 'Riley Williams',
    role: 'Producer, Wave Music',
    avatar: 'https://www.figma.com/api/mcp/asset/64b6a8c7-74b7-462d-a310-867335093b23',
    rating: 5,
    quote: 'In love with this!',
    text: 'Maple Street is very eager to work with Toby on a variety of project in the future. A terrific voice end an amazingly quick turnaround equals a very happy production company!',
  },
  {
    name: 'Sarah Johnson',
    role: 'Music Producer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    rating: 5,
    quote: 'Amazing platform!',
    text: 'HiBeats has revolutionized how I create music. The AI suggestions are incredibly accurate and inspiring! This is the future of music creation.',
  },
  {
    name: 'Mike Chen',
    role: 'Independent Artist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    rating: 5,
    quote: 'Highly recommended!',
    text: 'The best platform for discovering new music and connecting with other artists. The community is amazing and the tools are top-notch!',
  },
];

export const ReviewCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentReview = reviews[currentIndex];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  if (!currentReview) return null;

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-[4.2rem] sm:h-[4.2rem] lg:w-[5.25rem] lg:h-[5.25rem] rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 z-10 rotate-180"
      >
        <svg className="w-6 h-6 sm:w-[1.85rem] sm:h-[1.85rem] lg:w-[2.625rem] lg:h-[2.625rem] rotate-[270deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <button
        onClick={next}
        className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-[4.2rem] sm:h-[4.2rem] lg:w-[5.25rem] lg:h-[5.25rem] rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 z-10 scale-y-[-1]"
      >
        <svg className="w-6 h-6 sm:w-[1.85rem] sm:h-[1.85rem] lg:w-[2.625rem] lg:h-[2.625rem] rotate-[270deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Review Card */}
      <div className="px-[4.2rem] sm:px-[5.25rem] lg:px-[6.3rem]">
        <div className="relative">
          {/* Avatar */}
          <div className="flex justify-center mb-[1.05rem] sm:mb-[1.575rem] lg:mb-[2.1rem]">
            <img 
              src={currentReview.avatar} 
              alt={currentReview.name}
              className="w-[8.4rem] h-[7.35rem] sm:w-[11.55rem] sm:h-[9.45rem] lg:w-[14.7rem] lg:h-[12.6rem] object-cover rounded-xl sm:rounded-2xl shadow-[10px_2px_2px_0px_rgba(0,0,0,0.25)]"
            />
          </div>

          {/* Name and Role */}
          <h3 className="font-clash font-semibold text-[1.3125rem] sm:text-[1.575rem] lg:text-[1.9688rem] xl:text-[2.625rem] text-[#d5fd4c] text-center mb-[0.2625rem] sm:mb-[0.525rem]">
            {currentReview.name}
          </h3>
          <p className="font-clash text-[0.9188rem] sm:text-[1.05rem] lg:text-[1.1813rem] text-white text-center mb-[1.05rem] sm:mb-[1.575rem] lg:mb-[2.1rem]">
            {currentReview.role}
          </p>

          {/* Quote */}
          <p className="font-clash font-semibold text-[1.1813rem] sm:text-[1.3125rem] lg:text-[1.575rem] text-white text-center mb-[1.05rem] sm:mb-[1.575rem] lg:mb-[2.1rem]">
            "{currentReview.quote}"
          </p>

          {/* Review Text */}
          <p className="font-clash text-[0.9188rem] sm:text-[1.05rem] lg:text-[1.1813rem] text-white text-center leading-relaxed mb-[1.05rem] sm:mb-[1.575rem] lg:mb-[2.1rem] max-w-3xl mx-auto">
            {currentReview.text}
          </p>

          {/* Stars */}
          <div className="flex items-center justify-center gap-[0.3938rem] sm:gap-[0.525rem] lg:gap-[0.7875rem] mb-[1.05rem] sm:mb-[1.575rem] lg:mb-[2.1rem]">
            {Array.from({ length: currentReview.rating }).map((_, i) => (
              <Star key={i} className="w-[1.3125rem] h-[1.3125rem] sm:w-[1.575rem] sm:h-[1.575rem] lg:w-[1.8375rem] lg:h-[1.8375rem] fill-[#FFCB45] text-[#FFCB45]" />
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-[0.3938rem] sm:gap-[0.525rem]">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-[0.525rem] sm:h-[0.6563rem] lg:h-[0.7875rem] rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-[#d5fd4c] w-[1.575rem] sm:w-[1.8375rem] lg:w-[2.1rem]' 
                    : 'bg-white/30 hover:bg-white/50 w-[0.525rem] sm:w-[0.6563rem] lg:w-[0.7875rem]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
