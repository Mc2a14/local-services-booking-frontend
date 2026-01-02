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

    // Check each step (using translation keys)
    const steps = [
      {
        id: 'profile',
        number: 1,
        titleKey: 'setupProgress.step1Title',
        descriptionKey: 'setupProgress.step1Desc',
        completed: !!(provider?.business_name && provider?.description && 
                     provider.business_name.trim() && provider.description.trim()),
        route: '/provider-profile',
        section: 'profile',
        helperTextKey: 'setupProgress.step1Helper'
      },
      {
        id: 'services',
        number: 2,
        titleKey: 'setupProgress.step2Title',
        descriptionKey: 'setupProgress.step2Desc',
        completed: services.length > 0,
        route: '/manage-services',
        section: null,
        helperTextKey: 'setupProgress.step2Helper'
      },
      {
        id: 'hours',
        number: 3,
        titleKey: 'setupProgress.step3Title',
        descriptionKey: 'setupProgress.step3Desc',
        completed: availability.length > 0 && availability.some(a => a.is_available),
        route: '/availability',
        section: null,
        helperTextKey: 'setupProgress.step3Helper'
      },
      {
        id: 'faqs',
        number: 4,
        titleKey: 'setupProgress.step4Title',
        descriptionKey: 'setupProgress.step4Desc',
        completed: faqs.length >= 3,
        route: '/manage-faqs',
        section: null,
        helperTextKey: 'setupProgress.step4Helper'
      },
      {
        id: 'ready',
        number: 5,
        titleKey: 'setupProgress.step5Title',
        descriptionKey: 'setupProgress.step5Desc',
        completed: false, // This is the final step, always show when others are complete
        route: null,
        section: null,
        helperTextKey: null
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

