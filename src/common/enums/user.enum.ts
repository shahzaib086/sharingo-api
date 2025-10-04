export enum UserStatus {
  ACTIVE = '1',
  INACTIVE = '0',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum RelationshipStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
} 

export enum OnboardingStep {
  ACCOUNT_CREATION = 1,
  OTP_VERIFICATION = 2,
  SELF_STORY_CREATION = 3,
  PROFILE_COMPLETION = 4,
}

export enum OldSelfStory {
  WORTHLESSNESS = 'worthlessness',
  ABANDONMENT = 'abandonment',
  REJECTION = 'rejection',
  ABUSE = 'abuse',
}

export enum NewSelfStory {
  GREATNESS = 'greatness',
  CHOSENNESS = 'chosenness',
  ATONEMENT = 'atonement',
  PURPOSE = 'purpose',
}

export enum QuestionGroup {
  GROUP_1 = 'group_1',
  GROUP_2 = 'group_2',
  GROUP_3 = 'group_3',
  GROUP_4 = 'group_4',
  GROUP_5 = 'group_5',
  GROUP_6 = 'group_6',
  GROUP_7 = 'group_7'
}