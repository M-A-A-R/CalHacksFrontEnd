import React, { useState, useEffect } from 'react'

/**
 * ScrollToTopButton Component
 * 
 * A floating button that appears when the user scrolls down the page.
 * Clicking it smoothly scrolls back to the top.
 * 
 * Features:
 * - Appears when scroll position > 500px
 * - Smooth fade in/out animation
 * - Red theme to match notebook design
 * - Fixed position at bottom-right
 * - Smooth scroll behavior
 */
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Monitor scroll position and show/hide button
  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down more than 500px
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsVisible(scrollTop > 500)
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll)
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /**
   * Scroll to top smoothly
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Don't render if not visible
  if (!isVisible) {
    return null
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-notebook-red text-white rounded-full shadow-lg hover:bg-notebook-red-hover transition-all duration-300 flex items-center justify-center group animate-fade-in"
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      {/* Up Arrow Icon */}
      <svg 
        className="w-6 h-6 group-hover:transform group-hover:-translate-y-1 transition-transform" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  )
}

export default ScrollToTopButton

