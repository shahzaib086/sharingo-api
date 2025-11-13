export enum UserStatus {
  ACTIVE = '1',
  INACTIVE = '0',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum OnboardingStep {
  ACCOUNT_CREATION = 1,
  OTP_VERIFICATION = 2,
  PROFILE_COMPLETION = 3,
}