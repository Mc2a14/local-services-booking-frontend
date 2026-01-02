import { apiRequest } from './auth'

/**
 * Checks the completion status of business setup
 * @returns {Promise<{isComplete: boolean, steps: Array, progress: number}>}
 */
export async function checkSetupProgress() {
  try {
    // Fetch all required data in parallel
    const [providerData, servicesData, availabilityData, faqsData] = await Promise.all([
      apiRequest('/providers/me').catch(() => ({ provider: null })),
      apiRequest('/services').catch(() => ({ services: [] })),
      apiRequest('/availability').catch(() => ({ availability: [] })),
      apiRequest('/faqs').catch(() => ({ faqs: [] }))
    ])

    const provider = providerData.provider
    const services = servicesData.services || []
    const availability = availabilityData.availability || []
    const faqs = faqsData.faqs || []

    // Check each step
    const steps = [
      {
        id: 'profile',
        number: 1,
        title: 'Business Information',
        description: 'Add your business name and description',
        completed: !!(provider?.business_name && provider?.description && 
                     provider.business_name.trim() && provider.description.trim()),
        route: '/provider-profile',
        section: 'profile',
        helperText: 'Your business name and description help customers find and understand what you offer. Add a clear, compelling description of your services.'
      },
      {
        id: 'services',
        number: 2,
        title: 'Add Services',
        description: 'Create at least one service',
        completed: services.length > 0,
        route: '/manage-services',
        section: null,
        helperText: 'Services are what customers can book. Add at least one service with clear pricing and description to get started.'
      },
      {
        id: 'hours',
        number: 3,
        title: 'Set Business Hours',
        description: 'Define when you\'re available',
        completed: availability.length > 0 && availability.some(a => a.is_available),
        route: '/availability',
        section: null,
        helperText: 'Setting your business hours tells customers when they can book appointments. Set at least one day with available hours.'
      },
      {
        id: 'faqs',
        number: 4,
        title: 'Add FAQs',
        description: 'Create at least 3 frequently asked questions',
        completed: faqs.length >= 3,
        route: '/manage-faqs',
        section: null,
        helperText: 'FAQs help customers understand your services and answer common questions. Add at least 3 FAQs to improve customer experience.'
      },
      {
        id: 'ready',
        number: 5,
        title: 'Your Atencio Assistant is Ready!',
        description: 'Share your booking page with customers',
        completed: false, // This is the final step, always show when others are complete
        route: null,
        section: null,
        helperText: null
      }
    ]

    // Check if all required steps are complete
    const requiredSteps = steps.slice(0, 4) // First 4 steps are required
    const completedSteps = requiredSteps.filter(s => s.completed).length
    const isComplete = requiredSteps.every(s => s.completed)

    // Mark ready step as complete if all others are done
    if (isComplete) {
      steps[4].completed = true
    }

    const progress = Math.round((completedSteps / requiredSteps.length) * 100)

    return {
      isComplete,
      steps,
      progress,
      completedSteps,
      totalSteps: requiredSteps.length
    }
  } catch (error) {
    console.error('Error checking setup progress:', error)
    // Return default incomplete state
    return {
      isComplete: false,
      steps: [],
      progress: 0,
      completedSteps: 0,
      totalSteps: 4
    }
  }
}

