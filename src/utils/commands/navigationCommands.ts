
export const handleNavigationCommands = (transcript: string) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing navigation command:', cleanTranscript);
  
  // Home navigation
  if (cleanTranscript.includes('home') || cleanTranscript.includes('होम')) {
    console.log('Navigating to home');
    window.location.href = '/';
    return true;
  }
  
  // Cart navigation
  if (cleanTranscript.includes('cart') || cleanTranscript.includes('कार्ट')) {
    console.log('Navigating to cart');
    window.location.href = '/cart';
    return true;
  }

  // Checkout navigation
  if (cleanTranscript.includes('checkout') || cleanTranscript.includes('चेकआउट')) {
    console.log('Navigating to checkout');
    window.location.href = '/checkout';
    return true;
  }

  // About page navigation
  if (cleanTranscript.includes('about') || cleanTranscript.includes('अबाउट')) {
    console.log('Navigating to about');
    window.location.href = '/about';
    return true;
  }

  return false;
};
