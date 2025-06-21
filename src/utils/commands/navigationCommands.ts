
export const handleNavigationCommands = (transcript: string) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing navigation command:', cleanTranscript);
  
  // Home navigation
  if (cleanTranscript.includes('home') || cleanTranscript.includes('होम') || 
      cleanTranscript.includes('back to home') || cleanTranscript.includes('main page')) {
    console.log('Navigating to home');
    window.location.href = '/';
    return true;
  }
  
  // Cart navigation
  if (cleanTranscript.includes('cart') || cleanTranscript.includes('कार्ट') || 
      cleanTranscript.includes('shopping cart') || cleanTranscript.includes('my cart')) {
    console.log('Navigating to cart');
    window.location.href = '/cart';
    return true;
  }

  // Checkout navigation
  if (cleanTranscript.includes('checkout') || cleanTranscript.includes('चेकआउट') ||
      cleanTranscript.includes('check out') || cleanTranscript.includes('place order')) {
    console.log('Navigating to checkout');
    window.location.href = '/checkout';
    return true;
  }

  // About page navigation
  if (cleanTranscript.includes('about') || cleanTranscript.includes('अबाउट') ||
      cleanTranscript.includes('about us') || cleanTranscript.includes('information')) {
    console.log('Navigating to about');
    window.location.href = '/about';
    return true;
  }

  // Our Aim page navigation
  if (cleanTranscript.includes('our aim') || cleanTranscript.includes('हमारा लक्ष्य') ||
      cleanTranscript.includes('aim') || cleanTranscript.includes('goal') ||
      cleanTranscript.includes('mission') || cleanTranscript.includes('vision')) {
    console.log('Navigating to our aim');
    window.location.href = '/our-aim';
    return true;
  }

  return false;
};
