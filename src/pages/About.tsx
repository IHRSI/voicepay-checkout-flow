
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Linkedin, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
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
              Meet Our <span className="text-blue-600">Team</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Three passionate individuals united by a vision of inclusive digital commerce
            </p>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
      </section>

      {/* Company Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Inclusion First</h3>
                <p className="text-gray-600">Every decision we make is evaluated through the lens of accessibility and inclusion.</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Innovation</h3>
                <p className="text-gray-600">We push the boundaries of technology to create solutions that didn't exist before.</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Empathy</h3>
                <p className="text-gray-600">We deeply understand and care about the challenges our users face every day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Get in Touch</h2>
            <p className="text-xl mb-8">
              Have questions, feedback, or want to collaborate? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 transition-colors"
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
              <Link to="/">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Try VoicePay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
