
export const handleNavigationCommands = (transcript: string) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Checking navigation command:', cleanTranscript);
  
  // Home navigation
  if (cleanTranscript.includes('home') || cleanTranscript.includes('होम') || cleanTranscript === 'home') {
    console.log('Navigating to home');
    setTimeout(() => window.location.href = '/', 500);
    return true;
  }
  
  // Cart navigation
  if (cleanTranscript.includes('cart') || cleanTranscript.includes('कार्ट') || cleanTranscript === 'cart') {
    console.log('Navigating to cart');
    setTimeout(() => window.location.href = '/cart', 500);
    return true;
  }

  // Checkout navigation
  if (cleanTranscript.includes('checkout') || cleanTranscript.includes('चेकआउट')) {
    console.log('Navigating to checkout');
    setTimeout(() => window.location.href = '/checkout', 500);
    return true;
  }

  // Global cancellation command
  if (cleanTranscript.includes('cancel') || cleanTranscript.includes('रद्द') || cleanTranscript.includes('कैंसल')) {
    console.log('Cancelling - going to cart');
    setTimeout(() => window.location.href = '/cart', 500);
    return true;
  }

  return false;
};
