export interface NewSelfStoryConfig {
  title: string;
  purpose: string;
  videoUrl: string;
}

export const NEW_SELF_STORY_CONFIG = {
  greatness: {
    title: "Greatness",
    purpose: "A transformative journey of self-discovery and empowerment that awakens your inner potential. This path is about recognizing your inherent worth and capabilities, transcending past limitations, and stepping into your authentic power. You are learning to embrace your unique gifts, cultivate self-confidence, and manifest your highest potential in all areas of life. This journey encourages you to dream bigger, believe in yourself more deeply, and create the extraordinary life you were meant to live.",
    videoUrl: "https://www.youtube.com/"
  },
  chosenness: {
    title: "Chosenness",
    purpose: "Embracing the sacred understanding that you are uniquely chosen and called for a special purpose in this world. This journey is about recognizing your divine worth, understanding that your existence is intentional and meaningful, and stepping into the role you were destined to fulfill. You are learning to trust in your unique path, honor your spiritual calling, and live with the awareness that you are here for a reason greater than yourself.",
    videoUrl: "https://www.youtube.com/"
  },
  atonement: {
    title: "Atonement",
    purpose: "A profound journey of healing, redemption, and transformation from past wounds and experiences. This path is about making peace with your past, forgiving yourself and others, and creating a new narrative of strength and resilience. You are learning to transform pain into wisdom, wounds into wisdom, and emerge from difficult experiences as a more compassionate, understanding, and whole person. This journey is about finding redemption through self-love and inner healing.",
    videoUrl: "https://www.youtube.com/"
  },
  purpose: {
    title: "Purpose",
    purpose: "A meaningful journey of discovering and living your authentic purpose in life. This path is about understanding your unique contribution to the world, aligning your actions with your deepest values, and creating a life that reflects your true calling. You are learning to listen to your inner wisdom, follow your heart's guidance, and make choices that honor your soul's purpose. This journey is about finding meaning in every moment and living a life that matters.",
    videoUrl: "https://www.youtube.com/"
  }
} as const;

export type NewSelfStoryType = keyof typeof NEW_SELF_STORY_CONFIG;

export const getNewSelfStoryConfig = (type: NewSelfStoryType): NewSelfStoryConfig => {
  return NEW_SELF_STORY_CONFIG[type];
}; 