
export const handleNavigationCommands = (transcript: string) => {
  // Global navigation commands
  if (transcript.includes('home') || transcript.includes('होम')) {
    setTimeout(() => window.location.href = '/', 500);
    return true;
  }
  
  if (transcript.includes('cart') || transcript.includes('कार्ट')) {
    setTimeout(() => window.location.href = '/cart', 500);
    return true;
  }

  // Global cancellation command
  if (transcript.includes('cancel') || transcript.includes('रद्द') || transcript.includes('कैंसल')) {
    setTimeout(() => window.location.href = '/cart', 500);
    return true;
  }

  return false;
};
