import { DataSource } from 'typeorm';
import { Faq } from '../../entities/faq.entity';

export class FaqSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run() {
    const faqRepository = this.dataSource.getRepository(Faq);

    // Truncate the FAQs table before seeding
    await faqRepository.clear();
    console.log('✅ FAQs table truncated successfully');

    const faqs = [
      {
        question: 'How do I reset my password?',
        answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page. Enter your email address and follow the instructions sent to your email.',
        sequence: 1,
        isActive: true,
      },
      {
        question: 'How do I verify my phone number?',
        answer: 'After signing up, you will receive an OTP (One-Time Password) on your phone number. Enter this OTP in the verification screen to verify your phone number.',
        sequence: 2,
        isActive: true,
      },
      {
        question: 'Can I change my profile picture?',
        answer: 'Yes, you can update your profile picture by going to your profile settings and using the "Update Profile" feature. Supported formats are JPG, PNG, and GIF.',
        sequence: 3,
        isActive: true,
      },
      {
        question: 'What should I do if I forget my email?',
        answer: 'If you forget your email address, please contact our support team with your phone number and we will help you recover your account.',
        sequence: 4,
        isActive: true,
      },
      {
        question: 'How do I update my personal information?',
        answer: 'You can update your personal information by going to your profile settings and using the "Update Profile" feature. All fields are optional and you can update them anytime.',
        sequence: 5,
        isActive: true,
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes, we take data security seriously. All your personal information is encrypted and stored securely. We never share your data with third parties without your consent.',
        sequence: 6,
        isActive: true,
      },
      {
        question: 'How can I contact support?',
        answer: 'You can contact our support team through the contact form on our website or by sending an email to support@sharingo.com. We typically respond within 24 hours.',
        sequence: 7,
        isActive: true,
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can delete your account from your profile settings. Please note that this action is irreversible and all your data will be permanently deleted.',
        sequence: 8,
        isActive: true,
      },
    ];

    try {
      await faqRepository.save(faqs);
      console.log(`✅ Seeded ${faqs.length} FAQs successfully`);
    } catch (error) {
      console.error('❌ Error seeding FAQs:', error);
      throw error;
    }
  }
} 