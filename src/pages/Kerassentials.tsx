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
        <div className="flex-shrink-0 flex flex-col items-center">
          <a 
            href="https://www.checkout-ds24.com/redir/533765/Adrielnobre88/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              size="lg"
              className="bg-tiffany-500 hover:bg-tiffany-600 text-white font-bold text-lg lg:text-2xl px-10 lg:px-16 py-5 lg:py-8 rounded-full shadow-xl animate-pulse-slow transition-all duration-300 hover:scale-105"
            >
              Order Now
            </Button>
          </a>
          <span className="text-tiffany-700 font-bold text-sm lg:text-base mt-2">You Save $200</span>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="flex-1 px-4 lg:px-12 py-2 overflow-hidden flex flex-col">
        {/* Benefits Title */}
        <h2 className="text-lg lg:text-xl font-bold text-tiffany-700 text-center mb-2">
          BENEFITS
        </h2>
        
        {/* Benefits Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 lg:gap-2 max-h-[220px] lg:max-h-[120px] max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white/40 backdrop-blur-md rounded-lg p-1.5 lg:p-2 border border-white/50 shadow-lg transition-all duration-300 hover:bg-white/70 hover:scale-105 hover:shadow-2xl hover:border-tiffany-300 cursor-default group"
            >
              <h3 className="text-[9px] lg:text-[10px] font-bold text-tiffany-700 mb-0.5 group-hover:text-tiffany-800 transition-colors">{benefit.title}</h3>
              <ul className="space-y-0">
                {benefit.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-[8px] lg:text-[9px] text-tiffany-600 flex items-start gap-0.5 group-hover:text-tiffany-700 transition-colors">
                    <span className="text-tiffany-500 mt-0.5 group-hover:text-tiffany-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Guarantee Section */}
        <div className="flex items-center justify-center gap-4 lg:gap-8 mt-3 bg-white/30 backdrop-blur-md rounded-xl p-3 lg:p-4 border border-white/50">
          <a 
            href="https://www.checkout-ds24.com/redir/533765/Adrielnobre88/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <img 
              src="https://xatimg.com/image/RKfVH1cPO9za.png" 
              alt="60-Day Money Back Guarantee" 
              className="w-16 lg:w-24 h-auto cursor-pointer hover:scale-105 transition-transform"
            />
          </a>
          <div className="text-left">
            <h3 className="text-sm lg:text-lg font-bold text-tiffany-700">100% Satisfaction</h3>
            <h4 className="text-xs lg:text-base font-semibold text-tiffany-600 mb-1">60-Day Money Back Guarantee</h4>
            <p className="text-[10px] lg:text-xs text-tiffany-600 max-w-md">
              Your order today is covered by our iron-clad 60-day 100% money-back guarantee. If you are not impressed with the results, then just write to us and we'll refund every single cent.
            </p>
          </div>
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
