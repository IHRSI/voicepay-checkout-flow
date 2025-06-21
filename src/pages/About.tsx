import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Shield, Mic, MicOff } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

const About = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [voiceMode, setVoiceMode] = useState(true);

  const handleVoiceCommand = (transcript: string) => {
    const cleanTranscript = transcript.toLowerCase().trim();
    console.log('About voice command:', cleanTranscript);
    
    // Navigation commands
    if (cleanTranscript.includes('home') || cleanTranscript.includes('होम')) {
      console.log('Going to home');
      navigate('/');
      return;
    }
    
    if (cleanTranscript.includes('cart') || cleanTranscript.includes('कार्ट') ||
        cleanTranscript.includes('card') || cleanTranscript.includes('shopping')) {
      console.log('Going to cart');
      navigate('/cart');
      return;
    }

    if (cleanTranscript.includes('checkout') || cleanTranscript.includes('चेकआउट')) {
      console.log('Going to checkout');
      navigate('/checkout');
      return;  
    }

    if (cleanTranscript.includes('our aim') || cleanTranscript.includes('हमारा लक्ष्य') ||
        cleanTranscript.includes('aim') || cleanTranscript.includes('mission')) {
      console.log('Going to our aim');
      navigate('/our-aim');
      return;
    }

    // Help command
    if (cleanTranscript.includes('help') || cleanTranscript.includes('मदद')) {
      const helpText = language === 'hi'
        ? 'आप कह सकते हैं: होम, कार्ट, चेकआउट, या हमारा लक्ष्य।'
        : 'You can say: home, cart, checkout, or our aim.';
      speak(helpText);
    }
  };

  const { isListening, currentTranscript, speak } = useVoiceRecognition({
    voiceMode,
    currentStep: 1,
    onVoiceCommand: handleVoiceCommand
  });

  // Welcome message
  useEffect(() => {
    if (!voiceMode) return;
    
    const timer = setTimeout(() => {
      const welcomeText = language === 'hi' 
        ? 'हमारे बारे में पेज। आप कह सकते हैं - होम, कार्ट, चेकआउट, या हमारा लक्ष्य।'
        : 'About us page. You can say - home, cart, checkout, or our aim.';
      speak(welcomeText);
    }, 2000);

    return () => clearTimeout(timer);
  }, [language, speak, voiceMode]);

  const teamMembers = [
    {
      name: "Anand Venukrishnan",
      role: "Co-Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Passionate about inclusive technology and accessibility. 10+ years experience in fintech and product development.",
      linkedin: "#",
      github: "#",
      email: "anand@voicepay.in"
    },
    {
      name: "Mohammed Shadab",
      role: "Co-Founder & CTO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Expert in voice technology and AI. Former Google engineer with expertise in speech recognition and natural language processing.",
      linkedin: "#",
      github: "#",
      email: "shadab@voicepay.in"
    },
    {
      name: "Hiten Raj Singh",
      role: "Co-Founder & Head of Design",
      image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=400&h=400&fit=crop&crop=face",
      bio: "UX advocate focused on accessibility and inclusive design. Expert in creating intuitive interfaces for diverse user needs.",
      linkedin: "#",
      github: "#",
      email: "hiten@voicepay.in"
    }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "Empathy First",
      description: "Every feature we build starts with understanding real human needs and challenges."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Inclusive Innovation",
      description: "Technology should work for everyone, not just the digitally privileged."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Excellence & Trust",
      description: "We maintain the highest standards of security, reliability, and user experience."
    }
  ];

  const stories = [
    {
      title: "Priya's Independence",
      story: "As a visually impaired teacher, VoicePay gave me the confidence to handle my finances independently. Now I can pay bills, send money to family, and shop online—all with just my voice.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      title: "Rural Digital Inclusion",
      story: "In my village, many elderly residents couldn't use smartphone apps. VoicePay in Hindi helped them join the digital economy and receive government benefits directly.",
      avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face"
    },
    {
      title: "Secure & Trusted",
      story: "The voice authentication gives me peace of mind. Even with limited mobility, I can make secure payments quickly and safely from anywhere.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <section className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <Link to="/our-aim">
            <Button variant="ghost" className="mb-6 hover:bg-blue-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Our Aim
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              About <span className="text-blue-600">VoicePay</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              The passionate team behind India's most inclusive payment platform
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
              <p className="text-xl mb-6">
                VoicePay was born from a simple observation: millions of Indians struggle with digital payments not because they lack the need, but because current systems weren't designed with them in mind.
              </p>
              <p className="text-lg mb-6">
                When we met Priya, a visually impaired teacher who had to rely on others for simple transactions, we knew we had to act. Her story, along with countless others, inspired us to create a payment platform that truly works for everyone.
              </p>
              <p className="text-lg">
                Today, VoicePay serves thousands of users across India, from rural farmers making their first digital payment to elderly citizens receiving pensions with dignity and independence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">Our Values</h2>
            <p className="text-xl text-gray-600 text-center mb-12">The principles that guide everything we do</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-gray-200">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stories of Empowerment */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">Stories of Empowerment</h2>
            <p className="text-xl text-gray-600 text-center mb-12">Real people, real impact. See how VoicePay is transforming lives across India.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stories.map((story, index) => (
                <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-gray-200">
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src={story.avatar} 
                        alt="User"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <h3 className="text-lg font-bold text-gray-800">{story.title}</h3>
                    </div>
                    <p className="text-gray-600 italic leading-relaxed">"{story.story}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card 
                  key={index} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-gray-200"
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                      <p className="text-orange-600 font-medium">{member.role}</p>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                    <div className="flex space-x-3 pt-2">
                      <a 
                        href={member.linkedin} 
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                      >
                        <Linkedin className="h-4 w-4 text-blue-600" />
                      </a>
                      <a 
                        href={member.github}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Github className="h-4 w-4 text-gray-600" />
                      </a>
                      <a 
                        href={`mailto:${member.email}`}
                        className="p-2 bg-orange-100 hover:bg-orange-200 rounded-full transition-colors"
                      >
                        <Mail className="h-4 w-4 text-orange-600" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Mission Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-orange-100">
            Experience the future of e-commerce today. Shop with your voice and be part of the accessibility revolution.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-3 text-lg font-semibold border border-white"
          >
            Try VoicePay Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
