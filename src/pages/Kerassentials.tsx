import { Button } from "@/components/ui/button";

const benefits = [
  {
    title: "Lavender Oil",
    items: ["Protects nail keratin", "Supports the nails and skin", "Fights against strong fungus"]
  },
  {
    title: "Organic Flaxseed Oil",
    items: ["Boosts skin's natural immunity", "Helps with inflammation", "Superfood for your skin"]
  },
  {
    title: "Almond Oil",
    items: ["Helps prevent fungus", "Protects against infections", "Supports healthy nails"]
  },
  {
    title: "Tea Tree Oil",
    items: ["Strong antifungal properties", "Helps curb fungus growth", "Safe and effective"]
  },
  {
    title: "Lemongrass Oil",
    items: ["Efficient antifungal", "Prevents future infection", "Helps with inflammation"]
  },
  {
    title: "Aloe Vera",
    items: ["Soothes the skin", "Strong antifungal", "Moisturizes the skin"]
  },
  {
    title: "Tocopheryl Acetate",
    items: ["Stable form of Vit. E", "Protects the skin", "Prevents skin aging"]
  },
  {
    title: "Undecylenic Acid",
    items: ["Beneficial fatty acid", "Helps prevent fungus", "Helps protect the nails"]
  }
];

export const Kerassentials = () => {
  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gradient-to-br from-white via-tiffany-50 to-tiffany-100 flex flex-col">
      {/* Header Section - 3 columns: Image | Title | Button */}
      <div className="flex-shrink-0 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 px-4 lg:px-12 pt-4 lg:pt-6">
        {/* Product Image - Clickable */}
        <a 
          href="https://www.checkout-ds24.com/redir/533765/Adrielnobre88/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
        >
          <img 
            src="https://xatimg.com/image/PFQkdzN2bwxV.png" 
            alt="Kerassentials" 
            className="w-52 lg:w-72 h-auto drop-shadow-2xl cursor-pointer"
          />
        </a>
        
        {/* Title Section */}
        <div className="text-center lg:text-left max-w-md">
          <h1 className="text-xl lg:text-3xl font-bold text-tiffany-700 leading-tight mb-2">
            These Special Oils Fight Fungus<br />
            Resistance And Support Healthy<br />
            Nails And Skin
          </h1>
          <p className="text-sm lg:text-base text-tiffany-600">
            Maintain the health of your nails and skin with this revolutionary treatment
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex-shrink-0">
          <a 
            href="https://www.checkout-ds24.com/redir/533765/Adrielnobre88/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              size="lg"
              className="bg-tiffany-500 hover:bg-tiffany-600 text-white font-bold text-base lg:text-xl px-8 lg:px-12 py-4 lg:py-6 rounded-full shadow-xl animate-pulse-slow transition-all duration-300 hover:scale-105"
            >
              Order Now
            </Button>
          </a>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="flex-1 px-4 lg:px-12 py-3 overflow-hidden flex flex-col">
        {/* Benefits Title */}
        <h2 className="text-xl lg:text-2xl font-bold text-tiffany-700 text-center mb-3">
          BENEFITS
        </h2>
        
        {/* Benefits Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 lg:gap-3 flex-1 max-h-[280px] lg:max-h-[240px]">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white/40 backdrop-blur-md rounded-xl p-3 lg:p-4 border border-white/50 shadow-lg transition-all duration-300 hover:bg-white/70 hover:scale-105 hover:shadow-2xl hover:border-tiffany-300 cursor-default group"
            >
              <h3 className="text-xs lg:text-sm font-bold text-tiffany-700 mb-1 lg:mb-2 group-hover:text-tiffany-800 transition-colors">{benefit.title}</h3>
              <ul className="space-y-0.5">
                {benefit.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-[10px] lg:text-xs text-tiffany-600 flex items-start gap-1 group-hover:text-tiffany-700 transition-colors">
                    <span className="text-tiffany-500 mt-0.5 group-hover:text-tiffany-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="flex-shrink-0 px-4 lg:px-12 pb-4 flex items-center justify-center">
        <img 
          src="https://xatimg.com/image/3IKtnxGnbzj7.png" 
          alt="Natural Formula - Plant Ingredients - Non-GMO - Easy To Use - No Chemicals - No Stimulants" 
          className="h-10 lg:h-12 w-auto"
        />
      </div>
    </div>
  );
};

export default Kerassentials;
