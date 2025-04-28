<<<<<<< HEAD
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { ChatbotDemo } from "@/components/chatbot-demo";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
//import SignIn from "@/components/users"; // Make sure the SignIn component is imported
=======
import { Hero } from "../components/hero"
import { Features } from "../components/features"
import { ChatbotDemo } from "../components/chatbot-demo"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"
>>>>>>> 98b11b37ee556358b2ef7fdc14c5678342628e26

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
     
        {/* Optionally, you can conditionally show the sign-in page if the user is not authenticated */}
       

        <Hero />
        <Features />
        <ChatbotDemo />
      
      <Footer />
    </div>
  );
}
