import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ProductsSection from './ProductsSection';
import WhyUsSection from './WhyUsSection';
import ContactSection from './ContactSection';
import FaqSection from './FaqSection';
import Footer from './Footer';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ProductsSection />
        <WhyUsSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}