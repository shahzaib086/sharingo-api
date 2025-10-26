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
        question: 'How do I list an item for sharing on Sharingo?',
        answer: 'You can list an item by going to your profile, clicking on "My Items", and then "Add New Item". Fill in the details including photos, description, and availability dates. Once published, other users can browse and request to borrow your item.',
        sequence: 1,
        isActive: true,
      },
      {
        question: 'How do I request to borrow an item?',
        answer: 'Browse available items and click on any item you\'re interested in. Click the "Request to Borrow" button, select your preferred dates, and add any message to the owner. The owner will be notified and can approve or decline your request.',
        sequence: 2,
        isActive: true,
      },
      {
        question: 'Is there a fee for borrowing items?',
        answer: 'The fee structure depends on the item and the owner\'s settings. Some items are free to borrow, while others may have a small fee. All fees are clearly displayed before you make a request. Sharingo may charge a small platform fee.',
        sequence: 3,
        isActive: true,
      },
      {
        question: 'How do I return an item to the owner?',
        answer: 'When the borrowing period ends, coordinate with the owner to return the item. After the owner confirms receipt, you will receive a notification and can rate the experience. Make sure items are returned in the same condition you received them.',
        sequence: 4,
        isActive: true,
      },
      {
        question: 'What happens if an item gets damaged or lost?',
        answer: 'Users are responsible for the items they borrow. We recommend documenting the item\'s condition before borrowing. In case of damage or loss, you\'ll need to work with the owner to resolve the issue. Sharingo\'s support team can help mediate disputes if needed.',
        sequence: 5,
        isActive: true,
      },
      {
        question: 'How do I ensure my listed items are safe?',
        answer: 'We have a verification system for all users. Only verified users can list and borrow items. We also allow users to rate and review each other. Always check the borrower\'s profile and ratings before approving a request. You have the right to decline any request you\'re not comfortable with.',
        sequence: 6,
        isActive: true,
      },
      {
        question: 'How does user verification work?',
        answer: 'New users need to verify their phone number with an OTP (One-Time Password) during signup. Additional verification like profile picture, email verification, and social media linking can help build trust. Verified users get a badge on their profile.',
        sequence: 7,
        isActive: true,
      },
      {
        question: 'Can I change my borrowing request dates?',
        answer: 'You can request to modify dates after submitting a request, but the owner needs to approve the changes. If your request is already approved, contact the owner directly through the app\'s messaging system to discuss date changes.',
        sequence: 8,
        isActive: true,
      },
      {
        question: 'How can I contact support?',
        answer: 'You can contact Sharingo support through the app\'s Help section, email us at support@sharingo.com, or reach out via WhatsApp. Our support team typically responds within 24 hours and can help with account issues, disputes, or general questions.',
        sequence: 9,
        isActive: true,
      },
      {
        question: 'Is my personal information safe on Sharingo?',
        answer: 'Yes, we take data security seriously. All your personal information is encrypted and stored securely. We never share your data with third parties without your consent. Only necessary information is shown to other users when you interact on the platform.',
        sequence: 10,
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